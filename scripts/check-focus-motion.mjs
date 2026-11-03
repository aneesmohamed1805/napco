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
      assert.equal((html.match(/<script src="\/assets\/focus-motion\.js\?v=20261103-1" defer><\/script>/g) || []).length, 1, file);
      pages++;
    }
  }
}
await checkPages(path.join(root, 'dist'));
assert(pages >= 22);

function harness({width = 1440, reduced = false, supported = true, count = 1} = {}) {
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
    getBoundingClientRect: () => ({top: top + 150 + value(), bottom: top + 250 + value()})
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
const start = desktop.value(); desktop.scroll(-200);
assert(desktop.value() > start && Math.abs(desktop.value()) <= 10);
desktop.scroll(600); assert(desktop.value() < 0 && Math.abs(desktop.value()) <= 10);
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
const mobile = harness({width: 390}); mobile.flush(); mobile.scroll(-399);
assert(Math.abs(mobile.value()) <= 5 && mobile.value() > 0);
const still = harness({reduced: true}); still.flush(); still.scroll(-100);
assert(!still.props.has('translate') && still.frames.size === 0);
const unsupported = harness({supported: false}); assert.equal(unsupported.frames.size, 0); assert.equal(unsupported.events.size, 0);
const empty = harness({count: 0}); assert.equal(empty.events.size, 0);
console.log(`Focus motion passed: ${pages} pages; desktop/mobile bounds; original centring; reduced motion; printing; hidden slides/tabs; idle shutdown; static fallbacks.`);
