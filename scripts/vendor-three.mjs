import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const source = join(process.cwd(), 'node_modules', 'three', 'build', 'three.module.js');
const target = join(process.cwd(), 'vendor', 'three', 'build', 'three.module.js');

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);

console.log('[cake] Vendored Three.js module copied to vendor/three/build/three.module.js');
