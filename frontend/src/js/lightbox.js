let items = [];
let at = 0;
let lastFocus = null;

const box = () => document.querySelector('.lightbox');

function render() {
  const lb = box();
  const it = items[at];
  const img = lb.querySelector('.lightbox-stage img');
  img.src = it.href;
  img.alt = it.alt;
  lb.querySelector('.lightbox-caption').innerHTML = it.caption;
  lb.querySelector('.lightbox-count').textContent = `${at + 1} / ${items.length}`;
  lb.querySelector('[data-lb-open]').href = it.href;
  lb.querySelector('[data-lb-prev]').disabled = at === 0;
  lb.querySelector('[data-lb-next]').disabled = at === items.length - 1;
  lb.classList.remove('zoomed');
}

function open(link) {
  const gal = link.closest('[data-gallery]');
  const thumbs = gal ? [...gal.querySelectorAll('.gallery-thumb')] : [];
  let links;
  if (thumbs.length) {
    links = thumbs;
    at = Math.max(0, thumbs.findIndex((t) => t.classList.contains('active')));
  } else {
    links = [link];
    at = 0;
  }
  const captionOf = (a) => a.dataset.caption || a.closest('figure')?.querySelector('[data-gallery-caption]')?.innerHTML || a.closest('figure')?.querySelector('figcaption')?.innerHTML || '';
  items = links.map((a) => ({ href: a.getAttribute('href'), alt: a.querySelector('img')?.alt || '', caption: captionOf(a) }));
  lastFocus = document.activeElement;
  box().hidden = false;
  document.body.style.overflow = 'hidden';
  render();
  box().querySelector('[data-lb-close]').focus();
}

function close() {
  box().hidden = true;
  document.body.style.overflow = '';
  lastFocus?.focus?.();
}

function go(d) {
  const n = at + d;
  if (n < 0 || n >= items.length) return;
  at = n;
  render();
}

export function initLightbox() {
  const lb = box();
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-lightbox]');
    if (!a || e.ctrlKey || e.metaKey) return;
    e.preventDefault();
    open(a);
  });
  lb.querySelector('[data-lb-close]').addEventListener('click', close);
  lb.querySelector('[data-lb-prev]').addEventListener('click', () => go(-1));
  lb.querySelector('[data-lb-next]').addEventListener('click', () => go(1));
  lb.querySelector('[data-lb-zoom]').addEventListener('click', () => lb.classList.toggle('zoomed'));
  lb.querySelector('.lightbox-stage img').addEventListener('click', () => lb.classList.toggle('zoomed'));
  lb.querySelector('.lightbox-stage').addEventListener('click', (e) => { if (e.target === e.currentTarget) close(); });
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'Tab') {
      const f = [...lb.querySelectorAll('button:not([disabled]), a[href]')];
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });
}
