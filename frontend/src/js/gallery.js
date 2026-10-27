function select(gallery, thumb) {
  const thumbs = [...gallery.querySelectorAll('.gallery-thumb')];
  const i = thumbs.indexOf(thumb);
  thumbs.forEach((t, j) => { t.classList.toggle('active', j === i); t.setAttribute('aria-selected', String(j === i)); });
  const main = gallery.querySelector('.gallery-main');
  const img = main.querySelector('img');
  const src = thumb.getAttribute('href');
  main.setAttribute('href', src);
  img.classList.add('swap');
  const next = new Image();
  next.onload = () => { img.src = src; img.alt = thumb.querySelector('img').alt; requestAnimationFrame(() => img.classList.remove('swap')); };
  next.src = src;
  gallery.querySelector('[data-gallery-caption]').innerHTML = thumb.dataset.caption;
  const idx = gallery.querySelector('[data-gallery-index]');
  if (idx) idx.textContent = String(i + 1);
}

export function initGallery() {
  document.addEventListener('click', (e) => {
    const thumb = e.target.closest('.gallery-thumb');
    if (!thumb || e.ctrlKey || e.metaKey) return;
    e.preventDefault();
    e.stopPropagation();
    select(thumb.closest('[data-gallery]'), thumb);
  }, true);
  document.addEventListener('keydown', (e) => {
    const thumb = document.activeElement?.closest?.('.gallery-thumb');
    if (!thumb || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const list = [...thumb.parentElement.children];
    const next = list[list.indexOf(thumb) + (e.key === 'ArrowRight' ? 1 : -1)];
    if (next) { e.preventDefault(); next.focus(); select(next.closest('[data-gallery]'), next); }
  });
}
