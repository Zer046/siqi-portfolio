import { bind, setVolume } from './assets/vendor/cuelume/index.js';

setVolume(0.24);

// Mark controls before delegated sound handlers run, including dynamic project pages.
function markControl(event) {
  const control = event.target.closest?.('button, a[href]');
  if (!control || control.disabled || control.closest('[inert]')) return;
  let cue = 'tap';
  if (control.matches('[data-step], .portfolio-file-handle, .portfolio-lightbox-prev, .portfolio-lightbox-next, .project-pagination button')) cue = 'select';
  else if (control.matches('#closeDetails, #closeAbout, .portfolio-lightbox-close')) cue = 'close';
  else if (control.matches('.portfolio-page-file, #about, .portfolio-strip-toggle')) cue = 'open';
  else if (control.matches('a[href], #play, #hardwarePlay, #gameScreen, #computerScreen, #switchDevice, .screen-menu button')) cue = 'navigate';
  control.setAttribute('data-cuelume-tap', cue);
}
for (const type of ['pointerdown', 'click', 'keydown']) document.addEventListener(type, markControl, true);
bind();
