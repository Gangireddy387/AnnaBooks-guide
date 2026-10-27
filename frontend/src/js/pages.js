let cache = null;

export function pages() {
  if (cache) return cache;
  let data = { pages: [] };
  try { data = JSON.parse(document.getElementById('ab-site')?.textContent || '{"pages":[]}'); } catch { /* keep empty */ }
  const list = data.pages.map((p) => ({ ...p }));
  const byId = new Map(list.map((p) => [p.id, p]));
  list.forEach((p) => {
    if (p.part) p.partInfo = byId.get(p.part);
  });
  const el = document.querySelector('.doc [data-page]');
  let current = null;
  if (el) {
    current = byId.get(el.dataset.page) || { id: el.dataset.page, kind: el.dataset.kind, part: null, num: '', title: document.title.split(' | ')[0], url: location.pathname };
    current.el = el;
  }
  const sequence = list.filter((p) => p.kind !== 'part');
  cache = { list, byId, sequence, current };
  return cache;
}

const VISITED_KEY = 'ab-read';
export function visited() {
  try { return new Set(JSON.parse(localStorage.getItem(VISITED_KEY) || '[]')); } catch { return new Set(); }
}
export function markVisited(id) {
  const v = visited();
  if (v.has(id)) return v;
  v.add(id);
  try { localStorage.setItem(VISITED_KEY, JSON.stringify([...v])); } catch { /* storage full or blocked */ }
  return v;
}
