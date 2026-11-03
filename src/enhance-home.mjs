// Build-time enhancements: selectable HTML slides and the user-supplied favicon.
// No external services or client-side content rendering are required.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist');
const version = '20261103';
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arrow = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>';
const button = (text, href, style = 'red') => `<a class="button button--${style}" href="${href}">${esc(text)}${arrow}</a>`;
const marker = name => `<img class="focus-device focus-${name}" src="/assets/brand/napco-icon.png" width="300" height="300" alt="" aria-hidden="true">`;
const slides = [
  {
    id: 'industries', label: 'Industries', eyebrow: 'Across industries',
    heading: 'DIFFERENT<br>INDUSTRIES.<br><span class="red">ONE PARTNER.</span>',
    copy: 'From automotive and electronics to packaging and engineered wood, explore bonding, sealing and coating solutions around your application.',
    image: 'materials', width: 1254, height: 525,
    alt: 'Conceptual junction of metal, glass, wood and concrete, illustrating different material requirements.',
    primary: ['Explore industries', '/solutions/industrial-solutions/'],
    secondary: ['Construction', '/solutions/construction-solutions/']
  },
  {
    id: 'innovation', label: 'Innovation', eyebrow: 'Innovation strategy',
    heading: 'MATERIAL<br>SCIENCE.<br><span class="red">IN ACTION.</span>',
    copy: 'NAPCO’s research and development starts with customer challenges, connecting material science, formulation and application thinking.',
    image: 'technical', width: 970, height: 295,
    alt: 'Conceptual close-up of a pipette and droplet on a metal surface; not a documented NAPCO laboratory test.',
    primary: ['Innovation strategy', '/innovation/innovation-strategy/'],
    secondary: ['Technical resources', '/resource-hub/']
  }
];
const renderSlide = (s, i) => `<div class="hero hero-slide hero--${s.id}" id="hero-${s.id}" role="group" aria-roledescription="slide" aria-label="${i + 2} of 3: ${s.label}" aria-hidden="true" inert data-hero-slide>
<div class="hero-visual"><img class="hero-image" src="/assets/${s.image}.webp" srcset="/assets/${s.image}-640.webp 640w, /assets/${s.image}.webp ${s.width}w" sizes="(max-width: 700px) 100vw, 68vw" width="${s.width}" height="${s.height}" alt="${esc(s.alt)}" loading="eager" fetchpriority="low" decoding="async"><div class="hero-fade"></div>${marker(s.id)}</div>
<div class="container hero-content"><p class="eyebrow"><span></span>${s.eyebrow}</p><h2 class="hero-title">${s.heading}</h2><p>${esc(s.copy)}</p><div class="button-row">${button(...s.primary)}${button(...s.secondary, 'outline')}</div><p class="hero-signature">WE MAKE IT STICK!</p></div></div>`;
let home = await fs.readFile(path.join(out, 'index.html'), 'utf8');
const match = home.match(/<section class="hero" aria-label="NAPCO application-led solutions">([\s\S]*?)<\/section>/);
if (!match) throw new Error('Expected original NAPCO homepage hero not found. Review the template before applying this enhancement.');
const controls = `<div class="container carousel-controls" data-carousel-controls hidden>
<button class="carousel-rotation" type="button" data-carousel-rotation aria-label="Pause automatic banner rotation"><span data-rotation-symbol aria-hidden="true">Ⅱ</span><span data-rotation-label>Pause</span></button>
<div class="carousel-selectors" role="group" aria-label="Choose a banner">${['Applications','Industries','Innovation'].map((name, i) => `<button type="button" data-carousel-go="${i}" aria-controls="hero-${['applications','industries','innovation'][i]}" aria-label="Show banner ${i + 1}: ${name}"${i === 0 ? ' aria-current="true"' : ''}><span class="carousel-number">0${i + 1}</span><span class="carousel-label">${name}</span></button>`).join('')}</div>
<div class="carousel-arrows"><button type="button" data-carousel-prev aria-label="Previous banner">${arrow}</button><button type="button" data-carousel-next aria-label="Next banner">${arrow}</button></div></div>`;
const carousel = `<section class="home-carousel" role="region" aria-roledescription="carousel" aria-label="NAPCO applications, industries and innovation" data-home-carousel data-interval="7000">
${controls}<div class="carousel-track"><div class="hero hero-slide is-active" id="hero-applications" role="group" aria-roledescription="slide" aria-label="1 of 3: Applications" aria-hidden="false" data-hero-slide>${match[1]}</div>${slides.map(renderSlide).join('')}</div>
<p class="carousel-status visually-hidden" role="status" aria-live="polite" aria-atomic="true" data-carousel-status></p></section>`;
home = home.replace(match[0], carousel).replace('</head>', `<link rel="stylesheet" href="/assets/carousel.css?v=${version}"><script src="/assets/carousel.js?v=${version}" defer></script></head>`);
await fs.writeFile(path.join(out, 'index.html'), home);

// The original PNG and resized derivatives are encoded losslessly for repository transport.
// Actual PNG/ICO files are emitted into dist; browsers do not consume the encoded source.
const favicon = JSON.parse(await fs.readFile(path.join(root, 'content/favicon.json'), 'utf8'));
for (const asset of favicon.assets) {
  if (!/^assets\/brand\/[a-z0-9-]+\.png$/.test(asset.path)) throw new Error('Invalid favicon destination');
  const encoded = Buffer.from(asset.base64, 'base64');
  const bytes = asset.encoding === 'gzip' ? gunzipSync(encoded) : encoded;
  if (createHash('sha256').update(bytes).digest('hex') !== asset.sha256) throw new Error(`Favicon checksum mismatch: ${asset.path}`);
  await fs.writeFile(path.join(out, asset.path), bytes);
}
const frames = [16, 32, 48].map(size => ({size, bytes: Buffer.from(favicon.assets.find(a => a.path.endsWith(`favicon-${size}.png`)).base64, 'base64')}));
const icoHeader = Buffer.alloc(6 + frames.length * 16);
icoHeader.writeUInt16LE(1, 2); icoHeader.writeUInt16LE(frames.length, 4);
let offset = icoHeader.length;
frames.forEach(({size, bytes}, i) => {
  const p = 6 + i * 16;
  icoHeader[p] = size; icoHeader[p + 1] = size;
  icoHeader.writeUInt16LE(1, p + 4); icoHeader.writeUInt16LE(32, p + 6);
  icoHeader.writeUInt32LE(bytes.length, p + 8); icoHeader.writeUInt32LE(offset, p + 12);
  offset += bytes.length;
});
await fs.writeFile(path.join(out, 'favicon.ico'), Buffer.concat([icoHeader, ...frames.map(f => f.bytes)]));
const faviconTags = `<link rel="icon" href="/favicon.ico?v=${version}" sizes="16x16 32x32 48x48"><link rel="icon" type="image/png" sizes="32x32" href="/assets/brand/favicon-32.png?v=${version}"><link rel="icon" type="image/png" sizes="16x16" href="/assets/brand/favicon-16.png?v=${version}"><link rel="apple-touch-icon" sizes="180x180" href="/assets/brand/apple-touch-icon.png?v=${version}">`;
let htmlCount = 0;
async function addIcons(dir) {
  for (const entry of await fs.readdir(dir, {withFileTypes: true})) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await addIcons(file);
    else if (entry.name.endsWith('.html')) {
      const html = await fs.readFile(file, 'utf8');
      await fs.writeFile(file, html.replace('</head>', `${faviconTags}<script src="/assets/focus-motion.js?v=20261103-1" defer></script></head>`));
      htmlCount++;
    }
  }
}
await addIcons(out);
console.log(`Added three homepage slides and the approved favicon to ${htmlCount} HTML pages.`);