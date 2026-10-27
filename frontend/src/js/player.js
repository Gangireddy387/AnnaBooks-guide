let videos = [];
let at = -1;
let lastFocus = null;

const $ = (s) => document.querySelector(s);
const mmss = (sec) => { const s = Math.round(sec || 0); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

function load(i, autoplay = true) {
  const v = videos[i];
  if (!v) return;
  at = i;
  const el = $('.player video');
  el.pause();
  el.innerHTML = `<source src="/videos/${v.slug}.mp4" type="video/mp4">${v.vtt ? `<track kind="captions" src="/videos/${v.slug}.vtt" srclang="en" label="English">` : ''}`;
  el.poster = `/videos/${v.slug}.jpg`;
  el.load();
  if (autoplay) el.play().catch(() => {});
  $('.player-ep').textContent = `Episode ${v.episode} of ${videos.length} · ${mmss(v.duration)}`;
  $('.player-title').textContent = v.title;
  $('.player-transcript ol').innerHTML = v.transcript.map((l) => `<li>${l.replace(/</g, '&lt;')}</li>`).join('');
  const prev = videos[i - 1]; const next = videos[i + 1];
  const pb = $('[data-player-prev]'); const nb = $('[data-player-next]');
  pb.disabled = !prev; nb.disabled = !next;
  pb.querySelector('span').textContent = prev ? prev.title : 'Previous';
  nb.querySelector('span').textContent = next ? `Next: ${next.title}` : 'Last episode';
  const g = $('[data-player-guide]');
  g.href = v.url;
  g.textContent = v.page === 'how-to-use' ? 'Back to the introduction' : 'Read this part of the guide';
}

function open(slug) {
  const i = videos.findIndex((v) => v.slug === slug);
  if (i < 0) return;
  lastFocus = document.activeElement;
  $('.player').hidden = false;
  document.body.style.overflow = 'hidden';
  load(i);
  $('[data-player-close].icon-btn').focus();
}

function close() {
  const el = $('.player video');
  el.pause();
  $('.player').hidden = true;
  document.body.style.overflow = '';
  lastFocus?.focus?.();
}

export function initPlayer() {
  const data = document.getElementById('ab-videos');
  if (!data) return;
  videos = JSON.parse(data.textContent);
  document.addEventListener('click', (e) => {
    const card = e.target.closest('[data-video]');
    if (card) { e.preventDefault(); open(card.dataset.video); return; }
    if (e.target.closest('[data-player-close]')) close();
    if (e.target.closest('[data-player-guide]')) close();
  });
  $('[data-player-prev]').addEventListener('click', () => load(at - 1));
  $('[data-player-next]').addEventListener('click', () => load(at + 1));
  $('[data-player-transcript]').addEventListener('click', (e) => {
    const t = $('.player-transcript');
    t.hidden = !t.hidden;
    e.currentTarget.setAttribute('aria-pressed', String(!t.hidden));
    $('.player').classList.toggle('with-transcript', !t.hidden);
  });
  $('.player video').addEventListener('ended', () => { if (videos[at + 1]) load(at + 1); });
  document.addEventListener('keydown', (e) => {
    if ($('.player').hidden) return;
    if (e.key === 'Escape') close();
  });
}
