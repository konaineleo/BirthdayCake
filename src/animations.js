import * as THREE from 'three';

const clock = new THREE.Clock();

export function startAnimation(app) {
  if (!app?.renderer || !app?.scene || !app?.camera || !app?.cakeGroup) {
    console.error('[cake] Animation did not start: missing renderer, scene, camera, or cakeGroup');
    return;
  }

  let reportedAnimationError = false;

  function tick() {
    try {
      const elapsedTime = clock.getElapsedTime();
      const delta = clock.getDelta();

      // Rotate the complete cake hierarchy as one cylindrical turntable object.
      app.cakeGroup.rotation.y = elapsedTime * 0.5;

      // Candle motion stays local to the rotating cake, so it sways while riding on the turntable.
      const candleLean = Math.sin(elapsedTime * 2.1) * 0.085;
      app.candlePivot.rotation.z = candleLean;
      app.candlePivot.rotation.x = Math.sin(elapsedTime * 1.55) * 0.025;

      // Fast scale changes and light intensity variation sell the emissive flame flicker.
      const flameScale = 1 + Math.sin(elapsedTime * 18.0) * 0.14 + Math.sin(elapsedTime * 31.0) * 0.06;
      app.flame.scale.set(0.72 + flameScale * 0.18, 1.0 + flameScale * 0.25, 0.72 + flameScale * 0.18);
      app.flame.rotation.y = elapsedTime * 3.2;
      app.flameLight.intensity = 1.25 + Math.sin(elapsedTime * 20.0) * 0.38;

      for (const sparkle of app.sparkles) {
        const pulse = (elapsedTime * sparkle.userData.speed + sparkle.userData.offset) % 1;
        const visible = pulse < 0.62;
        sparkle.visible = visible;
        if (visible) {
          const size = 0.35 + Math.sin(pulse * Math.PI) * 0.45;
          sparkle.scale.setScalar(size);
          sparkle.rotation.z += delta * 1.2;
          sparkle.userData.material.opacity = 0.2 + Math.sin(pulse * Math.PI) * 0.55;
        }
      }

      app.render();
    } catch (error) {
      if (!reportedAnimationError) {
        console.error('[cake] Animation loop error; showing fallback cube', error);
        reportedAnimationError = true;
      }
      app.ensureFallbackCube('animation-error');
      app.render();
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}
