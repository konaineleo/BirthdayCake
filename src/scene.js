import * as THREE from 'three';
import { createCake } from './cake.js';

export function createScene(canvas = document.getElementById('scene')) {
  const renderCanvas = ensureCanvas(canvas);
  const renderer = new THREE.WebGLRenderer({
    canvas: renderCanvas,
    antialias: false,
    alpha: true,
    preserveDrawingBuffer: true,
  });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  scene.background = null;
  scene.fog = new THREE.Fog(0xf5eafa, 7.5, 14);

  // Straight-on view keeps the layered cake face readable while it rotates.
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 1.85, 9.2);
  camera.lookAt(0, 1.55, 0);

  const controls = new THREE.Group();
  scene.add(controls);

  addLighting(scene);
  addEnvironment(scene);

  let cakeParts;
  try {
    cakeParts = createCake();
  } catch (error) {
    console.error('[cake] Cake creation failed; showing fallback cube', error);
    cakeParts = createFallbackCakeParts();
  }

  cakeParts.cakeGroup.position.y = 0.0;
  cakeParts.cakeGroup.scale.setScalar(0.82);
  controls.add(cakeParts.cakeGroup);

  const sparkles = createSparkles(scene);
  let fallbackCube = null;

  function resize() {
    const host = renderCanvas.parentElement || renderCanvas;
    const rect = host.getBoundingClientRect();
    const pixelScale = window.innerWidth < 700 ? 3 : 4;
    const cssWidth = Math.max(1, Math.floor(rect.width || window.innerWidth || 960));
    const cssHeight = Math.max(1, Math.floor(rect.height || window.innerHeight || 720));
    const width = Math.max(1, Math.floor(cssWidth / pixelScale));
    const height = Math.max(1, Math.floor(cssHeight / pixelScale));

    renderer.setPixelRatio(1);
    renderer.setSize(width, height, false);
    renderCanvas.style.width = `${cssWidth}px`;
    renderCanvas.style.height = `${cssHeight}px`;

    camera.aspect = cssWidth / cssHeight;
    camera.updateProjectionMatrix();
  }

  window.addEventListener('resize', resize);
  if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(renderCanvas.parentElement || renderCanvas);
  }
  resize();

  const app = {
    renderer,
    scene,
    camera,
    controls,
    sparkles,
    ...cakeParts,
    ensureFallbackCube(reason = 'unknown') {
      if (!fallbackCube) {
        fallbackCube = createFallbackCube();
        scene.add(fallbackCube);
        console.warn(`[cake] Fallback cube enabled: ${reason}`);
      }
      fallbackCube.visible = true;
      return fallbackCube;
    },
    render() {
      renderer.render(scene, camera);
    },
  };

  validateScene(app);
  app.render();

  return app;
}

function ensureCanvas(canvas) {
  const existingCanvas = canvas instanceof HTMLCanvasElement ? canvas : null;
  const renderCanvas = existingCanvas || document.createElement('canvas');
  renderCanvas.id ||= 'scene';

  // The renderer's canvas must be in the document for correct sizing and display.
  if (!document.body.contains(renderCanvas)) {
    document.body.appendChild(renderCanvas);
  }
  console.info('[cake] Renderer canvas attached', { id: renderCanvas.id });

  return renderCanvas;
}

function addLighting(scene) {
  const hemi = new THREE.HemisphereLight(0xfff7ff, 0x7b5f70, 2.15);
  scene.add(hemi);

  // Static offset light gives flat-shaded faces changing highlights while cakeGroup rotates.
  const turntableKey = new THREE.DirectionalLight(0xffffff, 1.85);
  turntableKey.position.set(5, 5, 5);
  turntableKey.castShadow = true;
  turntableKey.shadow.mapSize.set(1024, 1024);
  turntableKey.shadow.camera.near = 0.5;
  turntableKey.shadow.camera.far = 16;
  turntableKey.shadow.camera.left = -5;
  turntableKey.shadow.camera.right = 5;
  turntableKey.shadow.camera.top = 5;
  turntableKey.shadow.camera.bottom = -5;
  scene.add(turntableKey);

  const key = new THREE.DirectionalLight(0xfff1df, 2.6);
  key.position.set(-3.2, 5.5, 4.0);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 14;
  key.shadow.camera.left = -5;
  key.shadow.camera.right = 5;
  key.shadow.camera.top = 5;
  key.shadow.camera.bottom = -5;
  scene.add(key);

  const fill = new THREE.PointLight(0xd8b6ff, 1.6, 8);
  fill.position.set(3.4, 2.7, 3.2);
  scene.add(fill);
}

function addEnvironment(scene) {
  const floorMaterial = new THREE.ShadowMaterial({
    color: 0x7a586f,
    opacity: 0.22,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(18, 18), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.04;
  floor.receiveShadow = true;
  scene.add(floor);
}

function createSparkles(scene) {
  const sparkles = [];
  const material = new THREE.MeshBasicMaterial({
    color: 0xfffbf3,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
  });

  const positions = [
    [-2.6, 2.5, 0.6],
    [2.4, 2.25, -0.1],
    [1.5, 3.25, 0.8],
    [-1.7, 3.1, -0.7],
    [0.1, 3.55, -0.35],
  ];

  for (let i = 0; i < positions.length; i += 1) {
    const sparkle = new THREE.Group();
    const armA = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.035, 0.035), material.clone());
    const armB = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.34, 0.035), armA.material);
    sparkle.add(armA, armB);
    sparkle.position.set(...positions[i]);
    sparkle.userData.speed = 0.34 + i * 0.045;
    sparkle.userData.offset = i * 0.19;
    sparkle.userData.material = armA.material;
    scene.add(sparkle);
    sparkles.push(sparkle);
  }

  return sparkles;
}

function validateScene(app) {
  const visibleLights = [];
  app.scene.traverse((object) => {
    if (object.isLight && object.visible && object.intensity > 0) {
      visibleLights.push(object);
    }
  });

  if (visibleLights.length === 0) {
    console.warn('[cake] No visible lights found; adding emergency ambient light');
    app.scene.add(new THREE.AmbientLight(0xffffff, 1));
  }

  const box = new THREE.Box3().setFromObject(app.cakeGroup);
  if (box.isEmpty()) {
    app.ensureFallbackCube('empty-cake-bounds');
    return;
  }

  const sphere = new THREE.Sphere();
  box.getBoundingSphere(sphere);
  app.camera.updateMatrixWorld();
  app.camera.updateProjectionMatrix();

  const frustum = new THREE.Frustum();
  const matrix = new THREE.Matrix4().multiplyMatrices(app.camera.projectionMatrix, app.camera.matrixWorldInverse);
  frustum.setFromProjectionMatrix(matrix);

  if (!frustum.intersectsSphere(sphere)) {
    console.warn('[cake] Cake was outside camera frustum; resetting camera');
    app.camera.position.set(0, 1.85, 9.2);
    app.camera.lookAt(0, 1.55, 0);
    app.camera.updateProjectionMatrix();
  }

  console.info('[cake] Render checks passed', {
    lights: visibleLights.length,
    cakeRadius: Number(sphere.radius.toFixed(2)),
  });
}

function createFallbackCakeParts() {
  const cakeGroup = new THREE.Group();
  cakeGroup.name = 'cakeGroup';
  const candlePivot = new THREE.Group();
  const flame = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 12, 8),
    new THREE.MeshBasicMaterial({ color: 0xff6633 }),
  );
  const flameLight = new THREE.PointLight(0xff6633, 1, 3);
  candlePivot.add(flame, flameLight);
  cakeGroup.add(candlePivot);

  return {
    cake: cakeGroup,
    cakeGroup,
    candlePivot,
    flame,
    flameLight,
  };
}

function createFallbackCube() {
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 1.1, 1.1),
    new THREE.MeshStandardMaterial({ color: 0x44ccff, roughness: 0.55 }),
  );
  cube.name = 'temporary-render-test-cube';
  cube.position.set(0, 1.0, 0);
  cube.castShadow = true;
  cube.receiveShadow = true;
  return cube;
}
