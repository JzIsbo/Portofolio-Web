import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

/**
 * Ultra-Realistic 3D Lanyard & VIP ID Card Component (alfari.my.id Style)
 *
 * Features:
 * - Perfectly proportioned compact 3D VIP ID Card (no barcode, maximum text legibility)
 * - True 3D ID badge casing with beveled bumper, realistic punch slot, and physical depth
 * - Physically unified assembly: Chrome split keyring passes directly through slot hole,
 *   connecting to metallic crimp clamp, seamlessly gripping the matte black fabric lanyard strap
 * - Lanyard enters from above the viewport, hanging down naturally with realistic physics
 * - Smooth Catmull-Rom Verlet physics with progressive elastic resistance ("lebih melawan")
 *   and satisfying spring recoil
 * - Instant, responsive tap/click to smoothly flip 180° between Front and Back (with non-inverted text)
 * - Studio softbox lighting rig (zero colored laser hotspots or glare)
 * - Full HiDPI ResizeObserver support for razor-sharp rendering on all screens
 */

const CARD_SIZES = {
  portrait: [1.02, 1.53],
};
const THICKNESS = 0.016;
const BEVEL = 0.005;
const JOINTS = 8;
const SAMPLES = 64;
const STRAP_WIDTH = 0.20;
const RING_RADIUS = 0.065;
const RING_TUBE = 0.009;
const EYELET_RADIUS = 0.026;
const CLAMP_BODY = 0.095;

const BAND_COLUMNS = [0, 0.08, 0.92, 1];
const BAND_BEND = [-0.95, -0.28, 0.28, 0.95];

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

  // Physical punch slot at top center with rounded ends
  const slot = { width: 0.25, height: 0.055, y: height / 2 - 0.085 };
  const hole = new THREE.Path();
  traceRoundedRect(hole, -slot.width / 2, slot.y - slot.height / 2, slot.width, slot.height, slot.height / 2);
  outline.holes.push(hole);

  // Extruded card edge holder body
  const body = new THREE.ExtrudeGeometry(outline, {
    depth: THICKNESS,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelSegments: 6,
    curveSegments: 32,
  });
  body.translate(0, 0, -THICKNESS / 2);

  // Front face (standard UV mapping)
  const frontFace = new THREE.ShapeGeometry(outline, 32);
  const posFront = frontFace.getAttribute('position');
  const uvFront = frontFace.getAttribute('uv');
  for (let i = 0; i < posFront.count; i++) {
    uvFront.setXY(i, (posFront.getX(i) + width / 2) / width, (posFront.getY(i) + height / 2) / height);
  }
  uvFront.needsUpdate = true;

  // Back face: standard UV mapping so when cardGroup rotates 180° around Y, text reads normally left-to-right!
  const backFace = new THREE.ShapeGeometry(outline, 32);
  const posBack = backFace.getAttribute('position');
  const uvBack = backFace.getAttribute('uv');
  for (let i = 0; i < posBack.count; i++) {
    uvBack.setXY(i, (posBack.getX(i) + width / 2) / width, (posBack.getY(i) + height / 2) / height);
  }
  uvBack.needsUpdate = true;

  return { body, frontFace, backFace, slotY: slot.y };
};

const buildClampGeometry = (width) => {
  const shape = new THREE.Shape();
  const w = width * 1.1;
  traceRoundedRect(shape, -w / 2, -CLAMP_BODY / 2, w, CLAMP_BODY, 0.022);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.024,
    bevelEnabled: true,
    bevelThickness: 0.010,
    bevelSize: 0.010,
    bevelSegments: 5,
    curveSegments: 16,
  });
  geometry.translate(0, 0, -0.012);
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

export default function Lanyard({
  frontImage = '/assets/frontCard.png?v=20261029_v10',
  backImage = '/assets/backCard.png?v=20261029_v10',
  strapImage = '/assets/band.png?v=20261029_v10',
  playBeep,
  className = '',
  style,
}) {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const triggerFlipRef = useRef(null);

  // Stable audio ref to prevent 3D WebGL flickering on mute/unmute
  const playBeepRef = useRef(playBeep);
  useEffect(() => {
    playBeepRef.current = playBeep;
  }, [playBeep]);

  const handleBadgeClick = useCallback(() => {
    triggerFlipRef.current?.();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 360;
    let height = container.clientHeight || 540;
    const isMobile = (window.innerWidth || width) < 640;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2.5);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const canvas = renderer.domElement;
    canvas.className = 'block w-full h-full cursor-grab active:cursor-grabbing select-none touch-none';
    canvas.style.touchAction = 'none';
    canvas.setAttribute('aria-hidden', 'true');
    container.appendChild(canvas);

    const anisotropy = Math.min(16, renderer.capabilities.getMaxAnisotropy());
    const scene = new THREE.Scene();

    // Perspective Camera: Framed so the card is compact, sharp, and perfectly proportioned
    const camera = new THREE.PerspectiveCamera(28, width / height, 0.1, 100);
    camera.position.set(0, 0.04, isMobile ? 4.9 : 5.2);

    // Balanced Studio Softbox Lighting Rig (Ultra-even illumination, zero glare hotspots)
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(1.5, 3.5, 4.5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 1.4);
    fillLight.position.set(-2.5, -0.5, 3.5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.0);
    rimLight.position.set(0, 4.0, 1.5);
    scene.add(rimLight);

    // Card dimensions & geometries
    const [cardW, cardH] = CARD_SIZES.portrait;
    const cardGeom = buildCardGeometry(cardW, cardH, 0.20);

    // Direct TextureLoader with maximum anisotropy & mipmaps for pin-sharp text
    const textureLoader = new THREE.TextureLoader();

    const loadTex = (url) => {
      const tex = textureLoader.load(url);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = anisotropy;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      return tex;
    };

    const frontTexture = loadTex(frontImage);
    const backTexture = loadTex(backImage);
    const strapTexture = loadTex(strapImage);
    strapTexture.wrapS = THREE.ClampToEdgeWrapping;
    strapTexture.wrapT = THREE.ClampToEdgeWrapping;

    // Materials: Matte-satin card finish for crisp, legible text without specular glare
    const frontMaterial = new THREE.MeshStandardMaterial({
      map: frontTexture,
      roughness: 0.45,
      metalness: 0.0,
    });
    const backMaterial = new THREE.MeshStandardMaterial({
      map: backTexture,
      roughness: 0.45,
      metalness: 0.0,
    });
    // Dark obsidian / graphite polycarbonate protective bumper
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: 0x141722,
      roughness: 0.35,
      metalness: 0.2,
    });
    // Shiny chrome metal for split ring and crimp clamp
    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.15,
      metalness: 0.96,
    });
    // Matte black fabric lanyard ribbon
    const bandMaterial = new THREE.MeshStandardMaterial({
      map: strapTexture,
      roughness: 0.55,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });

    // Assembling 3D ID Card Group
    const cardGroup = new THREE.Group();
    const bodyMesh = new THREE.Mesh(cardGeom.body, edgeMaterial);
    const frontMesh = new THREE.Mesh(cardGeom.frontFace, frontMaterial);
    const backMesh = new THREE.Mesh(cardGeom.backFace, backMaterial);

    // Split Keyring: passes right through the top punch slot hole!
    const ring = new THREE.Mesh(new THREE.TorusGeometry(RING_RADIUS, RING_TUBE, 16, 64), metalMaterial);

    // Invisible Hit Box for frictionless drag and tap detection
    const hitBox = new THREE.Mesh(
      new THREE.BoxGeometry(cardW * 1.3, cardH * 1.25, 0.4),
      new THREE.MeshBasicMaterial({ visible: false })
    );

    frontMesh.position.z = THICKNESS / 2 + BEVEL + 0.0006;
    backMesh.rotation.y = Math.PI;
    backMesh.position.z = -(THICKNESS / 2 + BEVEL + 0.0006);

    // Position split ring centered in the card's punched slot
    const slotY = cardGeom.slotY;
    ring.position.set(0, slotY + 0.045, 0);
    ring.rotation.y = Math.PI / 2 - 0.25;

    cardGroup.add(bodyMesh, frontMesh, backMesh, ring, hitBox);
    scene.add(cardGroup);

    // Metal Crimp Clamp: holds the strap and hooks into the top of the split ring
    const clampGroup = new THREE.Group();
    const clampMesh = new THREE.Mesh(buildClampGeometry(STRAP_WIDTH), metalMaterial);
    clampMesh.position.y = EYELET_RADIUS + CLAMP_BODY / 2 - 0.004;

    const clampEyelet = new THREE.Mesh(new THREE.TorusGeometry(EYELET_RADIUS, 0.010, 14, 40), metalMaterial);
    clampEyelet.position.y = EYELET_RADIUS;

    clampGroup.add(clampMesh, clampEyelet);
    scene.add(clampGroup);

    // Band Ribbon Mesh
    const bandGeometry = buildBandGeometry(SAMPLES);
    const band = new THREE.Mesh(bandGeometry, bandMaterial);
    band.frustumCulled = false;
    scene.add(band);

    // Physics Simulation State
    // Anchor reaches all the way to the top of the screen (strictly vertical, alfari.my.id style)
    const anchor = new THREE.Vector3(0, 3.5, 0);
    const restY = -0.05;
    const restPos = new THREE.Vector3(0, restY, 0);
    const cardPos = new THREE.Vector3(0, restY, 0);
    const cardVel = new THREE.Vector3(0, 0, 0);
    const cardQuat = new THREE.Quaternion();
    let currentFlipAngle = 0;
    let targetFlipAngle = 0;

    // Flip function callable from pointer tap and UI button
    const flipCard = () => {
      targetFlipAngle += Math.PI;
      playBeepRef.current?.(850);
      setIsFlipped((prev) => !prev);
    };
    triggerFlipRef.current = flipCard;

    // Clamp & Strap Attachment Offsets (relative to card center)
    const clampOffset = new THREE.Vector3(0, slotY + 0.045 + RING_RADIUS + EYELET_RADIUS * 0.7, 0);
    const strapAttachOffset = new THREE.Vector3(0, slotY + 0.045 + RING_RADIUS + EYELET_RADIUS + CLAMP_BODY * 0.8, 0);

    // Verlet rope nodes along strap
    const nodes = Array.from({ length: JOINTS + 1 }, () => new THREE.Vector3());
    const prevNodes = Array.from({ length: JOINTS + 1 }, () => new THREE.Vector3());

    // Initialize nodes straight down from anchor to attachment point
    const initialAttach = strapAttachOffset.clone().add(cardPos);
    for (let i = 0; i <= JOINTS; i++) {
      const frac = i / JOINTS;
      nodes[i].lerpVectors(anchor, initialAttach, frac);
      prevNodes[i].copy(nodes[i]);
    }

    // Ribbon curve points
    const points = Array.from({ length: SAMPLES }, () => new THREE.Vector3());
    const sides = Array.from({ length: SAMPLES }, () => new THREE.Vector3());
    const bends = BAND_COLUMNS.map((_, i) => [Math.cos(BAND_BEND[i]), Math.sin(BAND_BEND[i])]);
    const controls = [];
    const curve = new THREE.CatmullRomCurve3(controls, false, 'centripetal');

    // Pointer Interaction State
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersection = new THREE.Vector3();
    const dragOffset = new THREE.Vector3();
    let isPointerDown = false;
    let hasDragged = false;
    let pointerStart = { x: 0, y: 0, time: 0 };

    const toPointer = (event) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = event.clientX ?? event.touches?.[0]?.clientX ?? 0;
      const clientY = event.clientY ?? event.touches?.[0]?.clientY ?? 0;
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      return { clientX, clientY };
    };

    const pickCard = () => {
      const hits = raycaster.intersectObjects([hitBox, frontMesh, backMesh, bodyMesh], true);
      return hits.length ? hits[0] : null;
    };

    const onPointerDown = (event) => {
      const { clientX, clientY } = toPointer(event);
      const hit = pickCard();
      if (!hit) return;

      isPointerDown = true;
      hasDragged = false;
      pointerStart = { x: clientX, y: clientY, time: performance.now() };

      dragPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 0, 1), cardPos);
      if (raycaster.ray.intersectPlane(dragPlane, intersection)) {
        dragOffset.copy(cardPos).sub(intersection);
      }

      canvas.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    };

    const onPointerMove = (event) => {
      if (!isPointerDown) return;
      const { clientX, clientY } = toPointer(event);

      const moveDist = Math.hypot(clientX - pointerStart.x, clientY - pointerStart.y);
      if (moveDist > 8) {
        if (!hasDragged) {
          hasDragged = true;
          setIsDragging(true);
        }
      }

      if (hasDragged) {
        if (raycaster.ray.intersectPlane(dragPlane, intersection)) {
          const rawTarget = intersection.clone().add(dragOffset);

          // Progressive high-tension rubber-band elastic resistance (sekenceng alfari.my.id):
          const pull = rawTarget.clone().sub(restPos);
          const pullDist = pull.length();

          // Non-linear spring resistance factor: tightens up strongly like real elastic cord
          const tensionFactor = 1 / (1 + pullDist * 1.6);
          const resistedTarget = restPos.clone().add(pull.multiplyScalar(Math.max(0.24, tensionFactor)));

          // Clamped boundaries
          const minX = isMobile ? -1.4 : -1.8;
          const maxX = isMobile ? 1.4 : 1.8;
          const minY = -1.2;
          const maxY = anchor.y - 0.7;

          resistedTarget.x = THREE.MathUtils.clamp(resistedTarget.x, minX, maxX);
          resistedTarget.y = THREE.MathUtils.clamp(resistedTarget.y, minY, maxY);
          resistedTarget.z = THREE.MathUtils.clamp(resistedTarget.z, -0.4, 0.8);

          cardVel.copy(resistedTarget).sub(cardPos).multiplyScalar(0.72);
          cardPos.copy(resistedTarget);
        }
      }
    };

    const onPointerUp = (event) => {
      if (isPointerDown) {
        const { clientX, clientY } = toPointer(event);
        const dist = Math.hypot(clientX - pointerStart.x, clientY - pointerStart.y);
        const elapsed = performance.now() - pointerStart.time;

        isPointerDown = false;
        setIsDragging(false);

        // Tap / Click detection: if moved less than 32px within 450ms -> smoothly flip card!
        if (!hasDragged || (dist < 32 && elapsed < 450)) {
          flipCard();
        } else {
          // Release drag: elastic snap-back momentum
          cardVel.clampLength(0, 18);
        }

        canvas.releasePointerCapture?.(event.pointerId);
      }
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    // Animation & Physics Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.035);
      const elapsedTime = clock.getElapsedTime();

      // Card Motion Physics with STRONG rubber-band elastic spring resistance and snappy snap-back
      if (!isPointerDown) {
        const springK = 110.0;
        const damping = 0.85;

        // Subtle realistic resting breeze
        const breezeX = Math.sin(elapsedTime * 1.2) * 0.035;
        const breezeZ = Math.cos(elapsedTime * 1.4) * 0.018;

        const forceX = -springK * (cardPos.x - breezeX);
        const forceY = -springK * (cardPos.y - restY) - 9.8 * 0.06;
        const forceZ = -springK * (cardPos.z - breezeZ);

        cardVel.x += forceX * dt;
        cardVel.y += forceY * dt;
        cardVel.z += forceZ * dt;
        cardVel.multiplyScalar(damping);
        cardPos.addScaledVector(cardVel, dt);
      }

      // Smooth, deterministic flip rotation (lands cleanly on front or back)
      currentFlipAngle += (targetFlipAngle - currentFlipAngle) * 0.16;

      // Realistic Card Tilt Physics
      const tiltZ = THREE.MathUtils.clamp(-cardVel.x * 0.22, -0.40, 0.40);
      const tiltX = THREE.MathUtils.clamp(cardVel.y * 0.16 + (cardPos.z > 0 ? 0.04 : -0.04), -0.30, 0.30);

      const euler = new THREE.Euler(tiltX, currentFlipAngle, tiltZ, 'YXZ');
      cardQuat.setFromEuler(euler);

      // Card transforms
      cardGroup.position.copy(cardPos);
      cardGroup.quaternion.copy(cardQuat);

      // Unified Assembly: clamp and strap attachment points calculated directly from card transforms
      const currentClampPos = clampOffset.clone().applyQuaternion(cardQuat).add(cardPos);
      const currentAttachPos = strapAttachOffset.clone().applyQuaternion(cardQuat).add(cardPos);

      clampGroup.position.copy(currentClampPos);
      clampGroup.quaternion.copy(cardQuat);

      // Verlet Rope Physics for the Strap
      nodes[0].copy(anchor);
      nodes[JOINTS].copy(currentAttachPos);

      for (let i = 1; i < JOINTS; i++) {
        const cur = nodes[i];
        const prev = prevNodes[i];
        const vel = cur.clone().sub(prev).multiplyScalar(0.92);
        prev.copy(cur);

        const wind = Math.sin(elapsedTime * 2.2 + i * 0.5) * 0.0016;
        cur.add(vel);
        cur.y += -9.8 * dt * dt * 0.35;
        cur.x += wind;
      }

      // Distance constraints relaxation
      const currentTotalDist = anchor.distanceTo(currentAttachPos);
      const segLen = currentTotalDist / JOINTS;

      // Taut, high-stiffness distance constraints relaxation (sekenceng alfari.my.id)
      for (let pass = 0; pass < 14; pass++) {
        for (let i = 0; i < JOINTS; i++) {
          const p1 = nodes[i];
          const p2 = nodes[i + 1];
          const delta = p2.clone().sub(p1);
          const dist = delta.length();
          if (dist > 1e-5) {
            const error = (dist - segLen) * 0.8;
            delta.normalize().multiplyScalar(error);
            if (i > 0) p1.add(delta);
            if (i + 1 < JOINTS) p2.sub(delta);
          }
        }
      }

      // Build smooth Catmull-Rom spline curve from anchor down to attachment point
      controls.length = 0;
      for (let i = 0; i <= JOINTS; i++) {
        controls.push(nodes[i]);
      }
      curve.updateArcLengths();

      for (let i = 0; i < SAMPLES; i++) {
        curve.getPointAt(i / (SAMPLES - 1), points[i]);
      }

      // Update Ribbon Strap Geometry & UVs
      const posAttr = bandGeometry.getAttribute('position');
      const normAttr = bandGeometry.getAttribute('normal');
      const uvAttr = bandGeometry.getAttribute('uv');
      const columns = BAND_COLUMNS.length;

      const cardFacing = new THREE.Vector3(0, 0, 1).applyQuaternion(cardQuat);
      const camFacing = new THREE.Vector3(0, 0, 1);
      const tangent = new THREE.Vector3();
      const currentNormal = new THREE.Vector3();
      const across = new THREE.Vector3();

      for (let i = 0; i < SAMPLES; i++) {
        tangent.subVectors(points[Math.min(SAMPLES - 1, i + 1)], points[Math.max(0, i - 1)]);
        if (tangent.lengthSq() < 1e-12) tangent.set(0, -1, 0);
        tangent.normalize();

        // Smoothly interpolate strap normal from camera-facing at top to card-facing at bottom
        const t = i / (SAMPLES - 1);
        currentNormal.lerpVectors(camFacing, cardFacing, Math.pow(t, 1.4)).normalize();

        // across points to +X (rightwards) so texture U=0 is on the left and U=1 is on the right (NO mirror reflection!)
        across.crossVectors(currentNormal, tangent);
        if (across.lengthSq() < 1e-8) {
          across.set(1, 0, 0);
        } else {
          across.normalize();
        }

        const p = points[i];
        // V texture coordinate: 1.0 at anchor (top with monogram S), 0.0 at clamp (bottom)
        const v = 1.0 - t;

        for (let c = 0; c < columns; c++) {
          const k = i * columns + c;
          const offset = (BAND_COLUMNS[c] - 0.5) * STRAP_WIDTH;
          const [bendCos, bendSin] = bends[c];

          posAttr.setXYZ(k, p.x + across.x * offset, p.y + across.y * offset, p.z + across.z * offset);
          normAttr.setXYZ(
            k,
            currentNormal.x * bendCos + across.x * bendSin,
            currentNormal.y * bendCos + across.y * bendSin,
            currentNormal.z * bendCos + across.z * bendSin
          );
          uvAttr.setXY(k, BAND_COLUMNS[c], v);
        }
      }

      posAttr.needsUpdate = true;
      normAttr.needsUpdate = true;
      uvAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // ResizeObserver ensures full HiDPI sharpness at whatever exact size the container renders
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          width = w;
          height = h;
          const pr = Math.min(window.devicePixelRatio || 1, 2.5);
          renderer.setPixelRatio(pr);
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.position.z = (window.innerWidth || w) < 640 ? 5.5 : 5.8;
          camera.updateProjectionMatrix();
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);

      [bodyMesh, frontMesh, backMesh, ring, hitBox, clampMesh, clampEyelet, band].forEach((m) => m.geometry?.dispose());
      [frontMaterial, backMaterial, edgeMaterial, metalMaterial, bandMaterial].forEach((m) => m.dispose());
      [frontTexture, backTexture, strapTexture].forEach((t) => t.dispose());
      renderer.dispose();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, [frontImage, backImage, strapImage]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[460px] sm:h-[500px] md:h-[540px] lg:h-[580px] flex items-center justify-center select-none touch-none ${className}`}
      style={style}
    >
      {/* Interactive Helper Hint Badge & Direct Flip Button */}
      <button
        type="button"
        onClick={handleBadgeClick}
        className={`absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3.5 py-1.5 sm:py-2 rounded-full bg-slate-900/95 hover:bg-slate-800 active:scale-95 backdrop-blur-md border border-rose-500/40 hover:border-rose-400 text-[11px] sm:text-xs text-slate-100 shadow-2xl transition-all duration-300 max-w-[94%] truncate z-20 cursor-pointer pointer-events-auto group ${
          isDragging ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
        }`}
        title="Klik untuk membalik ID Card"
      >
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
        <span className="truncate font-semibold group-hover:text-white transition-colors">
          Tarik bebas & Sentuh / Klik untuk Membalik ID Card
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono shrink-0 ml-1 font-bold">
          <svg className="w-3 h-3 transition-transform group-hover:rotate-180 duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {isFlipped ? 'Belakang' : 'Depan'}
        </span>
      </button>

      {/* Active interaction indicator */}
      {isDragging && (
        <div className="absolute top-4 right-4 text-[10px] uppercase font-mono px-3.5 py-1.5 rounded-full bg-rose-500/25 text-rose-200 border border-rose-500/50 backdrop-blur-md pointer-events-none animate-pulse z-20 flex items-center gap-2 shadow-xl shadow-rose-950/50">
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
          <span className="font-bold tracking-wider">Tarik Bebas Aktif</span>
        </div>
      )}
    </div>
  );
}
