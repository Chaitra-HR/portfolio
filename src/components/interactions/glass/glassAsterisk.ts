import * as THREE from 'three';
import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes.js';

/*
 * The mascot's body in 3D (three.js), in iridescent liquid glass:
 *   - exactly the 2D mark's shape (six straight rounded arms, as in the Home
 *     sidebar), built as one continuous surface from a distance field, so the
 *     outline stays crisp and the arms meet in one seamless piece;
 *   - a physical glass material: transmission, a lavender tint through its
 *     thickness, thin-film iridescence, clear coat and a little dispersion;
 *   - alive like liquid: slow ripples drift over the surface, the arms sway
 *     in and out of the plane, and every few seconds it does something small
 *     (a jiggle, a hop, a wiggle) on springs, with squash and stretch;
 *   - a studio of white strips and lavender, pink and blue panels for it to
 *     reflect, and a hidden backdrop (light centre, deep violet edges) that
 *     only the refraction sees, so the body stays clear while its rims go deep.
 * Loaded on demand (this module is the only one that imports three).
 */

/** Where the body is this frame, so the 2D face can ride on it. */
interface Pose {
  /** Tilt toward the pointer (radians). */
  rx: number;
  ry: number;
  /** Turn from a poke (radians, 0 → 2π). */
  spin: number;
  /** Roll in the picture plane (radians). */
  roll: number;
  /** Squash (+) or stretch (−): widths scale by 1 + squash, heights by 1 − squash. */
  squash: number;
  /** Vertical hop, as a share of the mascot's height (up is +). */
  lift: number;
}

export interface GlassAsterisk {
  /** Point the asterisk toward a pointer offset (-1…1 on each axis). */
  tilt(x: number, y: number): void;
  /** One full turn about the vertical axis. */
  spin(ms: number): void;
  resize(px: number): void;
  /** Pause rendering when off screen. */
  setRunning(on: boolean): void;
  destroy(): void;
}

interface Options {
  /** The surface behind the (transparent) canvas. */
  background: string;
  reducedMotion: boolean;
  /** Lighter rendering for phones: a lower pixel ratio and no dispersion. */
  lite?: boolean;
  /** Called every frame with the body's pose, so a 2D face can follow it. */
  onFrame?: (pose: Pose) => void;
}

const ARMS = 6;
// The same shape as the 2D asterisk (Asterisk.tsx): six straight rounded arms,
// 42 wide and 88 long in its 200-unit box. One box unit is 0.01 here.
const ARM_RADIUS = 0.21;
const ARM_LENGTH = 0.88;
/** A tiny fillet where the arms meet: keeps the junction crisp but seamless. */
const FILLET = 0.025;
const RESOLUTION = 80;
const TILT = 0.38; // max radians toward the pointer
const SMOOTH = 7; // tilt follow rate (1/s)
/** Idle moves come every IDLE_MIN…IDLE_MIN + IDLE_SPREAD seconds. */
const IDLE_MIN = 3.5;
const IDLE_SPREAD = 4;

interface Spring {
  x: number;
  v: number;
  /** stiffness, damping */
  k: number;
  c: number;
}
const spring = (k: number, c: number): Spring => ({ x: 0, v: 0, k, c });
function step(sp: Spring, dt: number) {
  sp.v += (-sp.k * sp.x - sp.c * sp.v) * dt;
  sp.x += sp.v * dt;
}

/*
 * The liquid, in the vertex shader (the outline keeps its shape; only the
 * surface moves). Ripples push along the normal; the arms bend in depth with
 * a wave that travels round, and breathe in length; a jiggle rings out from
 * the centre and fades. Normals are rebuilt from two nearby displaced points.
 */
const LIQUID = `
uniform float uTime;
uniform float uWob;
uniform float uJigAge;
vec3 liquid(vec3 p, vec3 n) {
  float r = length(p.xy);
  float th = atan(p.y, p.x);
  float f = 0.010 * sin(p.x * 5.0 + uTime * 1.4) * sin(p.y * 4.4 - uTime * 1.15)
          + 0.006 * sin(r * 9.0 - uTime * 2.1 + th * 2.0)
          + 0.028 * exp(-uJigAge * 2.6) * sin(r * 11.0 - uJigAge * 16.0);
  vec3 q = p + n * f * uWob;
  q.z += uWob * 0.055 * r * r * sin(3.0 * th - uTime * 1.2);
  q.xy *= 1.0 + uWob * 0.018 * sin(2.0 * th + uTime * 0.9);
  return q;
}
`;

function makeLiquid(material: THREE.MeshPhysicalMaterial) {
  const uniforms = { uTime: { value: 0 }, uWob: { value: 1 }, uJigAge: { value: 10 } };
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${LIQUID}`)
      .replace(
        '#include <beginnormal_vertex>',
        `#include <beginnormal_vertex>
        vec3 liqN = normalize(objectNormal);
        vec3 liqT = normalize(abs(liqN.z) < 0.9 ? cross(liqN, vec3(0.0, 0.0, 1.0)) : cross(liqN, vec3(1.0, 0.0, 0.0)));
        vec3 liqB = cross(liqN, liqT);
        vec3 liqP = liquid(position, liqN);
        objectNormal = normalize(cross(liquid(position + liqT * 0.01, liqN) - liqP, liquid(position + liqB * 0.01, liqN) - liqP));`,
      )
      .replace('#include <begin_vertex>', 'vec3 transformed = liqP;');
  };
  material.customProgramCacheKey = () => 'asterisk-liquid';
  return uniforms;
}

function studio(renderer: THREE.WebGLRenderer): THREE.Texture {
  const env = new THREE.Scene();
  // deep indigo surroundings give the glass its dark, coloured edges
  const room = new THREE.Mesh(new THREE.BoxGeometry(12, 12, 12), new THREE.MeshBasicMaterial({ color: '#1E1650', side: THREE.BackSide }));
  env.add(room);
  const panel = (color: string, intensity: number, w: number, h: number, pos: [number, number, number]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    env.add(m);
  };
  panel('#FFFFFF', 12, 4, 1.2, [-3, 4.5, 3.5]); // key softbox, top left
  panel('#FFFFFF', 8, 0.5, 7, [4, 1, 4]); // thin strip, right — long wet streaks
  panel('#FFFFFF', 5, 7, 0.4, [0, -4.5, 3]); // floor strip — a rim along the bottom
  panel('#B49CFF', 3, 4, 6, [-5.5, -0.5, 1]); // lavender, left
  panel('#FF7CCB', 3.2, 4, 3, [3.5, -4.5, 1]); // pink, bottom right
  panel('#5FA2FF', 3.4, 3, 6, [5.5, 0, -1]); // blue, right
  panel('#6A4CFF', 1.6, 8, 8, [0, 0, -5.5]); // violet, behind
  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(env, 0.02).texture;
  pmrem.dispose();
  env.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.geometry.dispose();
      (o.material as THREE.Material).dispose();
    }
  });
  return tex;
}

/**
 * What the glass refracts. With a transparent canvas three would refract plain
 * white; this plane is drawn only into the refraction pass, never to screen.
 * Rays through the rims bend furthest, so they pick up its deep outer colours.
 */
function backdrop(): THREE.Mesh {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const x = c.getContext('2d')!;
  const ring = x.createRadialGradient(256, 256, 0, 256, 256, 300);
  for (const [at, col] of [[0, '#FFFFFF'], [0.15, '#EFE8FF'], [0.32, '#B9A4FF'], [0.5, '#6646EA'], [0.75, '#2E1C94'], [1, '#1A1060']] as const) ring.addColorStop(at, col);
  x.fillStyle = ring;
  x.fillRect(0, 0, 512, 512);
  // iridescent pools of pink, blue and lavender
  const pools: Array<[number, number, number, string]> = [
    [360, 350, 120, '255,105,195,.9'],
    [370, 150, 110, '80,165,255,.9'],
    [150, 160, 100, '170,140,255,.8'],
    [150, 370, 110, '255,135,215,.7'],
    [256, 256, 60, '255,240,250,.6'],
  ];
  for (const [cx, cy, r, rgba] of pools) {
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, `rgba(${rgba})`);
    g.addColorStop(1, `rgba(${rgba.replace(/,[^,]+$/, ',0')})`);
    x.fillStyle = g;
    x.fillRect(0, 0, 512, 512);
  }
  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial({ map, toneMapped: false });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), material);
  plane.position.z = -1.2;
  // the refraction pass renders into its own target; the screen pass has none
  plane.onBeforeRender = (r) => {
    const toScreen = r.getRenderTarget() === null;
    material.colorWrite = !toScreen;
    material.depthWrite = !toScreen;
  };
  return plane;
}

/** Signed distance (local units) from p to the 2D mark's six arms, as round-ended rods. */
function asteriskDistance(px: number, py: number, pz: number): number {
  let d = Infinity;
  for (let k = 0; k < ARMS; k++) {
    const a = Math.PI / 2 + (k * Math.PI * 2) / ARMS;
    const ux = Math.cos(a);
    const uy = Math.sin(a);
    const t = Math.min(Math.max(px * ux + py * uy, 0), ARM_LENGTH - ARM_RADIUS);
    const dx = px - ux * t;
    const dy = py - uy * t;
    const arm = Math.sqrt(dx * dx + dy * dy + pz * pz) - ARM_RADIUS;
    // smooth union
    const h = Math.max(FILLET - Math.abs(d - arm), 0) / FILLET;
    d = Math.min(d, arm) - h * h * FILLET * 0.25;
  }
  return d;
}

/** The mark's surface from its distance field — built once and shared by every mascot on the page. */
let sharedSurface: THREE.BufferGeometry | null = null;
function asteriskGeometry(): THREE.BufferGeometry {
  if (sharedSurface) return sharedSurface;
  const mc = new MarchingCubes(RESOLUTION, new THREE.MeshBasicMaterial(), false, false, 160000);
  mc.isolation = 0.5;
  const n = RESOLUTION;
  const half = n / 2;
  mc.field.fill(-1); // well outside
  for (let z = 0; z < n; z++) {
    const pz = (z - half) / half;
    if (Math.abs(pz) > ARM_RADIUS + 0.1) continue; // the mark is a flat-ish slab; skip empty space
    for (let y = 0; y < n; y++)
      for (let xi = 0; xi < n; xi++) {
        const d = asteriskDistance((xi - half) / half, (y - half) / half, pz);
        mc.field[z * n * n + y * n + xi] = 0.5 - d * 6;
      }
  }
  mc.update();
  // keep just the triangles drawn, in a plain geometry of its own
  const n3 = mc.count * 3;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute((mc.geometry.getAttribute('position').array as Float32Array).slice(0, n3), 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute((mc.geometry.getAttribute('normal').array as Float32Array).slice(0, n3), 3));
  mc.geometry.dispose();
  (mc.material as THREE.Material).dispose();
  sharedSurface = geometry;
  return geometry;
}

export function createGlassAsterisk(canvas: HTMLCanvasElement, opts: Options): GlassAsterisk {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.lite ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  // transparent canvas; the glass refracts the page colour behind it
  renderer.setClearColor(new THREE.Color(opts.background), 0);

  const scene = new THREE.Scene();
  const envMap = studio(renderer);
  scene.environment = envMap;
  const behind = backdrop();
  scene.add(behind);

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  camera.position.set(0, 0, 5.2);

  const material = new THREE.MeshPhysicalMaterial({
    color: '#FFFFFF',
    metalness: 0,
    roughness: 0.02,
    transmission: 1,
    thickness: 2.2,
    ior: 1.5,
    // a light tint only: the glass stays clear; colour comes from the rims
    attenuationColor: new THREE.Color('#CFC2FF'),
    attenuationDistance: 3.2,
    iridescence: 1,
    iridescenceIOR: 1.5,
    iridescenceThicknessRange: [100, 1200],
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    specularIntensity: 1,
    envMapIntensity: 1.7,
    dispersion: opts.lite ? 0 : 3,
  });

  const liquid = makeLiquid(material);
  liquid.uWob.value = opts.reducedMotion ? 0 : 1;

  const surface = new THREE.Mesh(asteriskGeometry(), material);
  const body = new THREE.Group();
  body.add(surface);
  scene.add(body);

  // a soft key light for extra sparkle on the clear coat
  const key = new THREE.DirectionalLight('#FFFFFF', 1.4);
  key.position.set(-2, 3, 4);
  scene.add(key);

  let t = 0;

  // springy life: squash/stretch, roll, hop
  const squash = spring(170, 8);
  const roll = spring(80, 5.5);
  const lift = spring(110, 7);
  let nextIdle = IDLE_MIN + Math.random() * IDLE_SPREAD;
  const jiggle = (amount = 1) => {
    liquid.uJigAge.value = 0;
    squash.v += 1.1 * amount;
  };
  const idle = () => {
    const pick = Math.random();
    if (pick < 0.4) jiggle();
    else if (pick < 0.7) {
      // a little hop: stretch up, then land with a squash
      lift.v += 1.1;
      squash.v -= 1.3;
    } else roll.v += (Math.random() < 0.5 ? -1 : 1) * 2; // a wiggle
  };

  const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
  const spin = { from: 0, start: 0, ms: 0, value: 0 };
  let running = true;
  let frame = 0;
  let last = 0;

  const draw = () => {
    const sway = opts.reducedMotion ? 0 : Math.sin(t * 0.45) * 0.07;
    body.rotation.x = -0.12 + tilt.x;
    body.rotation.y = 0.18 + tilt.y + spin.value;
    body.rotation.z = sway + roll.x;
    body.scale.set(1 + squash.x, 1 - squash.x, 1);
    // lift is in mascot heights; the mascot box is 2 units tall
    body.position.y = lift.x * 2;
    liquid.uTime.value = t;
    renderer.render(scene, camera);
    opts.onFrame?.({ rx: tilt.x, ry: tilt.y, spin: spin.value, roll: body.rotation.z, squash: squash.x, lift: lift.x });
  };

  const tick = (now: number) => {
    frame = 0;
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
    last = now;
    t += dt;
    const k = 1 - Math.exp(-SMOOTH * dt);
    tilt.x += (tilt.tx - tilt.x) * k;
    tilt.y += (tilt.ty - tilt.y) * k;
    if (spin.ms) {
      const p = Math.min((now - spin.start) / spin.ms, 1);
      const e = p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2;
      spin.value = spin.from + Math.PI * 2 * e;
      if (p >= 1) {
        spin.value = 0;
        spin.ms = 0;
        jiggle(0.8); // lands with a wobble
      }
    }
    if (!opts.reducedMotion) {
      liquid.uJigAge.value += dt;
      for (const sp of [squash, roll, lift]) step(sp, dt);
      if (t > nextIdle) {
        if (!spin.ms) idle();
        nextIdle = t + IDLE_MIN + Math.random() * IDLE_SPREAD;
      }
    }
    // Calm (only the slow ripple moving): draw every other frame, 30 fps, to spare the
    // CPU/GPU (and battery); anything livelier (tilt, poke, hop, jiggle) is drawn at 60.
    // With reduced motion nothing moves on its own, so it draws once and rests.
    const settling = [squash, roll, lift].some((sp) => Math.abs(sp.x) > 0.002 || Math.abs(sp.v) > 0.02);
    const calm = !spin.ms && !settling && Math.abs(tilt.tx - tilt.x) < 1e-3 && Math.abs(tilt.ty - tilt.y) < 1e-3 && liquid.uJigAge.value > 1.5;
    if (!calm || (skip = !skip)) draw();
    if (running && !(opts.reducedMotion && calm)) frame = requestAnimationFrame(tick);
  };

  let skip = false;
  const start = () => {
    if (!frame && running) {
      last = 0;
      frame = requestAnimationFrame(tick);
    }
  };

  draw();
  start();

  return {
    tilt(x, y) {
      if (opts.reducedMotion) return;
      tilt.ty = x * TILT;
      tilt.tx = y * TILT;
    },
    spin(ms) {
      if (opts.reducedMotion) return;
      spin.from = 0;
      spin.start = performance.now();
      spin.ms = ms;
      squash.v -= 1.4; // stretches as it winds up
      start();
    },
    resize(px) {
      renderer.setSize(px, px, false);
      camera.aspect = 1;
      camera.updateProjectionMatrix();
      draw();
    },
    setRunning(on) {
      running = on;
      if (on) start();
      else if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    },
    destroy() {
      running = false;
      cancelAnimationFrame(frame);
      material.dispose();
      behind.geometry.dispose();
      (behind.material as THREE.MeshBasicMaterial).map?.dispose();
      (behind.material as THREE.Material).dispose();
      envMap.dispose();
      renderer.dispose();
    },
  };
}
