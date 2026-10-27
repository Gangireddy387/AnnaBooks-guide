import { pages, visited } from './pages.js';

const mobile = () => matchMedia('(max-width: 1023px)').matches;

function setOpen(open) {
  const btn = document.querySelector('.nav-toggle');
  const scrim = document.querySelector('.scrim');
  document.body.classList.toggle('nav-open', open);
  btn.setAttribute('aria-expanded', String(open));
  btn.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  scrim.hidden = !open;
}

export function refreshProgress() {
  const seen = visited();
  const features = pages().list.filter((p) => p.kind === 'feature');
  const done = features.filter((p) => seen.has(p.id)).length;
  document.querySelector('[data-progress-text]').textContent = `${done} of ${features.length} read`;
  document.querySelector('[data-progress-bar]').style.width = `${(done / features.length) * 100}%`;
  document.querySelectorAll('.nav-item').forEach((a) => a.classList.toggle('visited', seen.has(a.dataset.go)));
  document.querySelectorAll('.nav-group').forEach((g) => {
    const items = [...g.querySelectorAll('.nav-item')];
    const n = items.filter((a) => seen.has(a.dataset.go)).length;
    g.querySelector('[data-part-count]').textContent = `${n}/${items.length}`;
    g.classList.toggle('done', n === items.length);
  });
}

function toggleGroup(group, open) {
  group.classList.toggle('open', open);
  group.querySelector('.nav-part').setAttribute('aria-expanded', String(open));
}

export function initSidebar() {
  document.querySelector('.nav-toggle').addEventListener('click', () => setOpen(!document.body.classList.contains('nav-open')));
  document.querySelector('.scrim').addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.body.classList.contains('nav-open')) setOpen(false); });
  document.querySelectorAll('.nav-part').forEach((a) => a.addEventListener('click', (e) => {
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;
    const g = a.closest('.nav-group');
    if (!a.classList.contains('active')) return;
    e.preventDefault();
    toggleGroup(g, !g.classList.contains('open'));
  }));

  document.addEventListener('guide:page', (e) => {
    const { page } = e.detail;
    const activeId = page.id;
    const partId = page.kind === 'part' ? page.id : page.part;
    document.querySelectorAll('.nav [data-go]').forEach((a) => {
      const on = a.dataset.go === activeId;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    document.querySelectorAll('.nav-group').forEach((g) => {
      const mine = g.dataset.part === partId;
      g.classList.toggle('has-active', mine);
      if (mine) toggleGroup(g, true);
    });
    refreshProgress();
    if (mobile()) setOpen(false);
    const active = document.querySelector('.nav .active');
    const nav = document.querySelector('.nav');
    try { const saved = sessionStorage.getItem('ab-nav-scroll'); if (saved !== null) nav.scrollTop = +saved; } catch { /* storage blocked */ }
    if (active) {
      const r = active.getBoundingClientRect(); const n = nav.getBoundingClientRect();
      if (r.top < n.top + 40 || r.bottom > n.bottom - 40) nav.scrollTop += r.top - n.top - n.height / 2 + r.height / 2;
    }
  });
}
