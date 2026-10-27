import { scrollToTop } from './scroller.js';

let observer = null;

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);

function ensureId(el, id) {
  if (!el.id) el.id = id;
  return el.id;
}

function entriesFor(page, visible) {
  const out = [];
  if (page.kind === 'home') {
    page.el.querySelectorAll('.block-head h2, .home-rest > h3').forEach((h) => {
      const text = h.textContent.trim();
      out.push({ el: h, id: ensureId(h, `intro-${slug(text)}`), text, sub: h.tagName === 'H3' });
    });
  } else if (page.kind === 'part') {
    page.el.querySelectorAll('.section-card').forEach((a) => {
      const href = a.getAttribute('href');
      out.push({ el: a, id: ensureId(a, `card-${href.replace(/\W/g, '')}`), text: `${a.querySelector('.section-num').textContent} ${a.querySelector('.section-title').textContent}`, href });
    });
  } else {
    const el = page.el;
    const add = (node, key, text, sub = false) => { if (node) out.push({ el: node, id: ensureId(node, `${page.id}--${key}`), text, sub }); };
    add(el.querySelector('.gallery'), 'screens', 'Screens');
    add(el.querySelector('.fc'), 'flow', 'Workflow');
    const steps = el.querySelector('.steps');
    add(steps, 'steps', 'Instructions');
    if (steps) steps.querySelectorAll('.step').forEach((s, i) => add(s, `step-${i + 1}`, `${i + 1}. ${s.querySelector('h4')?.textContent.trim() || 'Step'}`, true));
    add(el.querySelector('details.full'), 'detail', 'More detail');
    el.querySelectorAll('.rpt h3').forEach((h, i) => add(h, `report-${i + 1}`, h.textContent.trim(), true));
  }
  return out;
}

export function initRail() {
  const rail = document.querySelector('.rail');
  const list = rail.querySelector('.rail-list');
  document.querySelector('[data-scroll-top]').addEventListener('click', () => scrollToTop('smooth'));

  document.addEventListener('guide:page', (e) => {
    const { page, visible } = e.detail;
    if (observer) observer.disconnect();
    let items;
    if (list.children.length || rail.hasAttribute('data-empty')) {
      items = [...list.querySelectorAll('a[data-rail]')].map((a) => ({ el: document.getElementById(a.dataset.rail), id: a.dataset.rail })).filter((it) => it.el);
    } else {
      items = entriesFor(page, visible);
      list.innerHTML = items.map((it) => (it.href
        ? `<li><a href="${it.href}">${it.text.replace(/</g, '&lt;')}</a></li>`
        : `<li class="${it.sub ? 'sub' : ''}"><a href="#${it.id}" data-rail="${it.id}">${it.text.replace(/</g, '&lt;')}</a></li>`)).join('');
      if (items.length < 2) rail.setAttribute('data-empty', ''); else rail.removeAttribute('data-empty');
    }
    const links = new Map([...list.querySelectorAll('a')].map((a) => [a.dataset.rail, a]));
    observer = new IntersectionObserver((ents) => {
      const vis = ents.filter((x) => x.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!vis) return;
      links.forEach((a) => a.classList.remove('active'));
      links.get(vis.target.id)?.classList.add('active');
    }, { rootMargin: '-80px 0px -65% 0px' });
    items.forEach((it) => observer.observe(it.el));
  });

  list.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-rail]');
    if (!a) return;
    e.preventDefault();
    e.stopPropagation();
    const el = document.getElementById(a.dataset.rail);
    if (el) {
      const d = el.matches('details') ? el : null; if (d) d.open = true;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, true);
}
