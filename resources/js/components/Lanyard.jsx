import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

/**
 * Ultra-Responsive 3D Lanyard & VIP ID Card Component (alfari.my.id Style)
 *
 * Features:
 * - Editorial brutalist vintage cream ID card insert with bold typography
 * - Clean matte black strap with circular monogram (S) and "Steve Marvin" branding
 * - Chrome split-ring clip & crimp clamp passing directly through card slot
 * - Balanced studio-grade softbox lighting (no colored laser hotspots)
 * - Standard UV mapping on both sides: front & back text are 100% clearly readable left-to-right
 * - Realistic rubbery/elastic physics with progressive resistance when dragged ("lebih melawan")
 * - Satisfying spring snap-back recoil when released
 * - Reliable click/tap detection to smoothly flip 180° between Front and Back
 * - Interactive bottom toggle badge that also flips the card on click
 * - Touch-action: none for seamless, fluid dragging on mobile devices without page scroll
 */

const CARD_SIZES = {
  portrait: [1.4, 2.05],
};
const THICKNESS = 0.018;
const BEVEL = 0.007;
const JOINTS = 7;
const SAMPLES = 64;
const STRAP_WIDTH = 0.34;
const RING_RADIUS = 0.085;
const RING_TUBE = 0.0125;
const EYELET_RADIUS = 0.034;
const CLAMP_BODY = 0.14;

const BAND_COLUMNS = [0, 0.07, 0.93, 1];
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
  const slot = { width: 0.34, height: 0.065, y: height / 2 - 0.12 };
  const hole = new THREE.Path();
  traceRoundedRect(hole, -slot.width / 2, slot.y - slot.height / 2, slot.width, slot.height, slot.height / 2);
  outline.holes.push(hole);

  // Extruded card edge holder body
  const body = new THREE.ExtrudeGeometry(outline, {
    depth: THICKNESS,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelSegments: 5,
    curveSegments: 24,
  });
  body.translate(0, 0, -THICKNESS / 2);

  // Front face (standard UV mapping)
  const frontFace = new THREE.ShapeGeometry(outline, 24);
  const posFront = frontFace.getAttribute('position');
  const uvFront = frontFace.getAttribute('uv');
  for (let i = 0; i < posFront.count; i++) {
    uvFront.setXY(i, (posFront.getX(i) + width / 2) / width, (posFront.getY(i) + height / 2) / height);
  }
  uvFront.needsUpdate = true;

  // Back face: standard UV mapping so when cardGroup rotates 180° around Y, text reads normally left-to-right!
  const backFace = new THREE.ShapeGeometry(outline, 24);
  const posBack = backFace.getAttribute('position');
  const uvBack = backFace.getAttribute('uv');
  for (let i = 0; i < posBack.count; i++) {
    uvBack.setXY(i, (posBack.getX(i) + width / 2) / width, (posBack.getY(i) + height / 2) / height);
  }
  uvBack.needsUpdate = true;

  return { body, frontFace, backFace };
};

const buildClampGeometry = (width) => {
  const shape = new THREE.Shape();
  const w = width * 1.15;
  traceRoundedRect(shape, -w / 2 + 0.014, -CLAMP_BODY / 2 + 0.014, w - 0.028, CLAMP_BODY - 0.028, 0.024);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.022,
    bevelEnabled: true,
    bevelThickness: 0.014,
    bevelSize: 0.014,
    bevelSegments: 6,
    curveSegments: 12,
  });
  geometry.translate(0, 0, -0.011);
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
  frontImage = '/assets/frontCard.png?v=20261029_alfari',
  backImage = '/assets/backCard.png?v=20261029_alfari',
  strapImage = '/assets/band.png?v=20261029_alfari',
  playBeep,
  className = '',
  style,
}) {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const triggerFlipRef = useRef(null);

  const handleBadgeClick = useCallback(() => {
    triggerFlipRef.current?.();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 360;
    let height = container.clientHeight || 580;
    const isMobile = (window.innerWidth || width) < 640;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      return;
    }

    // Full HiDPI / Retina pixel ratio
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2.5);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    const canvas = renderer.domElement;
    canvas.className = 'block w-full h-full cursor-grab active:cursor-grabbing select-none touch-none';
    canvas.style.touchAction = 'none';
    canvas.setAttribute('aria-hidden', 'true');
    container.appendChild(canvas);

    const anisotropy = Math.min(16, renderer.capabilities.getMaxAnisotropy());
    const scene = new THREE.Scene();

    // Perspective Camera: framed so card is sleek and elegant (alfari.my.id proportions)
    const camera = new THREE.PerspectiveCamera(28, width / height, 0.1, 100);
    camera.position.set(0, 0.18, isMobile ? 6.0 : 6.4);

    // Balanced Studio Softbox Lighting Rig (no colored laser hotspots)
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    keyLight.position.set(1.5, 4, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 1.8);
    fillLight.position.set(-2.5, -1, 4);
    scene.add(fillLight);

    const topLight = new THREE.DirectionalLight(0xffffff, 1.4);
    topLight.position.set(0, 5, 2);
    scene.add(topLight);

    // Card dimensions & geometries
    const [cardW, cardH] = CARD_SIZES.portrait;
    const ringY = cardH / 2 - 0.12;
    const hangY = ringY + RING_RADIUS + RING_TUBE;

    // Direct TextureLoader for razor-sharp textures
    const textureLoader = new THREE.TextureLoader();

    const loadTex = (url, isRepeat = false) => {
      const tex = textureLoader.load(url);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = anisotropy;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      if (isRepeat) {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
      }
      return tex;
    };

    const frontTexture = loadTex(frontImage);
    const backTexture = loadTex(backImage);
    const strapTexture = loadTex(strapImage, true);

    // Satin-smooth card paper insert finish
    const frontMaterial = new THREE.MeshPhysicalMaterial({
      map: frontTexture,
      color: 0xffffff,
      roughness: 0.22,
      metalness: 0.0,
      clearcoat: 0.35,
      clearcoatRoughness: 0.08,
    });
    const backMaterial = new THREE.MeshPhysicalMaterial({
      map: backTexture,
      color: 0xffffff,
      roughness: 0.22,
      metalness: 0.0,
      clearcoat: 0.35,
      clearcoatRoughness: 0.08,
    });
    const edgeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x18181b,
      roughness: 0.40,
      metalness: 0.1,
    });
    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.14,
      metalness: 0.98,
    });
    // Matte black strap material
    const bandMaterial = new THREE.MeshPhysicalMaterial({
      map: strapTexture,
      color: 0xffffff,
      roughness: 0.45,
      metalness: 0.0,
      clearcoat: 0.12,
      clearcoatRoughness: 0.15,
      side: THREE.DoubleSide,
    });

    // Geometries
    const cardGeom = buildCardGeometry(cardW, cardH, 0.22);
    const cardGroup = new THREE.Group();
    const bodyMesh = new THREE.Mesh(cardGeom.body, edgeMaterial);
    const frontMesh = new THREE.Mesh(cardGeom.frontFace, frontMaterial);
    const backMesh = new THREE.Mesh(cardGeom.backFace, backMaterial);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(RING_RADIUS, RING_TUBE, 18, 72), metalMaterial);

    // Generous Invisible Hit Box so clicks and drags never miss, even when tilted or rotating
    const hitBox = new THREE.Mesh(
      new THREE.BoxGeometry(cardW * 1.35, cardH * 1.35, 0.5),
      new THREE.MeshBasicMaterial({ visible: false })
    );

    frontMesh.position.z = THICKNESS / 2 + BEVEL + 0.0006;
    backMesh.rotation.y = Math.PI;
    backMesh.position.z = -(THICKNESS / 2 + BEVEL + 0.0006);
    ring.position.set(0, ringY, 0);
    ring.rotation.y = Math.PI / 2 - 0.7;

    cardGroup.add(bodyMesh, frontMesh, backMesh, ring, hitBox);
    scene.add(cardGroup);

    // Band Ribbon Mesh
    const bandGeometry = buildBandGeometry(SAMPLES);
    const band = new THREE.Mesh(bandGeometry, bandMaterial);
    band.frustumCulled = false;
    scene.add(band);

    // Metal Clamp & Eyelet
    const clampGroup = new THREE.Group();
    const clampMesh = new THREE.Mesh(buildClampGeometry(STRAP_WIDTH), metalMaterial);
    clampMesh.position.y = EYELET_RADIUS + CLAMP_BODY / 2 - 0.004;
    const eyelet = new THREE.Mesh(new THREE.TorusGeometry(EYELET_RADIUS, 0.010, 16, 44), metalMaterial);
    clampGroup.add(clampMesh, eyelet);
    scene.add(clampGroup);

    // Physics Simulation State
    // Short strap anchor at 1.65 so the lanyard is short, taut, and resists pulling strongly
    const anchor = new THREE.Vector3(0, 1.65, 0);
    const restY = 0.04;
    const restPos = new THREE.Vector3(0, restY, 0);
    const cardPos = new THREE.Vector3(0, restY, 0);
    const cardVel = new THREE.Vector3(0, 0, 0);
    const cardQuat = new THREE.Quaternion();
    let currentFlipAngle = 0;
    let targetFlipAngle = 0;

    // Flip function callable from pointer tap and UI button
    const flipCard = () => {
      targetFlipAngle += Math.PI;
      playBeep?.(850);
      setIsFlipped((prev) => !prev);
    };
    triggerFlipRef.current = flipCard;

    // Short elastic rubber-band Verlet rope nodes along strap
    const nodes = Array.from({ length: JOINTS + 1 }, () => new THREE.Vector3());
    const prevNodes = Array.from({ length: JOINTS + 1 }, () => new THREE.Vector3());
    const restLen = 0.10;

    for (let i = 0; i <= JOINTS; i++) {
      const frac = i / JOINTS;
      nodes[i].set(0, anchor.y - frac * (anchor.y - (cardPos.y + hangY)), 0);
      prevNodes[i].copy(nodes[i]);
    }

    // Ribbon curve points
    const points = Array.from({ length: SAMPLES }, () => new THREE.Vector3());
    const sides = Array.from({ length: SAMPLES }, () => new THREE.Vector3());
    const bends = BAND_COLUMNS.map((_, i) => [Math.cos(BAND_BEND[i]), Math.sin(BAND_BEND[i])]);
    const mouth = new THREE.Vector3();
    const tuck = new THREE.Vector3();
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

          // Strong rubber-band elastic resistance ("lebih melawan"):
          const pull = rawTarget.clone().sub(restPos);
          const pullDist = pull.length();

          // Non-linear spring resistance factor: tightens up quickly like true rubber
          const tensionFactor = 1 / (1 + pullDist * 0.9);
          const resistedTarget = restPos.clone().add(pull.multiplyScalar(Math.max(0.32, tensionFactor)));

          // Clamped boundaries
          const minX = isMobile ? -1.6 : -2.2;
          const maxX = isMobile ? 1.6 : 2.2;
          const minY = -1.2;
          const maxY = anchor.y - 0.25;

          resistedTarget.x = THREE.MathUtils.clamp(resistedTarget.x, minX, maxX);
          resistedTarget.y = THREE.MathUtils.clamp(resistedTarget.y, minY, maxY);
          resistedTarget.z = THREE.MathUtils.clamp(resistedTarget.z, -0.5, 0.9);

          cardVel.copy(resistedTarget).sub(cardPos).multiplyScalar(0.75);
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

        // Tap / Click detection: if moved less than 30px within 450ms -> trigger flip!
        if (!hasDragged || (dist < 30 && elapsed < 450)) {
          flipCard();
        } else {
          // Release drag: elastic snap-back momentum
          cardVel.clampLength(0, 16);
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
        const springK = 80.0;
        const damping = 0.86;

        // Gentle resting breeze
        const breezeX = Math.sin(elapsedTime * 1.3) * 0.05;
        const breezeZ = Math.cos(elapsedTime * 1.5) * 0.03;

        const forceX = -springK * (cardPos.x - breezeX);
        const forceY = -springK * (cardPos.y - restY) - 9.8 * 0.05;
        const forceZ = -springK * (cardPos.z - breezeZ);

        cardVel.x += forceX * dt;
        cardVel.y += forceY * dt;
        cardVel.z += forceZ * dt;
        cardVel.multiplyScalar(damping);
        cardPos.addScaledVector(cardVel, dt);
      }

      // Smooth, deterministic flip rotation (always lands squarely on 0 or 180 degrees)
      currentFlipAngle += (targetFlipAngle - currentFlipAngle) * 0.16;

      // Realistic Card Tilt Physics
      const tiltZ = THREE.MathUtils.clamp(-cardVel.x * 0.22, -0.45, 0.45);
      const tiltX = THREE.MathUtils.clamp(cardVel.y * 0.16 + (cardPos.z > 0 ? 0.04 : -0.04), -0.35, 0.35);

      const euler = new THREE.Euler(tiltX, currentFlipAngle, tiltZ, 'YXZ');
      cardQuat.setFromEuler(euler);

      // Card transforms
      cardGroup.position.copy(cardPos);
      cardGroup.quaternion.copy(cardQuat);

      // Top eyelet position
      const eyeletPos = new THREE.Vector3(0, hangY, 0).applyQuaternion(cardQuat).add(cardPos);

      clampGroup.position.copy(eyeletPos);
      clampGroup.quaternion.copy(cardQuat);

      // Short elastic rubber-band Verlet rope physics for strap
      nodes[0].copy(anchor);
      nodes[JOINTS].copy(eyeletPos);

      for (let i = 1; i < JOINTS; i++) {
        const cur = nodes[i];
        const prev = prevNodes[i];
        const vel = cur.clone().sub(prev).multiplyScalar(0.91);
        prev.copy(cur);

        const wind = Math.sin(elapsedTime * 2.4 + i * 0.6) * 0.002;
        cur.add(vel);
        cur.y += -9.8 * dt * dt * 0.4;
        cur.x += wind;
      }

      // Elastic distance constraints relaxation with spring compliance
      const currentDist = anchor.distanceTo(eyeletPos);
      const targetSegLen = THREE.MathUtils.lerp(restLen, currentDist / JOINTS, 0.65);

      for (let pass = 0; pass < 8; pass++) {
        for (let i = 0; i < JOINTS; i++) {
          const p1 = nodes[i];
          const p2 = nodes[i + 1];
          const delta = p2.clone().sub(p1);
          const dist = delta.length();
          if (dist > 1e-5) {
            const error = (dist - targetSegLen) * 0.5;
            delta.normalize().multiplyScalar(error);
            if (i > 0) p1.add(delta);
            if (i + 1 < JOINTS) p2.sub(delta);
          }
        }
      }

      // Update Ribbon Strap Geometry
      const reach = EYELET_RADIUS + CLAMP_BODY + 0.04;
      let guide = JOINTS - 1;
      while (guide > 0 && nodes[guide].distanceTo(eyeletPos) < reach * 1.1) guide--;
      const axis = new THREE.Vector3().subVectors(nodes[guide], eyeletPos);
      if (axis.lengthSq() < 1e-8) axis.set(0, 1, 0).applyQuaternion(cardQuat);
      axis.normalize();

      mouth.copy(eyeletPos).addScaledVector(axis, reach);
      tuck.copy(eyeletPos).addScaledVector(axis, EYELET_RADIUS + CLAMP_BODY * 0.35);

      controls.length = 0;
      for (let i = 0; i <= guide; i++) controls.push(nodes[i]);
      controls.push(mouth, tuck);

      curve.updateArcLengths();
      for (let i = 0; i < SAMPLES; i++) curve.getPointAt(i / (SAMPLES - 1), points[i]);

      const totalLen = curve.getLength();
      const held = 1 - mouth.distanceTo(tuck) / Math.max(totalLen, 0.001);
      const posAttr = bandGeometry.getAttribute('position');
      const normAttr = bandGeometry.getAttribute('normal');
      const uvAttr = bandGeometry.getAttribute('uv');
      const columns = BAND_COLUMNS.length;

      // Ribbon repeats tailored for short taut strap with seamless branding
      const repeats = Math.max(0.75, totalLen / 1.15);
      const widthScale = STRAP_WIDTH / Math.pow(Math.max(1, totalLen / Math.max(restLen * JOINTS, 0.001)), 0.35);

      const tangent = new THREE.Vector3();
      const toCam = new THREE.Vector3();
      const across = new THREE.Vector3();
      const facing = new THREE.Vector3();

      for (let i = 0; i < SAMPLES; i++) {
        tangent.subVectors(points[Math.min(SAMPLES - 1, i + 1)], points[Math.max(0, i - 1)]);
        if (tangent.lengthSq() < 1e-12) tangent.set(0, -1, 0);
        tangent.normalize();

        toCam.subVectors(camera.position, points[i]).normalize();
        const side = sides[i].crossVectors(toCam, tangent);
        if (side.lengthSq() < 1e-10) side.copy(i > 0 ? sides[i - 1] : new THREE.Vector3(1, 0, 0));
        side.normalize();
        if (i > 0 && side.dot(sides[i - 1]) < 0) side.negate();

        const angle = -0.5 * Math.pow(Math.min(1, i / (SAMPLES - 1) / held), 1.3);
        facing.crossVectors(tangent, side);
        across.copy(side).multiplyScalar(Math.cos(angle)).addScaledVector(facing, Math.sin(angle));
        facing.crossVectors(tangent, across);

        const p = points[i];
        const v = (1 - i / (SAMPLES - 1)) * repeats;

        for (let c = 0; c < columns; c++) {
          const k = i * columns + c;
          const offset = (BAND_COLUMNS[c] - 0.5) * widthScale;
          const [bendCos, bendSin] = bends[c];
          posAttr.setXYZ(k, p.x + across.x * offset, p.y + across.y * offset, p.z + across.z * offset);
          normAttr.setXYZ(
            k,
            facing.x * bendCos + across.x * bendSin,
            facing.y * bendCos + across.y * bendSin,
            facing.z * bendCos + across.z * bendSin
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

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 360;
      height = container.clientHeight || 580;
      const pr = Math.min(window.devicePixelRatio || 1, 2.5);
      renderer.setPixelRatio(pr);
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.position.z = width < 640 ? 6.0 : 6.4;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);

      [bodyMesh, frontMesh, backMesh, ring, hitBox, clampMesh, eyelet, band].forEach((m) => m.geometry?.dispose());
      [frontMaterial, backMaterial, edgeMaterial, metalMaterial, bandMaterial].forEach((m) => m.dispose());
      [frontTexture, backTexture, strapTexture].forEach((t) => t.dispose());
      renderer.dispose();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, [frontImage, backImage, strapImage, playBeep]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[480px] sm:h-[540px] md:h-[600px] lg:h-[640px] flex items-center justify-center select-none touch-none ${className}`}
      style={style}
    >
      {/* Interactive Helper Hint Badge & Direct Flip Button */}
      <button
        type="button"
        onClick={handleBadgeClick}
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/95 hover:bg-slate-800 active:scale-95 backdrop-blur-md border border-sky-500/40 hover:border-sky-400 text-[11px] sm:text-xs text-slate-100 shadow-2xl transition-all duration-300 max-w-[94%] truncate z-20 cursor-pointer pointer-events-auto group ${
          isDragging ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
        }`}
        title="Klik untuk membalik ID Card"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping shrink-0" />
        <span className="truncate font-semibold group-hover:text-white transition-colors">
          Tarik bebas & Sentuh / Klik untuk Membalik ID Card
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono shrink-0 ml-1 font-bold">
          <svg className="w-3 h-3 transition-transform group-hover:rotate-180 duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {isFlipped ? 'Belakang' : 'Depan'}
        </span>
      </button>

      {/* Active interaction indicator */}
      {isDragging && (
        <div className="absolute top-4 right-4 text-[10px] uppercase font-mono px-3.5 py-1.5 rounded-full bg-sky-500/25 text-sky-200 border border-sky-500/50 backdrop-blur-md pointer-events-none animate-pulse z-20 flex items-center gap-2 shadow-xl shadow-sky-950/50">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          <span className="font-bold tracking-wider">Tarik Bebas Aktif</span>
        </div>
      )}
    </div>
  );
}
