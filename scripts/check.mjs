import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const manifest=JSON.parse(await fs.readFile(path.join(root,'docs/build-manifest.json'),'utf8'));
let errors=[];let links=0;let images=0;const external=new Set();
const exists=async p=>{try{await fs.access(p);return true;}catch{return false;}};
for(const entry of manifest.routes){
 const file=path.join(dist,entry.url.slice(1),'index.html');
 const html=await fs.readFile(file,'utf8');
 if((html.match(/<h1[\s>]/g)||[]).length!==1) errors.push(`${entry.url}: expected one H1`);
 if(!html.includes('<title>')||!html.includes('name="description"'))errors.push(`${entry.url}: missing metadata`);
 if(manifest.mode==='preview'&&!html.includes('content="noindex,nofollow,noarchive"')) errors.push(`${entry.url}: missing noindex`);
 for(const [,tag] of html.matchAll(/(<img\b[^>]+>)/g)){images++;if(!/\balt="/.test(tag))errors.push(`${entry.url}: image without alt`);if(!/\bwidth="/.test(tag)||!/\bheight="/.test(tag))errors.push(`${entry.url}: image dimensions missing`);}
 for(const [,attr,url] of html.matchAll(/\b(href|src)="([^"]*)"/g)){
  if(!url||url==='#'){errors.push(`${entry.url}: empty ${attr}`);continue;}
  if(/^https?:/.test(url)){external.add(url);continue;}
  if(/^(mailto:|tel:|data:)/.test(url))continue;
  const target=new URL(url.replace(/&amp;/g,'&'),'https://preview.example'+entry.url);
  const relative=decodeURIComponent(target.pathname); let local=path.join(dist,relative);
  if(relative.endsWith('/'))local=path.join(local,'index.html');
  if(!await exists(local))errors.push(`${entry.url}: missing ${url}`);
  else if(target.hash){let destination=await fs.readFile(local,'utf8');if(!destination.includes(`id="${target.hash.slice(1)}"`))errors.push(`${entry.url}: missing anchor ${url}`);}
  links++;
 }
}
const result={checkedAt:new Date().toISOString(),mode:manifest.mode,routes:manifest.routes.length,localReferencesChecked:links,imageElementsChecked:images,errors,externalLinks:[...external].sort(),externalLinksNetworkTested:false};
await fs.writeFile(path.join(root,'docs/static-check-results.json'),JSON.stringify(result,null,2));
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log(`PASS: ${manifest.routes.length} routes; ${links} local references; ${images} image elements. ${external.size} external links inventoried, not network-tested.`);
