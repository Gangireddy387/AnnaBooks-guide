import { pages } from './pages.js';

const FILE = /\.(jpe?g|png|webp|gif|svg|mp4|vtt|json|xml|txt|zip|pdf)$/i;
const prefetched = new Set();
let shown = false;

function internalUrl(a) {
  if (!a || a.target === '_blank' || a.hasAttribute('download')) return null;
  const href = a.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return null;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin || FILE.test(url.pathname)) return null;
  if (url.pathname === location.pathname) return null;
  return url;
}

function titleFor(url, a) {
  const id = url.pathname.replace(/^\/+|\/+$/g, '') || 'how-to-use';
  const p = pages().byId.get(id);
  if (p) return p.kind === 'home' ? 'the guide home' : p.kind === 'part' ? `Part ${p.partNum}: ${p.title}` : `${p.num ? p.num + ' ' : ''}${p.title}`;
  return (a?.querySelector('.section-title, .module-title, .nav-text, b')?.textContent || a?.textContent || 'the next page').trim().slice(0, 80);
}

export function startLoading(title = 'the next page') {
  if (shown) return;
  shown = true;
  const loader = document.querySelector('.page-loader');
  loader.querySelector('[data-pl-title]').textContent = title;
  loader.hidden = false;
  document.documentElement.classList.add('is-navigating');
  requestAnimationFrame(() => loader.classList.add('show'));
}

function stopLoading() {
  shown = false;
  const loader = document.querySelector('.page-loader');
  loader.classList.remove('show');
  loader.hidden = true;
  document.documentElement.classList.remove('is-navigating');
}

function prefetch(url) {
  const key = url.pathname;
  if (prefetched.has(key)) return;
  prefetched.add(key);
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = key;
  document.head.appendChild(link);
}

export function initTransitions() {
  window.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest?.('a[href]');
    const url = internalUrl(a);
    if (url) startLoading(titleFor(url, a));
  });

  if (!(HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules'))) {
    const onIntent = (e) => {
      const url = internalUrl(e.target.closest?.('a[href]'));
      if (url) prefetch(url);
    };
    document.addEventListener('pointerover', onIntent, { passive: true });
    document.addEventListener('focusin', onIntent);
  }

  window.addEventListener('pageshow', (e) => { if (e.persisted) stopLoading(); });
  window.addEventListener('pagehide', () => {
    const nav = document.querySelector('.nav');
    if (nav) try { sessionStorage.setItem('ab-nav-scroll', String(nav.scrollTop)); } catch { /* storage blocked */ }
  });
}
