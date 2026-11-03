'use strict';
// Static HTML remains useful without JavaScript. Only the homepage opts into rotation.
(() => {
  const root = document.querySelector('[data-home-carousel]');
  if (!root) return;
  const slides = [...root.querySelectorAll('[data-hero-slide]')];
  const controls = root.querySelector('[data-carousel-controls]');
  const rotation = root.querySelector('[data-carousel-rotation]');
  const selectors = [...root.querySelectorAll('[data-carousel-go]')];
  const status = root.querySelector('[data-carousel-status]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (slides.length < 2 || !controls || !rotation) return;
  let current = 0;
  let paused = reduced.matches;
  let hovering = false;
  let visible = true;
  let timer = null;
  let pointerPauseState = null;
  let touchStart = null;
  const interval = Math.max(5000, Number(root.dataset.interval) || 7000);
  const clear = () => { window.clearTimeout(timer); timer = null; };
  function schedule() {
    clear();
    if (!paused && !hovering && visible && !document.hidden) timer = window.setTimeout(() => show(current + 1, false), interval);
  }
  function refresh() {
    rotation.setAttribute('aria-label', paused ? 'Play automatic banner rotation' : 'Pause automatic banner rotation');
    rotation.querySelector('[data-rotation-label]').textContent = paused ? 'Play' : 'Pause';
    rotation.querySelector('[data-rotation-symbol]').textContent = paused ? '▶' : 'Ⅱ';
    root.dataset.rotation = paused ? 'paused' : 'playing';
    schedule();
  }
  function show(index, manual = true) {
    current = (index + slides.length) % slides.length;
    if (manual) paused = true;
    slides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
      slide.inert = !active;
      if (active) selectors[i].setAttribute('aria-current', 'true');
      else selectors[i].removeAttribute('aria-current');
    });
    root.dataset.currentSlide = String(current + 1);
    if (manual) status.textContent = `Banner ${slides[current].getAttribute('aria-label')}`;
    refresh();
  }
  rotation.addEventListener('pointerdown', () => { pointerPauseState = paused; });
  rotation.addEventListener('pointercancel', () => { pointerPauseState = null; });
  rotation.addEventListener('click', event => {
    paused = !(event.detail > 0 && pointerPauseState !== null ? pointerPauseState : paused);
    pointerPauseState = null;
    refresh();
  });
  root.querySelector('[data-carousel-prev]').addEventListener('click', () => show(current - 1));
  root.querySelector('[data-carousel-next]').addEventListener('click', () => show(current + 1));
  selectors.forEach((button, i) => button.addEventListener('click', () => show(i)));
  controls.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    show(current + (event.key === 'ArrowRight' ? 1 : -1));
    selectors[current].focus();
  });
  root.addEventListener('focusin', event => {
    // Pause on keyboard entry and when moving from the play control into slide content.
    if (!root.contains(event.relatedTarget) || event.target !== rotation) { paused = true; refresh(); }
  });
  root.addEventListener('mouseenter', () => { if (finePointer.matches) { hovering = true; clear(); } });
  root.addEventListener('mouseleave', () => { hovering = false; schedule(); });
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', event => { if (event.matches) { paused = true; refresh(); } });
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    schedule();
  }, {threshold: 0.15}).observe(root);
  root.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch' || event.target.closest('a,button,input,select,textarea')) return;
    touchStart = {x: event.clientX, y: event.clientY};
  }, {passive: true});
  root.addEventListener('pointerup', event => {
    if (!touchStart) return;
    const dx = event.clientX - touchStart.x, dy = event.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) show(current + (dx < 0 ? 1 : -1));
  }, {passive: true});
  root.addEventListener('pointercancel', () => { touchStart = null; }, {passive: true});
  controls.hidden = false;
  show(0, false);
})();
