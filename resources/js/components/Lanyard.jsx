import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * 3D Interactive Lanyard Component (React Bits & alfari.my.id Style)
 * Featuring:
 * - Real-time Verlet & cloth physics simulation
 * - Free 360-degree pointer drag & fling in any direction ("bisa ditarik bebas")
 * - Dynamic Steve Marvin VIP ID Card with photo, credentials, barcode & holographic foil
 * - Custom Steve Marvin woven strap with monogram and text "(S) STEVE MARVIN ★ BRAND ACTIVATION"
 * - Double-sided card with click/tap to flip animation
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
const NODE_WEIGHT = 1 / 0.05;
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
  glossy: { roughness: 0.42, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.06, foil: 0, anisotropy: 0 },
  matte: { roughness: 0.85, metalness: 0, clearcoat: 0, clearcoatRoughness: 0.6, foil: 0, anisotropy: 0 },
  holographic: { roughness: 0.3, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04, foil: 1, anisotropy: 0 },
  metallic: { roughness: 0.36, metalness: 0.75, clearcoat: 0.5, clearcoatRoughness: 0.18, foil: 0, anisotropy: 0.7 },
};

const BAND_COLUMNS = [0, 0.07, 0.93, 1];
const BAND_BEND = [-0.95, -0.28, 0.28, 0.95];
const FLIP_SPIN = 9;

const FOIL_VERTEX_HEAD = `
varying vec2 vFoilUv;
varying vec3 vFoilX;
varying vec3 vFoilY;
`;

const FOIL_VERTEX_BODY = `
vFoilUv = uv;
vFoilX = normalize((modelViewMatrix * vec4(1.0, 0.0, 0.0, 0.0)).xyz);
vFoilY = normalize((modelViewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz);
`;

const FOIL_FRAGMENT_HEAD = `
uniform float foilStrength;
uniform float foilAspect;
uniform vec3 foilKey;
uniform vec3 foilFill;
uniform vec3 foilTop;
varying vec2 vFoilUv;
varying vec3 vFoilX;
varying vec3 vFoilY;

float foilHash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float foilBump(float t, float center, float width) {
  float x = (t - center) / width;
  return max(0.0, 1.0 - x * x);
}

vec3 foilSpectrum(float t) {
  return vec3(
    foilBump(t, 0.82, 0.32) + 0.4 * foilBump(t, 0.02, 0.12),
    foilBump(t, 0.5, 0.26),
    foilBump(t, 0.18, 0.24)
  );
}

vec3 foilGrating(float u, float spacing) {
  vec3 color = vec3(0.0);
  for (int m = 1; m <= 2; m++) {
    float order = float(m);
    float t = (spacing * abs(u) / order - 0.38) / 0.32;
    color += foilSpectrum(t) / order;
  }
  return color;
}

vec3 foilShard(vec2 p) {
  vec2 base = floor(p);
  float best = 9.0;
  float edge = 9.0;
  vec2 id = base;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 cell = base + vec2(float(i), float(j));
      vec2 site = cell + vec2(foilHash(cell), foilHash(cell + 7.31)) * 0.9 + 0.05;
      float d = length(site - p);
      if (d < best) {
        edge = best;
        best = d;
        id = cell;
      } else if (d < edge) {
        edge = d;
      }
    }
  }
  float slope = foilHash(id + 11.7) * 2.0 - 1.0;
  float tilt = foilHash(id + 19.1) * 2.0 - 1.0;
  float roll = foilHash(id + 23.3) * 6.28318;
  float spark = pow(max(0.0, 1.0 - (edge - best) * 12.0), 2.0);
  return vec3(slope, tilt, roll) + spark * 0.15;
}
`;

const FOIL_FRAGMENT_BODY = `
if (foilStrength > 0.001) {
  vec3 V = normalize(-vViewPosition);
  vec3 N = normalize(vNormal);
  vec2 cardUv = (vFoilUv - 0.5) * vec2(foilAspect, 1.0);
  vec3 shard = foilShard(cardUv * 26.0);
  vec3 foilN = normalize(N + (vFoilX * shard.x + vFoilY * shard.y) * 0.28);
  vec3 R = reflect(-V, foilN);
  vec3 localR = vec3(dot(R, vFoilX), dot(R, vFoilY), dot(R, N));
  float roll = shard.z + cardUv.x * 2.0;
  vec2 rotated = vec2(
    localR.x * cos(roll) - localR.y * sin(roll),
    localR.x * sin(roll) + localR.y * cos(roll)
  );
  vec3 rainbow = vec3(0.0);
  float facing = clamp(dot(N, V), 0.0, 1.0);
  float glint = pow(max(0.0, dot(R, foilKey)), 22.0) * 1.8 +
                pow(max(0.0, dot(R, foilFill)), 12.0) * 0.8 +
                pow(max(0.0, dot(R, foilTop)), 16.0) * 1.2;
  rainbow += foilGrating(rotated.x, 2.4) * glint;
  rainbow += foilGrating(rotated.y, 1.6) * (glint * 0.7 + 0.3);
  rainbow += foilSpectrum(fract(cardUv.y * 1.5 + cardUv.x * 0.5 + dot(R, foilTop) * 0.4)) * 0.35;
  vec3 luster = vec3(0.92, 0.95, 1.0) * pow(1.0 - abs(dot(N, V)), 3.0) * 0.5;
  totalDiffuse += (rainbow * 1.35 + luster) * (foilStrength * facing);
}
`;

const toCss = (color, alpha = 1) => `rgba(${Math.round(color[0] * 255)}, ${Math.round(color[1] * 255)}, ${Math.round(color[2] * 255)}, ${alpha})`;
const luminance = color => color[0] * 0.299 + color[1] * 0.587 + color[2] * 0.114;
const parseColor = (value, fallback = [1, 1, 1]) => {
  if (Array.isArray(value) && value.length >= 3) return value.slice(0, 3);
  if (typeof value === 'string') {
    const hex = value.trim().replace(/^#/, '');
    if (hex.length === 6) {
      return [
        parseInt(hex.slice(0, 2), 16) / 255,
        parseInt(hex.slice(2, 4), 16) / 255,
        parseInt(hex.slice(4, 6), 16) / 255
      ];
    }
  }
  return fallback;
};

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
    curveSegments: 24
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

const buildClampGeometry = width => {
  const shape = new THREE.Shape();
  const w = width * 1.16;
  traceRoundedRect(shape, -w / 2 + 0.014, -CLAMP_BODY / 2 + 0.014, w - 0.028, CLAMP_BODY - 0.028, 0.024);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.02,
    bevelEnabled: true,
    bevelThickness: 0.014,
    bevelSize: 0.014,
    bevelSegments: 6,
    curveSegments: 10
  });
  geometry.translate(0, 0, -0.01);
  return geometry;
};

const buildBandGeometry = count => {
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

const buildEnvironment = renderer => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0.035, 0.035, 0.04);
  const geometry = new THREE.PlaneGeometry(1, 1);
  const materials = [];
  const panel = (intensity, position, scale, rotation = 0) => {
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(intensity, intensity, intensity),
      side: THREE.DoubleSide
    });
    materials.push(material);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.scale.set(scale[0], scale[1], 1);
    mesh.lookAt(0, 0, 0);
    mesh.rotateZ(rotation);
    scene.add(mesh);
  };
  panel(2.6, [0, 4.5, 8], [9, 4]);
  panel(6, [-5.5, 0.5, 7], [0.9, 14]);
  panel(4, [5, -0.5, 8], [0.6, 14]);
  panel(3.5, [0, -1, 9], [24, 0.35], Math.PI / 3);
  panel(2.5, [1, 2.5, 9], [24, 0.2], Math.PI / 3);
  panel(1.4, [0, 6, -6], [12, 4]);
  panel(0.5, [0, -7, 1], [16, 6]);

  const target = new THREE.WebGLRenderTarget(256, 128, {
    type: THREE.HalfFloatType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter
  });
  const camera = new THREE.CubeCamera(0.1, 50, target);
  camera.update(renderer, scene);
  materials.forEach(m => m.dispose());
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
      data[i] = ((diagonal1 * 0.3 + 0.5) * 255) | 0;
      data[i + 1] = ((diagonal2 * 0.3 + 0.5) * 255) | 0;
      data[i + 2] = 230;
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

const buildGrainTexture = () => {
  const size = 128;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (Math.random() * 2 - 1) * 0.08;
      const ny = (Math.random() * 2 - 1) * 0.08;
      const length = Math.hypot(nx, ny, 1);
      const i = (y * size + x) * 4;
      data[i] = ((nx / length) * 0.5 + 0.5) * 255;
      data[i + 1] = ((ny / length) * 0.5 + 0.5) * 255;
      data[i + 2] = ((1 / length) * 0.5 + 0.5) * 255;
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

const drawFitted = (ctx, image, width, height, fit) => {
  const scale = (fit === 'contain' ? Math.min : Math.max)(width / image.width, height / image.height);
  const w = image.width * scale;
  const h = image.height * scale;
  ctx.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
};

const paintFace = (canvas, image, color, fit) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.fillStyle = toCss(color);
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (image) drawFitted(ctx, image, canvas.width, canvas.height, fit);
};

const paintStrap = (canvas, image, color) => {
  const across = 192;
  const along = image ? Math.max(64, Math.round((image.width / image.height) * across)) : across * 2;
  canvas.width = across;
  canvas.height = along;
  const ctx = canvas.getContext('2d');
  if (!ctx) return along / across;
  ctx.fillStyle = toCss(color);
  ctx.fillRect(0, 0, across, along);
  if (image) {
    ctx.save();
    ctx.translate(across, 0);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(image, 0, 0, along, across);
    ctx.restore();
    return along / across;
  }
  const ink = luminance(color) > 0.5 ? [0, 0, 0] : [1, 1, 1];
  ctx.fillStyle = toCss(ink, 0.05);
  for (let y = 0; y < along; y += 4) ctx.fillRect(0, y, across, 1);
  ctx.fillStyle = toCss(ink, 0.2);
  for (let y = 0; y < along; y += 14) {
    ctx.fillRect(across * 0.075, y, 2, 8);
    ctx.fillRect(across * 0.925 - 2, y, 2, 8);
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
    impulses: new Float32Array(JOINTS),
    anchor: new THREE.Vector3(),
    body: {
      position: new THREE.Vector3(),
      previous: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      angular: new THREE.Vector3(),
      quaternion: new THREE.Quaternion(),
      previousQuaternion: new THREE.Quaternion(),
      hang: new THREE.Vector3()
    },
    grab: null,
    rest: 0,
    twist: 0,
    spin: 0,
    calm: 0
  };
};

const getLayout = (orientation, cornerRadius) => {
  const [width, height] = CARD_SIZES[orientation] || CARD_SIZES.portrait;
  const radius = Math.min(cornerRadius, width / 2 - 0.05, height / 2 - 0.05);
  const ringY = height / 2 - 0.14;
  const hangY = ringY + RING_RADIUS + RING_TUBE;
  return { width, height, radius, ringY, hangY };
};

const placeHanging = (sim, layout, swing) => {
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
  if (swing) {
    sim.body.velocity.x = (Math.random() - 0.5) * 4;
    sim.body.angular.z = (Math.random() - 0.5) * 3;
  }
};

const stepSimulation = (sim, dt, physics, scratch) => {
  const h = Math.min(dt, 0.02);
  const { body, nodes, previous, velocities, grab } = sim;
  const steps = Math.ceil(h / MAX_STEP);
  const stepDt = h / steps;
  const gravity = physics.gravity * -9.8;
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

    // Damping
    body.velocity.multiplyScalar(0.985);
    body.angular.multiplyScalar(0.975);
  }

  if (grab) grab.from.copy(grab.target);
};

// ==========================================
// CREATE DYNAMIC STEVE MARVIN HIGH-RES CARD
// ==========================================
const createSteveFrontCanvas = () => {
  const cvs = document.createElement('canvas');
  cvs.width = FACE_WIDTH;
  cvs.height = 1440;
  const ctx = cvs.getContext('2d');

  const render = () => {
    ctx.clearRect(0, 0, FACE_WIDTH, 1440);

    // Dark obsidian gradient
    const bgGrad = ctx.createLinearGradient(0, 0, FACE_WIDTH, 1440);
    bgGrad.addColorStop(0, '#070a14');
    bgGrad.addColorStop(0.35, '#170c26');
    bgGrad.addColorStop(0.7, '#0e081c');
    bgGrad.addColorStop(1, '#05070e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, FACE_WIDTH, 1440);

    // Tech grid watermark
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.lineWidth = 1.5;
    for (let x = 40; x < FACE_WIDTH; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 40);
      ctx.lineTo(x, 1400);
      ctx.stroke();
    }
    for (let y = 40; y < 1440; y += 48) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(FACE_WIDTH - 40, y);
      ctx.stroke();
    }

    // Holographic iridescent foil vertical stripe
    const holoGrad = ctx.createLinearGradient(36, 0, 78, 1440);
    holoGrad.addColorStop(0, 'rgba(244, 63, 94, 0.8)');
    holoGrad.addColorStop(0.25, 'rgba(192, 132, 252, 0.8)');
    holoGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.8)');
    holoGrad.addColorStop(0.75, 'rgba(52, 211, 153, 0.8)');
    holoGrad.addColorStop(1, 'rgba(251, 191, 36, 0.8)');
    ctx.fillStyle = holoGrad;
    ctx.fillRect(36, 36, 34, 1368);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 1440; i += 26) {
      ctx.beginPath();
      ctx.moveTo(36, i);
      ctx.lineTo(70, i + 34);
      ctx.stroke();
    }

    // Outer Rose Perimeter Border with rounded corners
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 10;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(24, 24, FACE_WIDTH - 48, 1392, 36);
      ctx.stroke();
    } else {
      ctx.strokeRect(24, 24, FACE_WIDTH - 48, 1392);
    }

    // Top VIP Header Pill
    ctx.fillStyle = 'rgba(244, 63, 94, 0.22)';
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(110, 68, 804, 72, 36);
    else ctx.rect(110, 68, 804, 72);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fda4af';
    ctx.font = 'bold 28px "Space Grotesk", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('★ OFFICIAL VIP PASS | BRAND ACTIVATION ★', 512, 114);

    // Portrait Photo
    const photoY = 405;
    const photoRadius = 175;

    // Glowing halo
    const glowGrad = ctx.createRadialGradient(512, photoY, photoRadius * 0.8, 512, photoY, photoRadius * 1.35);
    glowGrad.addColorStop(0, 'rgba(244, 63, 94, 0.6)');
    glowGrad.addColorStop(1, 'rgba(244, 63, 94, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(512, photoY, photoRadius * 1.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(512, photoY, photoRadius, 0, Math.PI * 2);
    ctx.fill();

    if (photoImg.complete && photoImg.naturalWidth) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(512, photoY, photoRadius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(photoImg, 512 - photoRadius, photoY - photoRadius, photoRadius * 2, photoRadius * 2);
      ctx.restore();
    }

    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(512, photoY, photoRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(512, photoY, photoRadius + 10, 0, Math.PI * 2);
    ctx.stroke();

    // Full Name
    ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 68px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('STEVE MARVIN', 512, 680);
    ctx.shadowBlur = 0;

    // Title
    ctx.fillStyle = '#fb7185';
    ctx.font = 'bold 36px "Space Grotesk", sans-serif';
    ctx.fillText('SUPERVISOR BRAND ACTIVATION', 512, 735);

    // GOC Portfolio Card Pill
    ctx.fillStyle = 'rgba(255, 255, 255, 0.09)';
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(100, 785, 824, 74, 20);
    else ctx.rect(100, 785, 824, 74);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 29px sans-serif';
    ctx.fillText('GOC (Purbasari • Amara • Onyx • CleanFace)', 512, 832);

    // Ex Kanzler
    ctx.fillStyle = 'rgba(14, 165, 233, 0.14)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(150, 880, 724, 62, 31);
    else ctx.rect(150, 880, 724, 62);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#93c5fd';
    ctx.font = 'bold 25px "Space Grotesk", monospace';
    ctx.fillText('Ex KANZLER (Cimory Group)', 512, 920);

    // Focus Area
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 23px monospace';
    ctx.fillText('EVENT MANAGEMENT • BRAND EXPERIENTIAL', 512, 990);

    // Scannable Barcode
    const barStartX = 140;
    const barY = 1050;
    const barHeight = 120;
    const barCount = 44;
    const barSpacing = (FACE_WIDTH - barStartX * 2) / barCount;

    for (let i = 0; i < barCount; i++) {
      const isThick = (i * 7) % 3 === 0;
      ctx.fillStyle = i % 5 === 0 ? '#f43f5e' : '#ffffff';
      ctx.fillRect(
        barStartX + i * barSpacing,
        barY,
        isThick ? barSpacing * 0.72 : barSpacing * 0.38,
        barHeight
      );
    }

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 26px monospace';
    ctx.fillText('PASS ID: SM-GOC-2026-VIP', 512, 1220);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '19px monospace';
    ctx.fillText('SECURITY LEVEL: MAXIMUM ALL-ACCESS', 512, 1260);
  };

  const photoImg = new Image();
  photoImg.crossOrigin = 'anonymous';
  photoImg.onload = () => render();
  photoImg.onerror = () => {
    if (photoImg.src.indexOf('steve_hd.png') !== -1) {
      photoImg.src = '/assets/steve.png';
    }
  };
  photoImg.src = '/assets/steve_hd.png';

  render();
  return cvs;
};

const createSteveBackCanvas = () => {
  const cvs = document.createElement('canvas');
  cvs.width = FACE_WIDTH;
  cvs.height = 1440;
  const ctx = cvs.getContext('2d');

  const bgGrad = ctx.createLinearGradient(0, 0, FACE_WIDTH, 1440);
  bgGrad.addColorStop(0, '#090d18');
  bgGrad.addColorStop(0.4, '#1b0e26');
  bgGrad.addColorStop(1, '#05070e');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, FACE_WIDTH, 1440);

  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 10;
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(24, 24, FACE_WIDTH - 48, 1392, 36);
    ctx.stroke();
  } else {
    ctx.strokeRect(24, 24, FACE_WIDTH - 48, 1392);
  }

  // Header
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 50px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('STEVE MARVIN', 512, 105);

  ctx.fillStyle = '#fb7185';
  ctx.font = 'bold 28px "Space Grotesk", sans-serif';
  ctx.fillText('SUPERVISOR BRAND ACTIVATION', 512, 155);

  // Badge
  ctx.fillStyle = 'rgba(244, 63, 94, 0.18)';
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.55)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(140, 190, 744, 56, 28);
  else ctx.rect(140, 190, 744, 56);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#fda4af';
  ctx.font = 'bold 23px monospace';
  ctx.fillText('CORE COMPETENCIES & TRACK RECORD', 512, 226);

  // Skills
  const skills = [
    '✦ Stage Production & Event Planning',
    '✦ Multi-Brand Experiential Marketing',
    '✦ Nationwide Roadshow Orchestration',
    '✦ FMCG & Beauty Market Strategy',
    '✦ KOL, Community & Media Outreach',
    '✦ Vendor & Logistics Negotiation',
    '✦ Budget Allocation & ROI Optimization',
  ];

  ctx.textAlign = 'left';
  skills.forEach((skill, idx) => {
    const itemY = 320 + idx * 68;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(80, itemY - 38, 864, 54, 14);
    else ctx.rect(80, itemY - 38, 864, 54);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(skill, 110, itemY);
  });

  // Brands Box
  const boxY = 825;
  ctx.fillStyle = 'rgba(244, 63, 94, 0.14)';
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.45)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(80, boxY, 864, 195, 24);
  else ctx.rect(80, boxY, 864, 195);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#fda4af';
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PORTFOLIO BRANDS', 512, boxY + 48);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText('Purbasari • CleanFace • Amara • Onyx', 512, boxY + 105);

  ctx.fillStyle = '#93c5fd';
  ctx.font = 'bold 26px monospace';
  ctx.fillText('Ex KANZLER (Cimory Group)', 512, boxY + 158);

  // Authenticated QR
  const authY = 1060;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(140, authY, 744, 160, 20);
  else ctx.rect(140, authY, 744, 160);
  ctx.fill();
  ctx.stroke();

  const qrSize = 105;
  const qrX = 180;
  const qrY = authY + 28;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(qrX, qrY, qrSize, qrSize);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(qrX + 6, qrY + 6, qrSize - 12, qrSize - 12);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(qrX + 14, qrY + 14, 24, 24);
  ctx.fillRect(qrX + qrSize - 38, qrY + 14, 24, 24);
  ctx.fillRect(qrX + 14, qrY + qrSize - 38, 24, 24);
  ctx.fillRect(qrX + 46, qrY + 26, 10, 10);
  ctx.fillRect(qrX + 26, qrY + 52, 12, 12);
  ctx.fillRect(qrX + 56, qrY + 56, 18, 18);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#22c55e';
  ctx.font = 'bold 26px monospace';
  ctx.fillText('✔ AUTHENTICATED PASS', 320, authY + 65);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 22px monospace';
  ctx.fillText('GOC BRAND ACTIVATION TEAM', 320, authY + 100);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '19px monospace';
  ctx.fillText('SCAN TO CONNECT & VERIFY', 320, authY + 135);

  return cvs;
};

// Custom Woven Lanyard Strap with Steve Marvin Monogram & Name
const createSteveBandCanvas = () => {
  const cvs = document.createElement('canvas');
  cvs.width = 1024;
  cvs.height = 248;
  const ctx = cvs.getContext('2d');

  // Deep black/charcoal woven base
  ctx.fillStyle = '#0a0d16';
  ctx.fillRect(0, 0, 1024, 248);

  // Micro-weave pattern
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  for (let x = 0; x < 1024; x += 6) {
    for (let y = 0; y < 248; y += 6) {
      if ((x + y) % 12 === 0) {
        ctx.fillRect(x, y, 3, 3);
      }
    }
  }

  // Edge neon stitching
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(0, 14);
  ctx.lineTo(1024, 14);
  ctx.moveTo(0, 234);
  ctx.lineTo(1024, 234);
  ctx.stroke();

  // White inner stitch
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 3;
  ctx.setLineDash([14, 10]);
  ctx.beginPath();
  ctx.moveTo(0, 26);
  ctx.lineTo(1024, 26);
  ctx.moveTo(0, 222);
  ctx.lineTo(1024, 222);
  ctx.stroke();
  ctx.setLineDash([]);

  // Monogram circle with letter 'S'
  const monoX = 140;
  const monoY = 124;
  const monoR = 64;

  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.arc(monoX, monoY, monoR, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(monoX, monoY, monoR - 4, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 66px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('S', monoX, monoY + 2);

  // Steve Marvin & Brand Activation repeated typography
  ctx.textAlign = 'left';
  ctx.font = '900 60px "Space Grotesk", sans-serif';
  ctx.fillText('STEVE MARVIN', 240, monoY);

  ctx.fillStyle = '#fb7185';
  ctx.font = 'bold 36px "Space Grotesk", sans-serif';
  ctx.fillText('★ BRAND ACTIVATION ★ GOC', 700, monoY);

  return cvs;
};

// ==========================================
// EXPORTED LANYARD COMPONENT
// ==========================================
export default function Lanyard({
  frontImage,
  backImage,
  strapImage,
  cardColor = '#080a14',
  orientation = 'portrait',
  finish = 'glossy',
  cornerRadius = 0.25,
  size = 0.62,
  anchor = 'center',
  strapLength = 0.58,
  strapColor = '#111827',
  strapWidth = 0.65,
  metal = 'silver',
  gravity = 1,
  damping = 0.5,
  elasticity = 0.5,
  breeze = 0.5,
  interactive = true,
  playBeep,
  className = '',
  style,
}) {
  const containerRef = useRef(null);
  const settingsRef = useRef(null);
  const applyRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Generate dynamic canvases for Steve Marvin if custom images not provided
  const steveFrontCanvasRef = useRef(null);
  const steveBackCanvasRef = useRef(null);
  const steveBandCanvasRef = useRef(null);

  if (!steveFrontCanvasRef.current && typeof window !== 'undefined') {
    steveFrontCanvasRef.current = createSteveFrontCanvas();
    steveBackCanvasRef.current = createSteveBackCanvas();
    steveBandCanvasRef.current = createSteveBandCanvas();
  }

  const effectiveFrontImage = frontImage || steveFrontCanvasRef.current;
  const effectiveBackImage = backImage || steveBackCanvasRef.current;
  const effectiveStrapImage = strapImage || steveBandCanvasRef.current;

  settingsRef.current = {
    frontImage: effectiveFrontImage,
    backImage: effectiveBackImage,
    strapImage: effectiveStrapImage,
    cardColor,
    orientation,
    finish,
    cornerRadius,
    size,
    anchor,
    strapLength,
    strapColor,
    strapWidth,
    metal,
    gravity,
    damping,
    elasticity,
    breeze,
    interactive,
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
    renderer.toneMappingExposure = 1;
    const canvas = renderer.domElement;
    canvas.className = 'block w-full h-full cursor-grab active:cursor-grabbing';
    canvas.setAttribute('aria-hidden', 'true');
    container.appendChild(canvas);

    const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const scene = new THREE.Scene();
    const environment = buildEnvironment(renderer);
    scene.environment = environment.texture;
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 200);
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(-2.5, 4, 6);
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(3, -1, 4);
    scene.add(keyLight, fillLight);

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
    const grain = buildGrainTexture();
    const weave = buildWeaveTexture();
    const foilUniforms = {
      foilStrength: { value: 0 },
      foilAspect: { value: 1.4 },
      foilKey: { value: new THREE.Vector3() },
      foilFill: { value: new THREE.Vector3() },
      foilTop: { value: new THREE.Vector3() }
    };
    const injectFoil = shader => {
      Object.assign(shader.uniforms, foilUniforms);
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\n${FOIL_VERTEX_HEAD}`)
        .replace('#include <project_vertex>', `#include <project_vertex>\n${FOIL_VERTEX_BODY}`);
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>\n${FOIL_FRAGMENT_HEAD}`)
        .replace('#include <opaque_fragment>', `${FOIL_FRAGMENT_BODY}\n#include <opaque_fragment>`);
    };

    const frontMaterial = new THREE.MeshPhysicalMaterial({
      map: frontTexture,
      normalMap: grain,
      normalScale: new THREE.Vector2(0.06, 0.06)
    });
    const backMaterial = new THREE.MeshPhysicalMaterial({
      map: backTexture,
      normalMap: grain,
      normalScale: new THREE.Vector2(0.06, 0.06)
    });
    frontMaterial.onBeforeCompile = injectFoil;
    backMaterial.onBeforeCompile = injectFoil;
    const edgeMaterial = new THREE.MeshPhysicalMaterial();
    const metalMaterial = new THREE.MeshStandardMaterial({ metalness: 1 });
    const bandMaterial = new THREE.MeshPhysicalMaterial({
      map: strapTexture,
      normalMap: weave,
      normalScale: new THREE.Vector2(0.7, 0.7),
      roughness: 0.68,
      sheen: 1,
      sheenRoughness: 0.42,
      sheenColor: new THREE.Color(0.32, 0.32, 0.34),
      side: THREE.DoubleSide
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
    let strapScale = STRAP_WIDTH;
    let tileRatio = 2;
    let placed = false;
    let lastTime = performance.now();
    let imageToken = 0;
    let alive = true;
    let visible = true;
    let raf = null;

    const paintFaces = () => {
      const s = settingsRef.current;
      const color = parseColor(s.cardColor, [1, 1, 1]);
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
      paintFace(frontCanvas, images.front, color, 'cover');
      paintFace(backCanvas, images.back || images.front, color, 'cover');
      frontTexture.needsUpdate = true;
      backTexture.needsUpdate = true;
      start();
    };

    const repaintStrap = () => {
      const s = settingsRef.current;
      tileRatio = paintStrap(strapCanvas, images.strap, parseColor(s.strapColor, [0.07, 0.07, 0.07]));
      weave.repeat.set(2, 2 * tileRatio);
      strapTexture.dispose();
      strapTexture.needsUpdate = true;
      start();
    };

    const frameView = () => {
      const s = settingsRef.current;
      const aspect = view.width / view.height;
      let viewHeight = layout.height / clamp(s.size, 0.15, 0.9);
      const minimumWidth = layout.width / 0.72;
      if (viewHeight * aspect < minimumWidth) viewHeight = minimumWidth / aspect;
      const viewWidth = viewHeight * aspect;
      camera.aspect = aspect;
      camera.position.set(0, 0, viewHeight / 2 / Math.tan((FOV * Math.PI) / 360));
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();

      foilUniforms.foilKey.value.set(-2.5, 4, 6).normalize().transformDirection(camera.matrixWorldInverse);
      foilUniforms.foilFill.value.set(3, -1, 4).normalize().transformDirection(camera.matrixWorldInverse);
      foilUniforms.foilTop.value.set(0.5, 4.5, 8).normalize().transformDirection(camera.matrixWorldInverse);

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
      const layoutKey = `${s.orientation}|${s.cornerRadius}`;
      if (layoutKey !== applied.layoutKey) {
        layout = getLayout(s.orientation, s.cornerRadius);
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
          placeHanging(sim, layout, false);
          placed = true;
        } else if (layoutKey !== applied.layoutKey) {
          placeHanging(sim, layout, false);
        }
      }

      const imageKey = `${s.frontImage}|${s.backImage}|${s.strapImage}`;
      if (imageKey !== applied.imageKey) {
        const token = ++imageToken;
        const load = src => {
          if (!src) return Promise.resolve(null);
          if (typeof src !== 'string') return Promise.resolve(src);
          let p = imageCache.get(src);
          if (!p) {
            p = new Promise(resolve => {
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

      const finish = FINISHES[s.finish] || FINISHES.glossy;
      const card = parseColor(s.cardColor, [1, 1, 1]);
      [frontMaterial, backMaterial].forEach(material => {
        material.roughness = finish.roughness;
        material.metalness = finish.metalness;
        material.clearcoat = finish.clearcoat;
        material.clearcoatRoughness = finish.clearcoatRoughness;
        material.color.setRGB(card[0], card[1], card[2]);
      });
      foilUniforms.foilStrength.value = finish.foil;
      foilUniforms.foilAspect.value = layout.width / layout.height;

      edgeMaterial.color.setRGB(card[0] * 0.95, card[1] * 0.95, card[2] * 0.95);
      edgeMaterial.roughness = finish.roughness;
      edgeMaterial.metalness = finish.metalness;
      edgeMaterial.clearcoat = finish.clearcoat;
      edgeMaterial.clearcoatRoughness = finish.clearcoatRoughness;

      const isSilver = s.metal === 'silver';
      metalMaterial.color.set(isSilver ? 0xeeeeee : 0xe0a030);
      metalMaterial.roughness = isSilver ? 0.22 : 0.26;
      metalMaterial.metalness = 0.95;

      strapScale = STRAP_WIDTH * clamp(s.strapWidth, 0.4, 2);
      if (strapScale !== applied.strapScale) {
        clampMesh.geometry?.dispose();
        clampMesh.geometry = buildClampGeometry(strapScale);
      }

      applied = { layoutKey, framingKey, imageKey, strapScale };
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
      const repeats = restLength / (strapScale * tileRatio);
      const width = strapScale / Math.pow(Math.max(1, length / Math.max(restLength, 0.001)), 0.35);

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
      q: new THREE.Quaternion()
    };

    const physicsParams = {
      gravity: 1,
      damping: 0.5,
      elasticity: 0.5,
      breeze: 0.5
    };

    const tick = now => {
      if (!alive) return;
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      physicsParams.gravity = settingsRef.current.gravity;
      physicsParams.damping = settingsRef.current.damping;
      physicsParams.elasticity = settingsRef.current.elasticity;

      stepSimulation(sim, dt, physicsParams, scratch);
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

    // --- Pointer & Drag Interaction ---
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hovering = false;
    let press = null;

    const toPointer = event => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
    };

    const pickCard = () => {
      const hits = raycaster.intersectObjects([bodyMesh, frontMesh, backMesh], false);
      return hits.length ? hits[0] : null;
    };

    const flip = point => {
      const local = cardGroup.worldToLocal(point.clone());
      const sign = local.x > 0 ? 1 : -1;
      const torque = new THREE.Vector3(0, sign * FLIP_SPIN, 0).applyQuaternion(sim.body.quaternion);
      sim.body.angular.add(torque);
      playBeep?.(850);
      start();
    };

    const onPointerDown = event => {
      if (!settingsRef.current.interactive) return;
      toPointer(event);
      const hit = pickCard();
      if (!hit) return;
      const point = hit.point.clone();
      sim.grab = {
        point,
        target: point.clone(),
        from: point.clone(),
        reach: raycaster.ray.origin.distanceTo(point)
      };
      press = { x: event.clientX, y: event.clientY, time: performance.now(), point: hit.point.clone() };
      canvas.setPointerCapture?.(event.pointerId);
      setIsDragging(true);
      event.preventDefault();
      start();
    };

    const onPointerMove = event => {
      if (!settingsRef.current.interactive) return;
      toPointer(event);
      if (sim.grab) {
        if (press && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 6) press = null;
        raycaster.ray.at(sim.grab.reach, sim.grab.target);
        start();
        return;
      }
      if (event.pointerType === 'touch') return;
      hovering = !!pickCard();
    };

    const onPointerUp = event => {
      if (!sim.grab) return;
      sim.grab = null;
      setIsDragging(false);
      if (press && event.type === 'pointerup' && performance.now() - press.time < 450) flip(press.point);
      press = null;
      canvas.releasePointerCapture?.(event.pointerId);
      start();
    };

    const onTouchStart = event => {
      if (!settingsRef.current.interactive || event.touches.length !== 1) return;
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

    // Re-render when web fonts load
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        steveFrontCanvasRef.current = createSteveFrontCanvas();
        steveBackCanvasRef.current = createSteveBackCanvas();
        steveBandCanvasRef.current = createSteveBandCanvas();
        apply();
      });
    }

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
      [bodyMesh, frontMesh, backMesh, ring, clampMesh, eyelet, band].forEach(mesh => mesh.geometry?.dispose());
      [frontMaterial, backMaterial, edgeMaterial, metalMaterial, bandMaterial].forEach(material => material.dispose());
      [frontTexture, backTexture, strapTexture, grain, weave].forEach(texture => texture.dispose());
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
