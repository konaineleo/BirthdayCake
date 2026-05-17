import * as THREE from 'three';

const SEGMENTS = 72;
const TAU = Math.PI * 2;

const colors = {
  chocolate: 0x4b2723,
  chocolateSide: 0x61342e,
  chocolateDark: 0x241313,
  cherry: 0xd71932,
  cherryHighlight: 0xffb1ba,
  stem: 0x201313,
  candleBlue: 0x88c7e8,
  cream: 0xfff3df,
  flame: 0xff7a32,
  flameCore: 0xfff09a,
};

export function createCake() {
  const cakeGroup = new THREE.Group();
  cakeGroup.name = 'cakeGroup';
  const materials = createMaterials();

  addTier(cakeGroup, {
    name: 'bottom',
    radius: 2.35,
    height: 1.05,
    y: 0.72,
    ribCount: 12,
    materials,
  });

  addTier(cakeGroup, {
    name: 'top',
    radius: 1.45,
    height: 0.88,
    y: 1.78,
    ribCount: 10,
    materials,
  });

  addCherryRing(cakeGroup, 2.02, 1.29, 14, materials);
  addCherryRing(cakeGroup, 1.18, 2.28, 10, materials);

  const candlePivot = createCandle(materials);
  candlePivot.position.y = 2.33;
  cakeGroup.add(candlePivot);

  return {
    cake: cakeGroup,
    cakeGroup,
    materials,
    candlePivot,
    flame: candlePivot.userData.flame,
    flameLight: candlePivot.userData.flameLight,
  };
}

function createMaterials() {
  return {
    chocolate: new THREE.MeshStandardMaterial({
      color: colors.chocolate,
      roughness: 0.68,
      metalness: 0.02,
      flatShading: true,
    }),
    chocolateSide: new THREE.MeshStandardMaterial({
      color: colors.chocolateSide,
      roughness: 0.74,
      flatShading: true,
    }),
    chocolateDark: new THREE.MeshStandardMaterial({
      color: colors.chocolateDark,
      roughness: 0.82,
      flatShading: true,
    }),
    cherry: new THREE.MeshStandardMaterial({
      color: colors.cherry,
      roughness: 0.22,
      metalness: 0.04,
    }),
    stem: new THREE.MeshStandardMaterial({ color: colors.stem, roughness: 0.9 }),
    candleBlue: new THREE.MeshStandardMaterial({ color: colors.candleBlue, roughness: 0.62 }),
    cream: new THREE.MeshStandardMaterial({ color: colors.cream, roughness: 0.58 }),
    flame: new THREE.MeshStandardMaterial({
      color: colors.flame,
      emissive: colors.flame,
      emissiveIntensity: 1.8,
      roughness: 0.38,
    }),
    flameCore: new THREE.MeshStandardMaterial({
      color: colors.flameCore,
      emissive: colors.flameCore,
      emissiveIntensity: 2.35,
      roughness: 0.32,
    }),
  };
}

function addTier(parent, { name, radius, height, y, ribCount, materials }) {
  const tier = new THREE.Group();
  tier.name = `${name}-ribbed-tier`;

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, height, SEGMENTS, 1),
    materials.chocolateSide,
  );
  body.position.y = y;
  body.castShadow = true;
  body.receiveShadow = true;
  tier.add(body);

  const topCap = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 1.01, radius * 1.01, 0.11, SEGMENTS, 1),
    materials.chocolate,
  );
  topCap.position.y = y + height / 2 + 0.055;
  topCap.castShadow = true;
  topCap.receiveShadow = true;
  tier.add(topCap);

  const bottomCap = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 1.005, radius * 1.005, 0.08, SEGMENTS, 1),
    materials.chocolateDark,
  );
  bottomCap.position.y = y - height / 2 + 0.04;
  bottomCap.castShadow = true;
  tier.add(bottomCap);

  for (let i = 1; i <= ribCount; i += 1) {
    const ribY = y - height / 2 + (i / (ribCount + 1)) * height;
    const rib = new THREE.Mesh(
      new THREE.TorusGeometry(radius * 1.006, 0.012, 5, SEGMENTS),
      i % 2 === 0 ? materials.chocolateDark : materials.chocolate,
    );
    rib.position.y = ribY;
    rib.rotation.x = Math.PI / 2;
    rib.castShadow = true;
    tier.add(rib);
  }

  parent.add(tier);
}

function addCherryRing(parent, radius, y, count, materials) {
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * TAU;
    const cherry = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 18, 12),
      materials.cherry,
    );
    cherry.scale.set(1, 0.9, 1);
    cherry.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    cherry.castShadow = true;
    parent.add(cherry);

    const highlight = new THREE.Mesh(
      new THREE.SphereGeometry(0.032, 8, 6),
      new THREE.MeshBasicMaterial({ color: colors.cherryHighlight }),
    );
    highlight.position.set(-0.04, 0.045, 0.08);
    cherry.add(highlight);

    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.01, 0.18, 5),
      materials.stem,
    );
    stem.position.set(cherry.position.x + 0.02, y + 0.14, cherry.position.z - 0.02);
    stem.rotation.x = 0.35;
    stem.rotation.z = -0.18;
    parent.add(stem);
  }
}

function createCandle(materials) {
  const pivot = new THREE.Group();

  const candle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.115, 0.115, 0.78, 14),
    materials.candleBlue,
  );
  candle.position.y = 0.39;
  candle.castShadow = true;
  pivot.add(candle);

  for (let i = 0; i < 4; i += 1) {
    const stripe = new THREE.Mesh(
      new THREE.TorusGeometry(0.118, 0.01, 5, 14),
      materials.cream,
    );
    stripe.position.y = 0.12 + i * 0.15;
    stripe.rotation.x = Math.PI / 2;
    pivot.add(stripe);
  }

  const wick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.014, 0.12, 5),
    materials.stem,
  );
  wick.position.y = 0.84;
  pivot.add(wick);

  const flame = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 14, 10),
    materials.flame,
  );
  flame.scale.set(0.72, 1.3, 0.72);
  flame.position.y = 1.02;
  pivot.add(flame);

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 10, 8),
    materials.flameCore,
  );
  core.scale.set(0.7, 1.28, 0.7);
  core.position.y = 0.01;
  flame.add(core);

  const flameLight = new THREE.PointLight(colors.flame, 1.3, 3, 2.2);
  flameLight.position.y = 1.0;
  pivot.add(flameLight);

  pivot.userData.flame = flame;
  pivot.userData.flameLight = flameLight;
  return pivot;
}
