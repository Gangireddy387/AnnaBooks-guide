import { pages } from './pages.js';
import { show } from './router.js';

let observer = null;

function tabsFor(el, id) {
  const tabs = [];
  const add = (node, key, label, count) => {
    if (!node) return;
    if (!node.id) node.id = `${id}--${key}`;
    tabs.push({ node, label, count });
  };
  add(el.querySelector('.gallery'), 'screens', 'Screens', el.querySelectorAll('.gallery-thumb').length || null);
  add(el.querySelector('.fc:not([aria-label="Flowchart legend"])'), 'flow', 'Workflow');
  add(el.querySelector('.steps'), 'steps', 'Instructions', el.querySelectorAll('.steps .step').length || null);
  add(el.querySelector('.rpt'), 'records', 'Sample records');
  add(el.querySelector('details.full'), 'detail', 'More detail');
  return tabs;
}

function markRowEnds(root) {
  root.querySelectorAll('.fc:not([aria-label="Flowchart legend"])').forEach((fc) => {
    const nodes = [...fc.querySelectorAll(':scope > .fc-n')];
    nodes.forEach((n, i) => n.classList.toggle('row-end', !!nodes[i + 1] && nodes[i + 1].offsetTop > n.offsetTop));
  });
}

export function initSecNav() {
  const bar = document.querySelector('.sec-nav');
  const list = bar.querySelector('[data-secnav-tabs]');
  const num = bar.querySelector('[data-secnav-num]');
  const pos = bar.querySelector('[data-secnav-pos]');
  const prev = bar.querySelector('[data-secnav-prev]');
  const next = bar.querySelector('[data-secnav-next]');
  if (!list) return;
  const serverTabs = list.children.length > 0;
  let nav = { prev: null, next: null };
  let current = null;
  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (current && !bar.hidden) markRowEnds(current); }, 120);
  });

  const setLink = (a, p) => {
    a.toggleAttribute('aria-disabled', !p);
    a.setAttribute('href', p ? p.url : '#');
    a.title = p ? `${p.num ? p.num + ' ' : ''}${p.title}` : '';
  };

  document.addEventListener('guide:page', (e) => {
    const { page } = e.detail;
    if (observer) observer.disconnect();
    if (page.kind !== 'feature') { bar.hidden = true; nav = { prev: null, next: null }; return; }

    let tabs;
    if (serverTabs) {
      tabs = [...list.querySelectorAll('a[data-secnav]')].map((a) => ({ node: document.getElementById(a.dataset.secnav) })).filter((t) => t.node);
    } else {
      tabs = tabsFor(page.el, page.id);
      list.innerHTML = tabs.map((t) => `<li><a href="#${t.node.id}" data-secnav="${t.node.id}">${t.label}${t.count ? `<span>${t.count}</span>` : ''}</a></li>`).join('');
      num.textContent = page.num || '';
      num.hidden = !page.num;
    }

    const { sequence, list: all } = pages();
    const feats = sequence.filter((p) => p.kind === 'feature');
    const i = feats.indexOf(page);
    nav = { prev: feats[i - 1] || null, next: feats[i + 1] || null };
    if (!serverTabs) {
      setLink(prev, nav.prev);
      setLink(next, nav.next);
      const inPart = all.filter((p) => p.kind === 'feature' && p.part === page.part);
      pos.textContent = `${inPart.indexOf(page) + 1} of ${inPart.length}`;
    }
    bar.hidden = false;
    current = page.el;
    requestAnimationFrame(() => markRowEnds(page.el));

    const links = new Map([...list.querySelectorAll('a')].map((a) => [a.dataset.secnav, a]));
    const activate = (id) => links.forEach((a, k) => a.classList.toggle('active', k === id));
    activate(tabs[0]?.node.id);
    observer = new IntersectionObserver((ents) => {
      const vis = ents.filter((x) => x.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (vis) activate(vis.target.id);
    }, { rootMargin: '-140px 0px -55% 0px' });
    tabs.forEach((t) => observer.observe(t.node));
  });

  list.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-secnav]');
    if (!a) return;
    e.preventDefault();
    e.stopPropagation();
    const el = document.getElementById(a.dataset.secnav);
    if (!el) return;
    if (el.matches('details')) el.open = true;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, true);

  bar.addEventListener('click', (e) => {
    const a = e.target.closest('[data-secnav-prev], [data-secnav-next]');
    if (a && a.hasAttribute('aria-disabled')) e.preventDefault();
  });

  document.addEventListener('keydown', (e) => {
    if (bar.hidden || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const t = e.target;
    if (t.closest?.('input, textarea, select, [contenteditable], .gallery, dialog, video')) return;
    if (document.querySelector('dialog[open]')) return;
    const p = e.key === 'ArrowLeft' ? nav.prev : nav.next;
    if (!p) return;
    e.preventDefault();
    show(p.id);
  });
}
