'use strict';
// Visible but bounded, scroll-linked translation of the original focus artwork only.
// The independent translate property preserves the existing centring transform.
(() => {
  if (!window.CSS?.supports('translate', '0 1px')) return;
  const markers = [...document.querySelectorAll('img.focus-device')];
  if (!markers.length) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const print = window.matchMedia('print');
  const entries = markers.map(element => ({
    element, scene: element.parentElement,
    slide: element.closest('[data-hero-slide]'),
    originalTranslate: element.style.getPropertyValue('translate'),
    originalHint: element.style.getPropertyValue('will-change'),
    value: 0, target: null, limit: 0, written: false
  }));
  const scenes = [...new Set(entries.map(entry => entry.scene))];
  let frame = null;
  let previous = 0;
  let dirty = true;
  let printing = false;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const disabled = () => reduced.matches || print.matches || printing;
  function restoreProperty(element, name, value) {
    if (value) element.style.setProperty(name, value);
    else element.style.removeProperty(name);
  }
  function reset(entry) {
    if (entry.written) {
      restoreProperty(entry.element, 'translate', entry.originalTranslate);
      restoreProperty(entry.element, 'will-change', entry.originalHint);
    }
    entry.value = 0;
    entry.target = null;
    entry.written = false;
  }
  function stop(resetAll = false) {
    if (frame !== null) window.cancelAnimationFrame(frame);
    frame = null;
    previous = 0;
    if (resetAll) entries.forEach(reset);
  }
  // Scroll handlers only schedule a frame. Read all geometry before any writes.
  function measure() {
    const height = window.innerHeight || document.documentElement.clientHeight;
    const amplitude = window.innerWidth <= 700 ? 18 : 32;
    const rects = new Map(scenes.map(scene => [scene, scene.getBoundingClientRect()]));
    for (const entry of entries) {
      const rect = rects.get(entry.scene);
      const hiddenSlide = entry.slide && (entry.slide.inert || entry.slide.getAttribute('aria-hidden') === 'true');
      if (hiddenSlide || !rect.height || !rect.width || rect.bottom <= 0 || rect.top >= height || !entry.element.getClientRects().length) {
        entry.target = null;
        continue;
      }
      const icon = entry.element.getBoundingClientRect();
      const baseTop = icon.top - entry.value;
      const baseBottom = icon.bottom - entry.value;
      // Never push a bracket outside its image, even at a narrow crop.
      const limit = Math.max(0, Math.min(amplitude, baseTop - rect.top - 4, rect.bottom - baseBottom - 4));
      // Reach a visible offset during normal scrolling, not only at viewport edges.
      const progress = clamp(1.5 * (height / 2 - (rect.top + rect.height / 2)) / ((height + rect.height) / 2), -1, 1);
      entry.limit = limit;
      entry.target = progress * limit;
    }
    dirty = false;
  }
  function tick(time) {
    frame = null;
    if (disabled()) { stop(true); return; }
    if (document.hidden) { stop(); return; }
    if (dirty) measure();
    const elapsed = previous ? clamp(time - previous, 1, 64) : 16;
    const blend = 1 - Math.exp(-elapsed / 100);
    previous = time;
    let settling = false;
    for (const entry of entries) {
      if (entry.target === null) { reset(entry); continue; }
      entry.value = clamp(entry.value, -entry.limit, entry.limit);
      const difference = entry.target - entry.value;
      const moving = Math.abs(difference) > 0.02;
      entry.value = moving ? entry.value + difference * blend : entry.target;
      entry.element.style.setProperty('translate', `0 ${entry.value.toFixed(3)}px`);
      if (moving) entry.element.style.setProperty('will-change', 'translate');
      else restoreProperty(entry.element, 'will-change', entry.originalHint);
      entry.written = true;
      settling ||= moving;
    }
    // No perpetual animation: frames end as soon as the scroll movement settles.
    if (settling) frame = window.requestAnimationFrame(tick);
    else previous = 0;
  }
  function refresh() {
    dirty = true;
    if (disabled()) { stop(true); return; }
    if (document.hidden || frame !== null) return;
    previous = 0;
    frame = window.requestAnimationFrame(tick);
  }
  window.addEventListener('scroll', refresh, {passive: true});
  window.addEventListener('resize', refresh, {passive: true});
  window.visualViewport?.addEventListener('resize', refresh, {passive: true});
  window.addEventListener('pageshow', refresh);
  window.addEventListener('pagehide', () => stop());
  window.addEventListener('load', refresh, {once: true});
  window.addEventListener('beforeprint', () => { printing = true; stop(true); });
  window.addEventListener('afterprint', () => { printing = false; refresh(); });
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : refresh());
  reduced.addEventListener('change', refresh);
  print.addEventListener('change', refresh);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(refresh);
    scenes.forEach(scene => observer.observe(scene));
  }
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(refresh);
    scenes.forEach(scene => observer.observe(scene));
  }
  // Re-evaluate the active banner without animating hidden carousel slides.
  if ('MutationObserver' in window) {
    const observer = new MutationObserver(refresh);
    document.querySelectorAll('[data-home-carousel]').forEach(carousel => observer.observe(carousel, {
      attributes: true, attributeFilter: ['data-current-slide']
    }));
  }
  refresh();
})();
