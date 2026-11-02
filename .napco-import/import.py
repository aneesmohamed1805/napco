"""One-time import of the user-approved NAPCO static review package.

The text bundle is authenticated against a local SHA-256 recorded before upload.
Media bytes are fetched once, checked, and committed locally; the website never
uses these temporary transfer URLs. This script does not deploy any website.
"""
from __future__ import annotations

import base64
import bz2
import hashlib
import json
import os
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath
from urllib.parse import urlparse

ROOT = Path.cwd().resolve()
STAGING = ROOT / '.napco-import'
BUNDLE_SHA = '0f632bdef64d618d5bf74a94cba9633378adc320a42241879068316947a7946f'
EXPECTED_TEXT_PATHS = {
    '.gitignore', '.nvmrc', 'README.md', 'package.json',
    'content/articles/_template.json',
    'content/articles/wood-floor-adhesives-2019.json',
    'content/pages.json', 'content/site.json',
    'docs/ARTICLE-HANDOFF.md', 'docs/DECISIONS.md', 'docs/QA.md',
    'docs/SOURCES.md', 'docs/browser-check-results.json',
    'docs/build-manifest.json', 'docs/http-check-results.json',
    'docs/static-check-results.json', 'public/assets/asset-manifest.json',
    'public/assets/site.css', 'public/assets/site.js',
    'scripts/check.mjs', 'scripts/serve.mjs', 'src/build.mjs',
}


def checked_path(name: str) -> Path:
    path = PurePosixPath(name)
    if path.is_absolute() or '..' in path.parts or '.git' in path.parts:
        raise ValueError(f'Unsafe destination: {name}')
    dest = ROOT.joinpath(*path.parts)
    if not dest.resolve().is_relative_to(ROOT):
        raise ValueError(f'Destination outside repository: {name}')
    if any(p.is_symlink() for p in [dest, *dest.parents] if p != ROOT.parent):
        raise ValueError(f'Symlink destination: {name}')
    return dest


def record(name: str, data: bytes) -> dict:
    return {'path': name, 'bytes': len(data),
            'sha256': hashlib.sha256(data).hexdigest()}


def write_file(name: str, data: bytes) -> dict:
    dest = checked_path(name)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(data)
    return record(name, data)


def import_image(item: dict) -> dict:
    name, url = item['path'], item['url']
    path = PurePosixPath(name)
    if not name.startswith('public/assets/') or path.suffix not in {'.png', '.webp'}:
        raise ValueError(f'Unexpected media destination: {name}')
    parsed = urlparse(url)
    if parsed.scheme != 'https' or parsed.hostname != 'd2jqrm6oza8nb6.cloudfront.net':
        raise ValueError(f'Unexpected transfer host for {name}')
    if not (0 < item['bytes'] < 5_000_000) or len(item['sha256']) != 64:
        raise ValueError(f'Invalid expected media integrity: {name}')
    data = b''
    for attempt in range(3):
        try:
            request = urllib.request.Request(url, headers={'User-Agent': 'NAPCO-Review-Import/1.0'})
            with urllib.request.urlopen(request, timeout=40) as response:
                data = response.read(5_000_001)
            break
        except Exception:
            if attempt == 2:
                raise RuntimeError(f'Media transfer failed: {name}') from None
            time.sleep(2 * (attempt + 1))
    if len(data) != item['bytes'] or hashlib.sha256(data).hexdigest() != item['sha256']:
        raise ValueError(f'Media integrity mismatch: {name}')
    if path.suffix == '.png' and not data.startswith(b'\x89PNG\r\n\x1a\n'):
        raise ValueError(f'Invalid PNG signature: {name}')
    if path.suffix == '.webp' and not (data[:4] == b'RIFF' and data[8:12] == b'WEBP'):
        raise ValueError(f'Invalid WebP signature: {name}')
    result = write_file(name, data)
    print(f'Verified media: {name} ({len(data)} bytes)', flush=True)
    return result


def main() -> None:
    if os.environ.get('GITHUB_REPOSITORY', 'aneesmohamed1805/napco') != 'aneesmohamed1805/napco':
        raise RuntimeError('This importer is restricted to the NAPCO repository.')
    if (ROOT / 'package.json').exists():
        raise RuntimeError('Existing website source detected. Refusing a second initial import.')
    parts = sorted(STAGING.glob('source-*.b64'))
    if [p.name for p in parts] != [f'source-{i:02d}.b64' for i in range(1, 7)]:
        raise ValueError('Expected exactly six source parts.')
    encoded = ''.join(p.read_text(encoding='ascii').strip() for p in parts)
    packed = base64.b64decode(encoded, validate=True)
    if hashlib.sha256(packed).hexdigest() != BUNDLE_SHA:
        raise ValueError('Source bundle checksum mismatch.')
    source = json.loads(bz2.decompress(packed))
    if set(source) != EXPECTED_TEXT_PATHS or not all(isinstance(v, str) for v in source.values()):
        raise ValueError('Unexpected source file list or format.')
    source_records = [write_file(name, text.encode('utf-8')) for name, text in source.items()]
    print(f'Verified and unpacked {len(source_records)} source files.', flush=True)
    images = json.loads((STAGING / 'images.json').read_text(encoding='utf-8'))
    if len(images) != 27 or len({i['path'] for i in images}) != 27:
        raise ValueError('Expected 27 unique media files.')
    with ThreadPoolExecutor(max_workers=4) as pool:
        image_records = list(pool.map(import_image, images))
    report = {
        'repository': 'aneesmohamed1805/napco',
        'verifiedAt': datetime.now(timezone.utc).isoformat(),
        'sourceBundleSHA256': BUNDLE_SHA,
        'sourceFiles': len(source_records),
        'mediaFiles': len(image_records),
        'allMediaMatchPreparedPackage': True,
        'temporaryMediaURLsUsedByWebsite': False,
        'deploymentPerformed': False,
        'files': sorted(source_records + image_records, key=lambda x: x['path']),
    }
    write_file('docs/import-verification.json', (json.dumps(report, indent=2) + '\n').encode('utf-8'))
    print('Imported and verified all 49 prepared package files. No deployment performed.', flush=True)


if __name__ == '__main__':
    main()
