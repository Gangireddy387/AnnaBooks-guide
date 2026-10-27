import { initRouter } from './js/router.js';
import { initSidebar } from './js/sidebar.js';
import { initRail } from './js/rail.js';
import { initSearch } from './js/search.js';
import { initLightbox } from './js/lightbox.js';
import { initTheme } from './js/theme.js';
import { initUi } from './js/ui.js';
import { initGallery } from './js/gallery.js';
import { initPlayer } from './js/player.js';
import { initSecNav } from './js/secnav.js';
import { initTransitions } from './js/transitions.js';
import { initReading } from './js/reading.js';

const isPrint = document.documentElement.classList.contains('is-print');

if (isPrint) {
  document.querySelectorAll('details').forEach((d) => { d.open = true; });
} else {
  initTheme();
  initTransitions();
  initUi();
  initSidebar();
  initRail();
  initSearch();
  initLightbox();
  initGallery();
  initPlayer();
  initSecNav();
  initReading();
  initRouter();
}
