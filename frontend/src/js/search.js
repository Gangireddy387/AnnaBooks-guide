import { pages, visited } from './pages.js';
import { show } from './router.js';

let index = null;
let results = [];
let sel = -1;

const POPULAR = ['client-sign-up-and-sign-in', 'full-company-setup', 'customer-invoice', 'receive-payment', 'enter-bill-and-create-bill', 'profit-and-loss-balance-sheet-cash-flow-and-the-ledger'];

const norm = (s) => (s || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
const escHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

let loading = null;
function ensureIndex() {
  if (index) return Promise.resolve(index);
  if (!loading) {
    loading = fetch('/search-index.json')
      .then((r) => (r.ok ? r.json() : {}))
      .catch(() => ({}))
      .then((texts) => {
        const { list } = pages();
        index = list.map((p) => {
          const raw = texts[p.id] || '';
          return { ...p, raw, text: norm(raw), ntitle: norm(`${p.num} ${p.title}`), partTitle: p.partInfo ? `Part ${p.partInfo.partNum}` : p.kind === 'part' ? `Part ${p.partNum}` : '' };
        });
        return index;
      });
  }
  return loading;
}
function highlight(text, tokens) {
  let out = escHtml(text);
  for (const t of tokens.filter((x) => x.length > 1).sort((a, b) => b.length - a.length)) {
    out = out.replace(new RegExp(`(${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig'), '<mark>$1</mark>');
  }
  return out;
}

function snippet(entry, tokens) {
  const t = tokens.find((x) => entry.text.includes(x));
  if (!t) return entry.raw.slice(0, 120);
  const i = entry.text.indexOf(t);
  const start = Math.max(0, i - 50);
  return (start > 0 ? '…' : '') + entry.raw.slice(start, i + 110) + '…';
}

function search(tokens, q) {
  const scored = [];
  for (const e of index) {
    let score = 0; let all = true;
    for (const t of tokens) {
      const inTitle = e.ntitle.includes(t);
      const inText = e.text.includes(t);
      if (!inTitle && !inText) { all = false; break; }
      if (inTitle) score += e.ntitle.split(' ').some((w) => w.startsWith(t)) ? 60 : 35;
      if (inText) score += Math.min(20, e.text.split(t).length - 1);
    }
    if (!all) continue;
    if (e.ntitle.includes(norm(q))) score += 80;
    if (e.kind === 'part') score += 10;
    scored.push({ e, score });
  }
  const top = scored.sort((a, b) => b.score - a.score).slice(0, 24);
  const best = {};
  top.forEach(({ e, score }) => { best[e.kind] = Math.max(best[e.kind] ?? 0, score); });
  return top.sort((a, b) => (best[b.e.kind] - best[a.e.kind]) || (b.score - a.score)).map(({ e }) => e);
}

const row = (e, i, title, snip, side) => `<a class="sr-row" href="${e.url}" role="option" id="sr-${i}" data-i="${i}" aria-selected="false"><span class="sr-ico">${e.kind === 'part' ? e.partNum : e.num || '★'}</span><span class="sr-main"><span class="sr-title">${title}</span>${snip ? `<span class="sr-snip">${snip}</span>` : ''}</span>${side ? `<span class="sr-side">${side}</span>` : ''}</a>`;

function render(q) {
  const body = document.querySelector('.search-body');
  const tokens = norm(q).split(' ').filter(Boolean);
  sel = -1;
  if (!index) {
    results = [];
    body.innerHTML = '<div class="sr-empty"><span>Loading the guide index…</span></div>';
    ensureIndex().then(() => render(document.querySelector('.search-input').value));
    return;
  }
  if (!tokens.length) {
    const parts = index.filter((e) => e.kind === 'part');
    const seen = visited();
    const popular = POPULAR.map((id) => index.find((e) => e.id === id)).filter(Boolean);
    results = [...parts, ...popular];
    body.innerHTML = `<p class="sr-group">Browse features</p><div class="sr-tiles">${parts.map((e, i) => `<a class="sr-tile" href="${e.url}" role="option" id="sr-${i}" data-i="${i}" aria-selected="false"><span class="sr-tile-ico">${e.icon || e.partNum}</span><span class="sr-tile-text"><span class="sr-tile-title">${escHtml(e.title)}</span><span class="sr-tile-meta">Part ${e.partNum} · ${e.count} sections</span></span></a>`).join('')}</div>`
      + `<p class="sr-group">Popular sections</p><div class="sr-list">${popular.map((e, j) => row(e, parts.length + j, escHtml(e.title), '', seen.has(e.id) ? '<span class="sr-seen">Read</span>' : e.partTitle)).join('')}</div>`;
    return;
  }
  const found = search(tokens, q);
  results = found;
  if (!found.length) {
    body.innerHTML = `<div class="sr-empty"><b>No results for "${escHtml(q)}"</b><span>Try a screen name such as Pay Bill, Timesheet or Balance Sheet.</span></div>`;
    return;
  }
  let html = ''; let last = '';
  found.forEach((e, i) => {
    const group = e.kind === 'part' ? 'Features' : e.kind === 'home' ? 'Introduction' : 'Sections';
    if (group !== last) { html += `${last ? '</div>' : ''}<p class="sr-group">${group}</p><div class="sr-list">`; last = group; }
    html += row(e, i, highlight(`${e.num ? e.num + ' ' : ''}${e.title}`, tokens), highlight(snippet(e, tokens), tokens), e.partTitle);
  });
  body.innerHTML = `${html}</div>`;
  move(1);
}

function move(d) {
  if (!results.length) return;
  sel = sel < 0 && d < 0 ? results.length - 1 : (sel + d + results.length) % results.length;
  document.querySelectorAll('.search-body [data-i]').forEach((el) => el.setAttribute('aria-selected', String(+el.dataset.i === sel)));
  document.getElementById(`sr-${sel}`)?.scrollIntoView({ block: 'nearest' });
  document.querySelector('.search-input').setAttribute('aria-activedescendant', `sr-${sel}`);
}

function setOpen(on) {
  const box = document.querySelector('.search');
  const pop = box.querySelector('.search-pop');
  const input = box.querySelector('.search-input');
  if (on && pop.hidden) render(input.value);
  pop.hidden = !on;
  box.classList.toggle('is-open', on);
  input.setAttribute('aria-expanded', String(on));
}

function focusSearch() {
  const input = document.querySelector('.search-input');
  setOpen(true);
  input.focus();
  input.select();
}

function choose(i) {
  const e = results[i];
  if (!e) return;
  const input = document.querySelector('.search-input');
  setOpen(false);
  input.value = '';
  document.querySelector('.search-clear').hidden = true;
  input.blur();
  show(e.id);
}

export function initSearch() {
  const box = document.querySelector('.search');
  const input = box.querySelector('.search-input');
  const clear = box.querySelector('.search-clear');
  const body = box.querySelector('.search-body');

  const sync = () => { clear.hidden = !input.value; };
  box.addEventListener('pointerenter', () => ensureIndex(), { once: true });
  input.addEventListener('focus', () => setOpen(true));
  input.addEventListener('input', () => { sync(); setOpen(true); render(input.value); });
  clear.addEventListener('click', (e) => { e.preventDefault(); input.value = ''; sync(); render(''); input.focus(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(sel < 0 ? 0 : sel); }
    else if (e.key === 'Escape') { e.preventDefault(); if (input.value) { input.value = ''; sync(); render(''); } else { setOpen(false); input.blur(); } }
  });
  body.addEventListener('mousemove', (e) => {
    const el = e.target.closest('[data-i]');
    if (el && +el.dataset.i !== sel) { sel = +el.dataset.i - 1; move(1); }
  });
  body.addEventListener('mousedown', (e) => e.preventDefault());
  body.addEventListener('click', (e) => {
    const el = e.target.closest('[data-i]');
    if (!el) return;
    e.preventDefault();
    e.stopPropagation();
    choose(+el.dataset.i);
  }, true);
  document.addEventListener('mousedown', (e) => { if (!box.contains(e.target) && !e.target.closest('[data-open-search]')) setOpen(false); });
  input.addEventListener('blur', () => setTimeout(() => { if (!box.contains(document.activeElement)) setOpen(false); }, 120));
  document.querySelectorAll('[data-open-search]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); focusSearch(); }));

  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); focusSearch(); }
    else if (e.key === '/' && !typing) { e.preventDefault(); focusSearch(); }
  });
  if (/Mac|iPhone|iPad/.test(navigator.platform)) box.querySelectorAll('.search-keys kbd:first-child').forEach((k) => { k.textContent = '⌘'; });
}
