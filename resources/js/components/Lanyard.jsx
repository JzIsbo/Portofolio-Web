import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * 3D Interactive Lanyard Component (React Bits & alfari.my.id Style)
 * Featuring:
 * - Real-time Verlet & cloth physics simulation
 * - Free 360-degree pointer drag & fling in any direction ("bisa ditarik bebas")
 * - High-contrast Steve Marvin VIP ID Card with photo, credentials, barcode & glossy finish
 * - Custom Steve Marvin woven strap with monogram and text "(S) STEVE MARVIN • BRAND ACTIVATION"
 * - Double-sided card with click/tap to flip animation
 * - Upright stabilization to ensure card stays facing forward and legible
 * - Metal clamp, silver D-ring, eyelet, and beveled card holder
 */

const CARD_SIZES = {
  portrait: [1.6, 2.25],
  landscape: [2.25, 1.6],
};
const ANCHORS = { left: 0.27, center: 0.5, right: 0.73 };
const THICKNESS = 0.018;
const BEVEL = 0.007;
const JOINTS = 4;
const MAX_STEP = 1 / 960;
const ITERATIONS = 2;
const SAMPLES = 72;
const FOV = 24;
const STRAP_WIDTH = 0.36;
const RING_RADIUS = 0.095;
const RING_TUBE = 0.0135;
const EYELET_RADIUS = 0.036;
const CLAMP_BODY = 0.15;
const FACE_WIDTH = 1024;

const FINISHES = {
  glossy: { roughness: 0.32, metalness: 0, clearcoat: 0.9, clearcoatRoughness: 0.06, foil: 0 },
  matte: { roughness: 0.75, metalness: 0, clearcoat: 0, clearcoatRoughness: 0.6, foil: 0 },
  holographic: { roughness: 0.25, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04, foil: 1 },
};

const BAND_COLUMNS = [0, 0.07, 0.93, 1];
const BAND_BEND = [-0.95, -0.28, 0.28, 0.95];
const FLIP_SPIN = 8;

const toCss = (color, alpha = 1) => `rgba(${Math.round(color[0] * 255)}, ${Math.round(color[1] * 255)}, ${Math.round(color[2] * 255)}, ${alpha})`;
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const mix = (a, b, t) => a + (b - a) * t;

const makeCanvasTexture = (canvas, anisotropy) => {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
};

const traceRoundedRect = (shape, x, y, width, height, radius) => {
  const r = Math.min(radius, width / 2, height / 2);
  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
};

const buildCardGeometry = (width, height, radius) => {
  const outline = new THREE.Shape();
  traceRoundedRect(outline, -width / 2, -height / 2, width, height, radius);
  const slot = { width: 0.38, height: 0.07, y: height / 2 - 0.14 };
  const hole = new THREE.Path();
  traceRoundedRect(hole, -slot.width / 2, slot.y - slot.height / 2, slot.width, slot.height, slot.height / 2);
  outline.holes.push(hole);
  const body = new THREE.ExtrudeGeometry(outline, {
    depth: THICKNESS,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelSegments: 5,
    curveSegments: 24,
  });
  body.translate(0, 0, -THICKNESS / 2);
  const face = new THREE.ShapeGeometry(outline, 24);
  const position = face.getAttribute('position');
  const uv = face.getAttribute('uv');
  for (let i = 0; i < position.count; i++) {
    uv.setXY(i, (position.getX(i) + width / 2) / width, (position.getY(i) + height / 2) / height);
  }
  uv.needsUpdate = true;
  return { body, face };
};

const buildClampGeometry = (width) => {
  const shape = new THREE.Shape();
  const w = width * 1.16;
  traceRoundedRect(shape, -w / 2 + 0.014, -CLAMP_BODY / 2 + 0.014, w - 0.028, CLAMP_BODY - 0.028, 0.024);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.02,
    bevelEnabled: true,
    bevelThickness: 0.014,
    bevelSize: 0.014,
    bevelSegments: 6,
    curveSegments: 10,
  });
  geometry.translate(0, 0, -0.01);
  return geometry;
};

const buildBandGeometry = (count) => {
  const columns = BAND_COLUMNS.length;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * columns * 3), 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(count * columns * 3), 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(count * columns * 2), 2));
  const index = [];
  for (let i = 0; i < count - 1; i++) {
    for (let c = 0; c < columns - 1; c++) {
      const a = i * columns + c;
      index.push(a, a + columns, a + 1, a + 1, a + columns, a + columns + 1);
    }
  }
  geometry.setIndex(index);
  return geometry;
};

const buildEnvironment = (renderer) => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0.08, 0.08, 0.1);
  const geometry = new THREE.PlaneGeometry(1, 1);
  const materials = [];
  const panel = (intensity, position, scale, rotation = 0) => {
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(intensity, intensity, intensity),
      side: THREE.DoubleSide,
    });
    materials.push(material);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.scale.set(scale[0], scale[1], 1);
    mesh.lookAt(0, 0, 0);
    mesh.rotateZ(rotation);
    scene.add(mesh);
  };
  panel(4.0, [0, 4.5, 8], [9, 4]);
  panel(7.0, [-5.5, 0.5, 7], [0.9, 14]);
  panel(5.0, [5, -0.5, 8], [0.6, 14]);
  panel(4.5, [0, -1, 9], [24, 0.35], Math.PI / 3);
  panel(3.0, [1, 2.5, 9], [24, 0.2], Math.PI / 3);
  panel(2.0, [0, 6, -6], [12, 4]);

  const target = new THREE.WebGLRenderTarget(256, 128, {
    type: THREE.HalfFloatType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
  });
  const camera = new THREE.CubeCamera(0.1, 50, target);
  camera.update(renderer, scene);
  materials.forEach((m) => m.dispose());
  geometry.dispose();
  return target;
};

const buildWeaveTexture = () => {
  const size = 64;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const diagonal1 = (x + y) & 4 ? 1 : -1;
      const diagonal2 = (x - y) & 4 ? 1 : -1;
      data[i] = ((diagonal1 * 0.25 + 0.5) * 255) | 0;
      data[i + 1] = ((diagonal2 * 0.25 + 0.5) * 255) | 0;
      data[i + 2] = 240;
      data[i + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, size, size);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
};

const drawFitted = (ctx, image, width, height) => {
  const scale = Math.max(width / image.width, height / image.height);
  const w = image.width * scale;
  const h = image.height * scale;
  ctx.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
};

const paintFace = (canvas, image) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.fillStyle = '#0a0d18';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (image) drawFitted(ctx, image, canvas.width, canvas.height);
};

const paintStrap = (canvas, image) => {
  const across = 192;
  const along = image ? Math.max(64, Math.round((image.width / image.height) * across)) : across * 2;
  canvas.width = across;
  canvas.height = along;
  const ctx = canvas.getContext('2d');
  if (!ctx) return along / across;
  ctx.fillStyle = '#0b0e18';
  ctx.fillRect(0, 0, across, along);
  if (image) {
    ctx.save();
    ctx.translate(across, 0);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(image, 0, 0, along, across);
    ctx.restore();
    return along / across;
  }
  return along / across;
};

const createSimulation = () => {
  const vectors = () => Array.from({ length: JOINTS + 1 }, () => new THREE.Vector3());
  return {
    nodes: vectors(),
    previous: vectors(),
    velocities: vectors(),
    lengths: new Float32Array(JOINTS),
    anchor: new THREE.Vector3(),
    body: {
      position: new THREE.Vector3(),
      previous: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      angular: new THREE.Vector3(),
      quaternion: new THREE.Quaternion(),
      previousQuaternion: new THREE.Quaternion(),
      hang: new THREE.Vector3(),
    },
    grab: null,
    rest: 0,
    twist: 0,
  };
};

const getLayout = (orientation, cornerRadius) => {
  const [width, height] = CARD_SIZES[orientation] || CARD_SIZES.portrait;
  const radius = Math.min(cornerRadius, width / 2 - 0.05, height / 2 - 0.05);
  const ringY = height / 2 - 0.14;
  const hangY = ringY + RING_RADIUS + RING_TUBE;
  return { width, height, radius, ringY, hangY };
};

const placeHanging = (sim, layout) => {
  sim.body.position.set(sim.anchor.x, sim.anchor.y - sim.rest * JOINTS - layout.hangY, 0);
  sim.body.previous.copy(sim.body.position);
  sim.body.velocity.set(0, 0, 0);
  sim.body.angular.set(0, 0, 0);
  sim.body.quaternion.identity();
  sim.body.previousQuaternion.identity();
  sim.body.hang.set(0, layout.hangY, 0);
  sim.nodes[0].copy(sim.anchor);
  sim.previous[0].copy(sim.anchor);
  for (let i = 1; i <= JOINTS; i++) {
    const fraction = i / JOINTS;
    const y = sim.anchor.y - fraction * (sim.anchor.y - (sim.body.position.y + layout.hangY));
    sim.nodes[i].set(sim.anchor.x, y, 0);
    sim.previous[i].copy(sim.nodes[i]);
    sim.velocities[i].set(0, 0, 0);
  }
  for (let i = 0; i < JOINTS; i++) sim.lengths[i] = sim.nodes[i].distanceTo(sim.nodes[i + 1]);
};

const stepSimulation = (sim, dt, scratch) => {
  const h = Math.min(dt, 0.02);
  const { body, nodes, previous, velocities, grab } = sim;
  const steps = Math.ceil(h / MAX_STEP);
  const stepDt = h / steps;
  const gravity = -9.8;
  const pin = scratch.a;

  for (let s = 0; s < steps; s++) {
    for (let i = 1; i <= JOINTS; i++) {
      velocities[i].subVectors(nodes[i], previous[i]).divideScalar(stepDt);
      previous[i].copy(nodes[i]);
      nodes[i].y += gravity * stepDt * stepDt * 0.45;
      nodes[i].addScaledVector(velocities[i], stepDt * 0.99);
    }
    nodes[0].copy(sim.anchor);

    body.previous.copy(body.position);
    body.previousQuaternion.copy(body.quaternion);
    body.position.addScaledVector(body.velocity, stepDt);

    // Apply angular rotation to body
    const rot = scratch.f.copy(body.angular).multiplyScalar(stepDt);
    const angle = rot.length();
    if (angle > 1e-6) {
      scratch.q.setFromAxisAngle(rot.normalize(), angle);
      body.quaternion.multiply(scratch.q);
    }

    if (grab) {
      pin.lerpVectors(grab.from, grab.target, (s + 1) / steps);
      const hang = scratch.c.copy(body.hang).applyQuaternion(body.quaternion).add(body.position);
      const diff = scratch.d.subVectors(pin, hang);
      body.position.add(diff);
      body.velocity.copy(diff).divideScalar(stepDt);
    }

    // Constraints & Joint Relaxation
    for (let iter = 0; iter < ITERATIONS; iter++) {
      for (let i = 0; i < JOINTS; i++) {
        const p1 = nodes[i];
        const p2 = nodes[i + 1];
        const delta = scratch.c.subVectors(p2, p1);
        const dist = delta.length();
        if (dist > 1e-6) {
          const error = (dist - sim.rest) / dist;
          if (i === 0) {
            p2.addScaledVector(delta, -error * 0.95);
          } else {
            p1.addScaledVector(delta, error * 0.45);
            p2.addScaledVector(delta, -error * 0.45);
          }
        }
      }
    }

    // Attach card top to last joint
    const cardHang = scratch.c.copy(body.hang).applyQuaternion(body.quaternion).add(body.position);
    nodes[JOINTS].copy(cardHang);

    // Upright stabilization torque: keeps card facing forward rather than flipping edge-on
    if (!grab) {
      const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(body.quaternion);
      // Gentle torque towards front (Z axis)
      body.angular.x -= forward.y * 10.0 * stepDt;
      body.angular.z += forward.x * 10.0 * stepDt;
    }

    // Damping
    body.velocity.multiplyScalar(0.985);
    body.angular.multiplyScalar(0.975);
  }

  if (grab) grab.from.copy(grab.target);
};

export default function Lanyard({
  frontImage = '/assets/frontCard.png',
  backImage = '/assets/backCard.png',
  strapImage = '/assets/band.png',
  size = 0.62,
  anchor = 'center',
  strapLength = 0.58,
  playBeep,
  className = '',
  style,
}) {
  const containerRef = useRef(null);
  const settingsRef = useRef(null);
  const applyRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  settingsRef.current = {
    frontImage,
    backImage,
    strapImage,
    size,
    anchor,
    strapLength,
  };

  useEffect(() => {
    applyRef.current?.();
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      return;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.25;
    const canvas = renderer.domElement;
    canvas.className = 'block w-full h-full cursor-grab active:cursor-grabbing';
    canvas.setAttribute('aria-hidden', 'true');
    container.appendChild(canvas);

    const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const scene = new THREE.Scene();
    const environment = buildEnvironment(renderer);
    scene.environment = environment.texture;

    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 200);

    // High brightness lights so the card is vibrant and legible
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.4);
    keyLight.position.set(-2.5, 4, 6);
    const fillLight = new THREE.DirectionalLight(0xffffff, 1.8);
    fillLight.position.set(3, -1, 4);
    scene.add(keyLight, fillLight);

    const rosePointLight = new THREE.PointLight(0xf43f5e, 1.8, 8);
    rosePointLight.position.set(0, 0, 4);
    scene.add(rosePointLight);

    const imageCache = new Map();
    const images = { front: null, back: null, strap: null };
    const frontCanvas = document.createElement('canvas');
    const backCanvas = document.createElement('canvas');
    const strapCanvas = document.createElement('canvas');
    const frontTexture = makeCanvasTexture(frontCanvas, anisotropy);
    const backTexture = makeCanvasTexture(backCanvas, anisotropy);
    const strapTexture = makeCanvasTexture(strapCanvas, anisotropy);
    strapTexture.wrapS = THREE.ClampToEdgeWrapping;
    strapTexture.wrapT = THREE.RepeatWrapping;
    const weave = buildWeaveTexture();

    // Material colors MUST be pure white (0xffffff) so textures retain 100% full brightness and color!
    const frontMaterial = new THREE.MeshPhysicalMaterial({
      map: frontTexture,
      color: 0xffffff,
      roughness: 0.35,
      metalness: 0.05,
      clearcoat: 0.85,
      clearcoatRoughness: 0.08,
    });
    const backMaterial = new THREE.MeshPhysicalMaterial({
      map: backTexture,
      color: 0xffffff,
      roughness: 0.35,
      metalness: 0.05,
      clearcoat: 0.85,
      clearcoatRoughness: 0.08,
    });
    const edgeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x181822,
      roughness: 0.4,
      metalness: 0.1,
    });
    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.2,
      metalness: 0.95,
    });
    const bandMaterial = new THREE.MeshPhysicalMaterial({
      map: strapTexture,
      normalMap: weave,
      normalScale: new THREE.Vector2(0.6, 0.6),
      roughness: 0.65,
      sheen: 1,
      sheenRoughness: 0.4,
      sheenColor: new THREE.Color(0.4, 0.4, 0.45),
      side: THREE.DoubleSide,
    });

    const cardGroup = new THREE.Group();
    const bodyMesh = new THREE.Mesh(undefined, edgeMaterial);
    const frontMesh = new THREE.Mesh(undefined, frontMaterial);
    const backMesh = new THREE.Mesh(undefined, backMaterial);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(RING_RADIUS, RING_TUBE, 18, 72), metalMaterial);
    ring.rotation.y = Math.PI / 2 - 0.7;
    cardGroup.add(bodyMesh, frontMesh, backMesh, ring);
    scene.add(cardGroup);

    const bandGeometry = buildBandGeometry(SAMPLES);
    const band = new THREE.Mesh(bandGeometry, bandMaterial);
    band.frustumCulled = false;
    scene.add(band);

    const clampGroup = new THREE.Group();
    const clampMesh = new THREE.Mesh(buildClampGeometry(STRAP_WIDTH), metalMaterial);
    clampMesh.position.y = EYELET_RADIUS + CLAMP_BODY / 2 - 0.004;
    const eyelet = new THREE.Mesh(new THREE.TorusGeometry(EYELET_RADIUS, 0.0105, 14, 40), metalMaterial);
    clampGroup.add(clampMesh, eyelet);
    scene.add(clampGroup);

    const sim = createSimulation();
    const points = Array.from({ length: SAMPLES }, () => new THREE.Vector3());
    const sides = Array.from({ length: SAMPLES }, () => new THREE.Vector3());
    const bends = BAND_COLUMNS.map((_, i) => [Math.cos(BAND_BEND[i]), Math.sin(BAND_BEND[i])]);
    const mouth = new THREE.Vector3();
    const tuck = new THREE.Vector3();
    const controls = [];
    const curve = new THREE.CatmullRomCurve3(controls, false, 'centripetal');
    const view = { width: 1, height: 1 };
    let layout = getLayout('portrait', 0.25);
    let applied = {};
    let tileRatio = 2;
    let placed = false;
    let lastTime = performance.now();
    let imageToken = 0;
    let alive = true;
    let raf = null;

    const paintFaces = () => {
      const width = FACE_WIDTH;
      const height = Math.round((FACE_WIDTH * layout.height) / layout.width);
      if (frontCanvas.width !== width || frontCanvas.height !== height) {
        frontCanvas.width = width;
        frontCanvas.height = height;
        backCanvas.width = width;
        backCanvas.height = height;
        frontTexture.dispose();
        backTexture.dispose();
      }
      paintFace(frontCanvas, images.front);
      paintFace(backCanvas, images.back || images.front);
      frontTexture.needsUpdate = true;
      backTexture.needsUpdate = true;
      start();
    };

    const repaintStrap = () => {
      tileRatio = paintStrap(strapCanvas, images.strap);
      weave.repeat.set(2, 2 * tileRatio);
      strapTexture.dispose();
      strapTexture.needsUpdate = true;
      start();
    };

    const frameView = () => {
      const s = settingsRef.current;
      const isMobile = view.width < 640;
      const currentSize = isMobile ? 0.65 : s.size;
      const aspect = view.width / view.height;
      let viewHeight = layout.height / clamp(currentSize, 0.15, 0.9);
      const minimumWidth = layout.width / 0.72;
      if (viewHeight * aspect < minimumWidth) viewHeight = minimumWidth / aspect;
      const viewWidth = viewHeight * aspect;
      camera.aspect = aspect;
      camera.position.set(0, 0, viewHeight / 2 / Math.tan((FOV * Math.PI) / 360));
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();

      const anchorX = ((ANCHORS[s.anchor] ?? 0.5) - 0.5) * viewWidth;
      const topY = viewHeight / 2 + 0.05;
      const cardTop = viewHeight / 2 - viewHeight * mix(0.12, 0.42, clamp(s.strapLength, 0, 1));
      sim.anchor.set(anchorX, topY, 0);
      sim.rest = Math.max(0.04, (topY - cardTop) / JOINTS);
      sim.nodes[0].copy(sim.anchor);
      sim.previous[0].copy(sim.anchor);
    };

    const apply = () => {
      const s = settingsRef.current;
      const layoutKey = `portrait|0.25`;
      if (layoutKey !== applied.layoutKey) {
        layout = getLayout('portrait', 0.25);
        const geometries = buildCardGeometry(layout.width, layout.height, layout.radius);
        bodyMesh.geometry?.dispose();
        frontMesh.geometry?.dispose();
        backMesh.geometry?.dispose();
        bodyMesh.geometry = geometries.body;
        frontMesh.geometry = geometries.face;
        backMesh.geometry = geometries.face.clone();
        frontMesh.position.z = THICKNESS / 2 + BEVEL + 0.0006;
        backMesh.rotation.y = Math.PI;
        backMesh.position.z = -(THICKNESS / 2 + BEVEL + 0.0006);
        ring.position.set(0, layout.ringY, 0);
        applied.framingKey = '';
      }
      const framingKey = `${layoutKey}|${s.size}|${s.anchor}|${s.strapLength}|${view.width}|${view.height}`;
      if (framingKey !== applied.framingKey) {
        frameView();
        if (!placed) {
          placeHanging(sim, layout);
          placed = true;
        }
      }

      const imageKey = `${s.frontImage}|${s.backImage}|${s.strapImage}`;
      if (imageKey !== applied.imageKey) {
        const token = ++imageToken;
        const load = (src) => {
          if (!src) return Promise.resolve(null);
          let p = imageCache.get(src);
          if (!p) {
            p = new Promise((resolve) => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => resolve(img);
              img.onerror = () => resolve(null);
              img.src = src;
            });
            imageCache.set(src, p);
          }
          return p;
        };

        Promise.all([load(s.frontImage), load(s.backImage), load(s.strapImage)]).then(([front, back, strap]) => {
          if (!alive || token !== imageToken) return;
          images.front = front;
          images.back = back;
          images.strap = strap;
          paintFaces();
          repaintStrap();
        });
      }

      applied = { layoutKey, framingKey, imageKey };
      start();
    };

    const updateBand = () => {
      const hang = sim.nodes[JOINTS];
      const reach = EYELET_RADIUS + CLAMP_BODY + 0.05;
      let guide = JOINTS - 1;
      while (guide > 0 && sim.nodes[guide].distanceTo(hang) < reach * 1.1) guide--;
      const axis = new THREE.Vector3().subVectors(sim.nodes[guide], hang);
      if (axis.lengthSq() < 1e-8) axis.set(0, 1, 0).applyQuaternion(sim.body.quaternion);
      axis.normalize();
      mouth.copy(hang).addScaledVector(axis, reach);
      tuck.copy(hang).addScaledVector(axis, EYELET_RADIUS + CLAMP_BODY * 0.35);
      controls.length = 0;
      for (let i = 0; i <= guide; i++) controls.push(sim.nodes[i]);
      controls.push(mouth, tuck);
      curve.updateArcLengths();
      for (let i = 0; i < SAMPLES; i++) curve.getPointAt(i / (SAMPLES - 1), points[i]);
      const length = curve.getLength();
      const held = 1 - mouth.distanceTo(tuck) / Math.max(length, 0.001);
      const position = bandGeometry.getAttribute('position');
      const normal = bandGeometry.getAttribute('normal');
      const uv = bandGeometry.getAttribute('uv');
      const columns = BAND_COLUMNS.length;
      const restLength = sim.rest * JOINTS;
      const repeats = restLength / (STRAP_WIDTH * tileRatio);
      const width = STRAP_WIDTH / Math.pow(Math.max(1, length / Math.max(restLength, 0.001)), 0.35);

      const tangent = new THREE.Vector3();
      const toCamera = new THREE.Vector3();
      const across = new THREE.Vector3();
      const facing = new THREE.Vector3();

      for (let i = 0; i < SAMPLES; i++) {
        tangent.subVectors(points[Math.min(SAMPLES - 1, i + 1)], points[Math.max(0, i - 1)]);
        if (tangent.lengthSq() < 1e-12) tangent.set(0, -1, 0);
        tangent.normalize();
        toCamera.subVectors(camera.position, points[i]).normalize();
        const side = sides[i].crossVectors(toCamera, tangent);
        if (side.lengthSq() < 1e-10) side.copy(i > 0 ? sides[i - 1] : new THREE.Vector3(1, 0, 0));
        side.normalize();
        if (i > 0 && side.dot(sides[i - 1]) < 0) side.negate();
        const angle = -sim.twist * Math.pow(Math.min(1, i / (SAMPLES - 1) / held), 1.3);
        facing.crossVectors(tangent, side);
        across.copy(side).multiplyScalar(Math.cos(angle)).addScaledVector(facing, Math.sin(angle));
        facing.crossVectors(tangent, across);
        const p = points[i];
        const v = (1 - i / (SAMPLES - 1)) * repeats;
        for (let c = 0; c < columns; c++) {
          const k = i * columns + c;
          const offset = (BAND_COLUMNS[c] - 0.5) * width;
          const [bendCos, bendSin] = bends[c];
          position.setXYZ(k, p.x + across.x * offset, p.y + across.y * offset, p.z + across.z * offset);
          normal.setXYZ(
            k,
            facing.x * bendCos + across.x * bendSin,
            facing.y * bendCos + across.y * bendSin,
            facing.z * bendCos + across.z * bendSin
          );
          uv.setXY(k, BAND_COLUMNS[c], v);
        }
      }
      position.needsUpdate = true;
      normal.needsUpdate = true;
      uv.needsUpdate = true;
    };

    const updateTransforms = () => {
      cardGroup.position.copy(sim.body.position);
      cardGroup.quaternion.copy(sim.body.quaternion);
      clampGroup.position.copy(sim.nodes[JOINTS]);
      clampGroup.quaternion.copy(sim.body.quaternion);
    };

    const render = () => {
      renderer.render(scene, camera);
    };

    const scratch = {
      a: new THREE.Vector3(),
      b: new THREE.Vector3(),
      c: new THREE.Vector3(),
      d: new THREE.Vector3(),
      f: new THREE.Vector3(),
      q: new THREE.Quaternion(),
    };

    const tick = (now) => {
      if (!alive) return;
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      stepSimulation(sim, dt, scratch);
      updateTransforms();
      updateBand();
      render();
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (raf) return;
      lastTime = performance.now();
      raf = requestAnimationFrame(tick);
    };

    // --- Free Dragging & Pointer Handling ---
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let press = null;

    const toPointer = (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
    };

    const pickCard = () => {
      const hits = raycaster.intersectObjects([bodyMesh, frontMesh, backMesh], false);
      return hits.length ? hits[0] : null;
    };

    const flip = (point) => {
      const local = cardGroup.worldToLocal(point.clone());
      const sign = local.x > 0 ? 1 : -1;
      const torque = new THREE.Vector3(0, sign * FLIP_SPIN, 0).applyQuaternion(sim.body.quaternion);
      sim.body.angular.add(torque);
      playBeep?.(850);
      start();
    };

    const onPointerDown = (event) => {
      toPointer(event);
      const hit = pickCard();
      if (!hit) return;
      const point = hit.point.clone();
      sim.grab = {
        point,
        target: point.clone(),
        from: point.clone(),
        reach: raycaster.ray.origin.distanceTo(point),
      };
      press = { x: event.clientX, y: event.clientY, time: performance.now(), point: hit.point.clone() };
      canvas.setPointerCapture?.(event.pointerId);
      setIsDragging(true);
      event.preventDefault();
      start();
    };

    const onPointerMove = (event) => {
      toPointer(event);
      if (sim.grab) {
        if (press && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 6) press = null;
        raycaster.ray.at(sim.grab.reach, sim.grab.target);
        start();
      }
    };

    const onPointerUp = (event) => {
      if (!sim.grab) return;
      sim.grab = null;
      setIsDragging(false);
      if (press && event.type === 'pointerup' && performance.now() - press.time < 450) flip(press.point);
      press = null;
      canvas.releasePointerCapture?.(event.pointerId);
      start();
    };

    const onTouchStart = (event) => {
      if (event.touches.length !== 1) return;
      toPointer(event.touches[0]);
      if (pickCard()) event.preventDefault();
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('lostpointercapture', onPointerUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });

    const resize = () => {
      view.width = Math.max(1, container.clientWidth);
      view.height = Math.max(1, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(view.width, view.height, false);
      apply();
      render();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    applyRef.current = apply;
    resize();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      applyRef.current = null;
      resizeObserver.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('lostpointercapture', onPointerUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      [bodyMesh, frontMesh, backMesh, ring, clampMesh, eyelet, band].forEach((mesh) => mesh.geometry?.dispose());
      [frontMaterial, backMaterial, edgeMaterial, metalMaterial, bandMaterial].forEach((material) => material.dispose());
      [frontTexture, backTexture, strapTexture, weave].forEach((texture) => texture.dispose());
      environment.dispose();
      renderer.dispose();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[480px] sm:h-[540px] md:h-[620px] lg:h-[680px] flex items-center justify-center select-none ${className}`}
      style={style}
    >
      {/* Interactive Helper Hint Badge */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-rose-500/30 text-[11px] sm:text-xs text-slate-200 shadow-xl pointer-events-none transition-all duration-300 max-w-[92%] truncate z-20 ${
          isDragging ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
        <span className="truncate font-medium">Tarik bebas & Sentuh / Klik untuk Membalik ID Card</span>
      </div>

      {/* Active interaction indicator */}
      {isDragging && (
        <div className="absolute top-4 right-4 text-[10px] uppercase font-mono px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 backdrop-blur-sm pointer-events-none animate-pulse z-20">
          Tarik Bebas
        </div>
      )}
    </div>
  );
}
