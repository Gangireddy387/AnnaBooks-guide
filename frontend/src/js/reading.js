import { visited, markVisited } from './pages.js';
import { refreshProgress } from './sidebar.js';
import { toast } from './ui.js';

const MIN_SECONDS = 5;

export function initReading() {
  document.addEventListener('guide:page', (e) => {
    const { page } = e.detail;
    if (page.kind !== 'feature' || visited().has(page.id)) return;
    const end = document.createElement('div');
    end.className = 'read-end';
    end.setAttribute('aria-hidden', 'true');
    page.el.appendChild(end);

    const opened = performance.now();
    let timer = 0;
    const finish = () => {
      if (visited().has(page.id)) return;
      markVisited(page.id);
      refreshProgress();
      toast(`${page.num ? page.num + ' ' : ''}${page.title} marked as read`);
      observer.disconnect();
    };
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((x) => x.isIntersecting)) { clearTimeout(timer); return; }
      const wait = MIN_SECONDS * 1000 - (performance.now() - opened);
      clearTimeout(timer);
      timer = setTimeout(finish, Math.max(0, wait));
    });
    observer.observe(end);
  });
}
