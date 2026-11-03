import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const out = path.resolve('dist');
const html = await fs.readFile(path.join(out,'index.html'),'utf8');
assert.equal((html.match(/data-hero-slide/g)||[]).length,3,'Exactly three homepage slides');
assert.equal((html.match(/<h1[ >]/g)||[]).length,1,'Keep one homepage H1');
assert.equal((html.match(/aria-roledescription="slide"/g)||[]).length,3);
assert.equal((html.match(/aria-hidden="true" inert data-hero-slide/g)||[]).length,2);
assert.equal((html.match(/data-carousel-go="[012]"/g)||[]).length,3);
assert.match(html,/data-interval="7000"/);
assert.match(html,/data-carousel-rotation/);
assert.match(html,/href="\/solutions\/industrial-solutions\/"/);
assert.match(html,/href="\/innovation\/innovation-strategy\/"/);
for (const text of ['BIG IDEAS.','DIFFERENT<br>INDUSTRIES.','MATERIAL<br>SCIENCE.','BUILT FOR<br><span class="red">COMPLEX','PERFORMANCE ADHESIVES,']) assert.ok(html.includes(text),`Missing requested content: ${text}`);
const bundle=JSON.parse(await fs.readFile('content/favicon.json','utf8'));
for(const asset of bundle.assets){
  const bytes=await fs.readFile(path.join(out,asset.path));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);
  assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10]);
}
const ico=await fs.readFile(path.join(out,'favicon.ico'));
assert.equal(ico.readUInt16LE(2),1);assert.equal(ico.readUInt16LE(4),3);
let count=0;
async function visit(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){
 const f=path.join(dir,e.name);if(e.isDirectory())await visit(f);else if(e.name.endsWith('.html')){
  const page=await fs.readFile(f,'utf8');assert.match(page,/rel="icon".*favicon\.ico/);assert.match(page,/apple-touch-icon/);count++;
 }
}}
await visit(out);
assert.ok(count>=21);
console.log(`Homepage checks passed: 3 slides, one H1, 7-second interval; favicon on ${count} HTML pages; original icon checksum verified.`);
