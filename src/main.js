import { createScene } from './scene.js';
import { startAnimation } from './animations.js';
import { initCakeUi } from './ui.js';

const canvas = document.getElementById('scene');

try {
  const app = createScene(canvas);
  initCakeUi(app);
  startAnimation(app);
  console.info('[cake] Three.js scene started');
} catch (error) {
  console.error('[cake] Scene startup failed', error);
  document.body.classList.add('render-error');
  document.body.insertAdjacentHTML(
    'beforeend',
    '<p class="error-message">3D renderer failed to start. Check the browser console for details.</p>',
  );
}
