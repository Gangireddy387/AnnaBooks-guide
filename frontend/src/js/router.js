import { pages } from './pages.js';
import { startLoading } from './transitions.js';

const HOME = 'how-to-use';

function crumbs(page) {
  const nav = document.querySelector('.crumbs');
  const parts = ['<a href="/">Guide</a>'];
  if (page.kind === 'part') parts.push(`<span aria-current="page">Part ${page.partNum}: ${page.title}</span>`);
  if (page.kind === 'feature') {
    const part = page.partInfo;
    if (part) parts.push(`<a href="${part.url}">Part ${part.partNum}: ${part.title}</a>`);
    parts.push(`<span aria-current="page">${page.num ? page.num + ' ' : ''}${page.title}</span>`);
  }
  if (page.kind === 'notfound') parts.push('<span aria-current="page">Page not found</span>');
  nav.innerHTML = parts.join('<span class="sep" aria-hidden="true">/</span>');
}

function meta(page) {
  const words = (page.el.textContent.match(/\S+/g) || []).length;
  const mins = Math.max(1, Math.round(words / 230));
  document.querySelector('.page-meta').innerHTML = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" style="width:14px;height:14px"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>${mins} min read`;
}

function pager(page) {
  const nav = document.querySelector('.pager');
  const { sequence, list } = pages();
  let prev = null; let next = null;
  if (page.kind === 'part') {
    const first = list.find((p) => p.kind === 'feature' && p.part === page.id);
    prev = sequence[sequence.indexOf(first) - 1] || null;
    next = first || null;
  } else if (page.kind !== 'notfound') {
    const i = sequence.indexOf(page);
    prev = sequence[i - 1] || null;
    next = sequence[i + 1] || null;
  }
  const label = (p) => (p.kind === 'part' ? `Part ${p.partNum}: ${p.title}` : `${p.num ? p.num + ' ' : ''}${p.title}`);
  nav.innerHTML = [
    prev ? `<a class="prev" href="${prev.url}" rel="prev"><small>Previous</small><b>${label(prev)}</b></a>` : '',
    next ? `<a class="next" href="${next.url}" rel="next"><small>Next</small><b>${label(next)}</b></a>` : '',
  ].join('');
}

export function show(id) {
  const p = pages().byId.get(id);
  if (!p) return;
  startLoading(p.kind === 'home' ? 'the guide home' : p.kind === 'part' ? `Part ${p.partNum}: ${p.title}` : `${p.num ? p.num + ' ' : ''}${p.title}`);
  location.href = p.url;
}

function scrollToHash() {
  const id = decodeURIComponent(location.hash.slice(1));
  const el = id && document.getElementById(id);
  if (!el) return;
  const d = el.closest('details'); if (d) d.open = true;
  el.scrollIntoView({ block: 'start' });
}

export function initRouter() {
  const { current, byId } = pages();
  const legacy = decodeURIComponent(location.hash.slice(1));
  if (current?.kind === 'home' && legacy && legacy !== HOME && byId.has(legacy)) {
    location.replace(byId.get(legacy).url);
    return;
  }
  if (!current) return;
  if ('scrollRestoration' in history) history.scrollRestoration = 'auto';
  if (!document.querySelector('.crumbs').children.length) {
    crumbs(current);
    meta(current);
    pager(current);
  }
  document.dispatchEvent(new CustomEvent('guide:page', { detail: { page: current, visible: [current], changed: true } }));
  if (location.hash) {
    if (document.readyState === 'complete') requestAnimationFrame(scrollToHash);
    else window.addEventListener('load', () => requestAnimationFrame(scrollToHash), { once: true });
  }
  window.addEventListener('hashchange', scrollToHash);
  document.getElementById('content').focus({ preventScroll: true });
}
