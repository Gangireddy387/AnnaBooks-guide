const KEY = 'ab-theme';

function apply(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.querySelector('.theme-toggle');
  btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  btn.setAttribute('aria-pressed', String(theme === 'dark'));
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0b1017' : '#0f766e');
}

export function initTheme() {
  apply(document.documentElement.getAttribute('data-theme') || 'light');
  document.querySelector('.theme-toggle').addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(KEY, next); } catch { /* private mode */ }
    apply(next);
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    try { if (localStorage.getItem(KEY)) return; } catch { /* ignore */ }
    apply(e.matches ? 'dark' : 'light');
  });
}
