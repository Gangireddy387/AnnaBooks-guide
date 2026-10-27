const main = () => document.getElementById('content');

export function scroller() {
  const m = main();
  return m && getComputedStyle(m).overflowY === 'auto' ? m : document.scrollingElement || document.documentElement;
}

export function scrollToTop(behavior = 'auto') {
  scroller().scrollTo({ top: 0, behavior });
}

export function onScroll(fn) {
  window.addEventListener('scroll', fn, { passive: true });
  main()?.addEventListener('scroll', fn, { passive: true });
}
