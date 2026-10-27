import { scroller, onScroll } from './scroller.js';

let toastTimer = null;

export function toast(msg) {
  const t = document.querySelector('.toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

function progress() {
  const bar = document.querySelector('.read-progress span');
  let ticking = false;
  const update = () => {
    const h = scroller();
    const max = h.scrollHeight - h.clientHeight;
    bar.style.width = `${max > 0 ? Math.min(100, (h.scrollTop / max) * 100) : 0}%`;
    ticking = false;
  };
  onScroll(() => { if (!ticking) { ticking = true; requestAnimationFrame(update); } });
  document.addEventListener('guide:page', () => requestAnimationFrame(update));
}

function trackHeadHeight() {
  const head = document.querySelector('.content-head');
  if (!head) return;
  const set = () => document.documentElement.style.setProperty('--head-h', `${head.offsetHeight}px`);
  new ResizeObserver(set).observe(head);
  document.addEventListener('guide:page', () => requestAnimationFrame(set));
}

export function initUi() {
  progress();
  trackHeadHeight();
  document.querySelector('[data-copy-link]').addEventListener('click', async () => {
    const url = location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast('Link copied to clipboard');
    } catch {
      prompt('Copy this link', url);
    }
  });
}
