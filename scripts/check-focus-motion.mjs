import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = await fs.readFile(path.join(root, 'public/assets/focus-motion.js'), 'utf8');
const built = await fs.readFile(path.join(root, 'dist/assets/focus-motion.js'), 'utf8');
assert.equal(built, source, 'Build must publish the tested motion script unchanged');
let pages = 0;
async function checkPages(dir) {
  for (const entry of await fs.readdir(dir, {withFileTypes: true})) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await checkPages(file);
    else if (entry.name.endsWith('.html')) {
      const html = await fs.readFile(file, 'utf8');
      assert.equal((html.match(/<script src="\/assets\/focus-motion\.js\?v=20261103-2" defer><\/script>/g) || []).length, 1, file);
      pages++;
    }
  }
}
await checkPages(path.join(root, 'dist'));
assert(pages >= 22);

function harness({width = 1440, reduced = false, supported = true, count = 1, markerTop = 150} = {}) {
  const events = new Map(), frames = new Map(), observers = [];
  const props = new Map([['transform', 'translate(-50%,-50%)']]);
  let id = 0, time = 0, top = 300;
  const media = new Map();
  const on = (type, callback) => events.set(type, callback);
  const slide = {inert: false, getAttribute: () => 'false'};
  const scene = {getBoundingClientRect: () => ({top, bottom: top + 400, width: 1000, height: 400})};
  const value = () => Number((props.get('translate') || '0 0').split(' ')[1].replace('px', ''));
  const marker = {
    parentElement: scene, closest: () => slide,
    style: {getPropertyValue: key => props.get(key) || '', setProperty: (key, v) => props.set(key, v), removeProperty: key => props.delete(key)},
    getClientRects: () => [{}],
    getBoundingClientRect: () => ({top: top + markerTop + value(), bottom: top + markerTop + 100 + value()})
  };
  const document = {
    hidden: false, documentElement: {clientHeight: 800},
    querySelectorAll: selector => selector === 'img.focus-device' ? (count ? [marker] : []) : [],
    addEventListener: on
  };
  class Observer { constructor(callback) { observers.push(callback); } observe() {} }
  const window = {
    CSS: {supports: () => supported}, innerHeight: 800, innerWidth: width,
    requestAnimationFrame: callback => { frames.set(++id, callback); return id; },
    cancelAnimationFrame: frame => frames.delete(frame),
    addEventListener: on,
    matchMedia: query => {
      if (!media.has(query)) media.set(query, {matches: query.includes('reduce') && reduced, addEventListener(type, callback) { this.callback = callback; }});
      return media.get(query);
    },
    IntersectionObserver: Observer, ResizeObserver: Observer, MutationObserver: Observer
  };
  vm.runInNewContext(source, {window, document, IntersectionObserver: Observer, ResizeObserver: Observer, MutationObserver: Observer});
  function flush() {
    let rounds = 0;
    while (frames.size) {
      assert(++rounds < 200, 'Animation must settle rather than run indefinitely');
      const work = [...frames.values()]; frames.clear(); time += 16;
      work.forEach(callback => callback(time));
    }
  }
  function emit(type) { events.get(type)?.(); }
  function preference(query, matches) { const m = media.get(query); m.matches = matches; m.callback?.({matches}); }
  return {window, document, props, frames, events, slide, observers, value, flush, emit, preference,
    scroll(y) { top = y; emit('scroll'); flush(); }};
}
const desktop = harness(); desktop.flush();
const start = desktop.value();
desktop.scroll(150);
assert(desktop.value() - start >= 11.9, '150px of typical desktop scrolling must visibly move the icon by about 12px');
desktop.scroll(-200);
assert(desktop.value() > start && Math.abs(desktop.value()) <= 32);
desktop.scroll(600); assert(desktop.value() < 0 && Math.abs(desktop.value()) <= 32);
assert.equal(desktop.props.get('transform'), 'translate(-50%,-50%)');
assert.equal(desktop.frames.size, 0);
assert(!desktop.props.has('will-change'));
desktop.scroll(950); assert(!desktop.props.has('translate'), 'Offscreen artwork stays static');
desktop.scroll(0); desktop.slide.inert = true; desktop.observers.forEach(callback => callback()); desktop.flush();
assert(!desktop.props.has('translate'), 'Hidden slide stays static');
desktop.slide.inert = false; desktop.observers.forEach(callback => callback()); desktop.flush();
assert.notEqual(desktop.value(), 0);
desktop.preference('(prefers-reduced-motion: reduce)', true); desktop.flush();
assert(!desktop.props.has('translate'));
desktop.scroll(-100); assert(!desktop.props.has('translate'));
desktop.preference('(prefers-reduced-motion: reduce)', false); desktop.flush();
assert.notEqual(desktop.value(), 0);
desktop.emit('beforeprint'); assert(!desktop.props.has('translate'));
desktop.emit('afterprint'); desktop.flush(); assert.notEqual(desktop.value(), 0);
desktop.preference('print', true); desktop.flush(); assert(!desktop.props.has('translate'));
desktop.preference('print', false); desktop.flush();
desktop.document.hidden = true; desktop.emit('visibilitychange'); assert.equal(desktop.frames.size, 0);
desktop.document.hidden = false; desktop.emit('visibilitychange'); desktop.flush();
const mobile = harness({width: 390}); mobile.flush();
const mobileStart = mobile.value(); mobile.scroll(150);
assert(mobile.value() - mobileStart >= 6.7, '150px of typical mobile scrolling must visibly move the icon by about 6.75px');
mobile.scroll(-399);
assert(Math.abs(mobile.value()) <= 18 && mobile.value() > 0);
for (const width of [320, 390, 700, 701, 1440, 1920]) {
  const h = harness({width}); h.flush();
  const cap = width <= 700 ? 18 : 32;
  h.scroll(-399); assert(Math.abs(h.value() - cap) < 0.03, 'Full positive range must be reachable');
  h.scroll(799); assert(Math.abs(h.value() + cap) < 0.03, 'Full negative range must be reachable');
}
for (const markerTop of [6, 294]) {
  const edge = harness({markerTop}); edge.flush();
  for (const position of [-399, 0, 200, 799]) {
    edge.scroll(position);
    assert(Math.abs(edge.value()) <= 2.001, 'Near-edge markers must retain image-bound constraints');
  }
}
desktop.scroll(-399); desktop.window.innerWidth = 390; desktop.emit('resize'); desktop.flush();
assert(Math.abs(desktop.value()) <= 18, 'Narrowing the viewport applies the mobile cap');
const still = harness({reduced: true}); still.flush(); still.scroll(-100);
assert(!still.props.has('translate') && still.frames.size === 0);
const unsupported = harness({supported: false}); assert.equal(unsupported.frames.size, 0); assert.equal(unsupported.events.size, 0);
const empty = harness({count: 0}); assert.equal(empty.events.size, 0);
console.log(`Focus motion passed: ${pages} pages; visible scroll response; 32px desktop/18px mobile caps; edge constraints; resize; original centring; reduced motion; printing; hidden slides/tabs; idle shutdown; static fallbacks.`);
