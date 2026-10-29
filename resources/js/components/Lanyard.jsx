import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * 3D Interactive Lanyard Component (React Bits Style)
 * Featuring:
 * - Real-time Verlet physics rope simulation
 * - Interactive pointer drag, throw/fling physics with spring damping
 * - Double-sided ID card (front: photo & developer info, back: credentials/details)
 * - Click to flip card animation
 * - Metal clip and woven strap with texture
 * - Responsive viewport with auto-scaling
 */
export default function Lanyard({
  frontImage = '/assets/frontCard.png',
  backImage = '/assets/backCard.png',
  strapImage = '/assets/band.png',
  className = '',
}) {
  const containerRef = useRef(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 340;
    let height = container.clientHeight || 420;
    const isMobile = (window.innerWidth || width) < 640;

    // --- Three.js Scene Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, width < 480 ? 8.4 : 7.5);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isMobile, // Disable MSAA on mobile for buttery smooth 60fps
        alpha: true,
        powerPreference: isMobile ? 'default' : 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
      renderer.setSize(width, height);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL initialization failed:', e);
      return;
    }

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight1.position.set(4, 8, 8);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight2.position.set(-5, -2, 4);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xa855f7, 2, 10);
    pointLight.position.set(0, 1, 3);
    scene.add(pointLight);

    // --- Card Dimensions & Materials ---
    const cardWidth = 2.4;
    const cardHeight = 3.6;
    const cardThickness = 0.04;

    const textureLoader = new THREE.TextureLoader();

    // Custom VIP Brand Activation Pass texture for Steve Marvin
    const createSteveCardCanvas = (isBack = false) => {
      const cvs = document.createElement('canvas');
      cvs.width = 512;
      cvs.height = 768;
      const ctx = cvs.getContext('2d');

      // VIP dark background gradient
      const grad = ctx.createLinearGradient(0, 0, 512, 768);
      if (isBack) {
        grad.addColorStop(0, '#090d16');
        grad.addColorStop(0.5, '#1e1022');
        grad.addColorStop(1, '#05070c');
      } else {
        grad.addColorStop(0, '#0b0c16');
        grad.addColorStop(0.4, '#190e24');
        grad.addColorStop(1, '#06070e');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 768);

      // Gold & Rose border accents
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 10;
      ctx.strokeRect(16, 16, 480, 736);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.strokeRect(26, 26, 460, 716);

      if (!isBack) {
        // Top Header
        ctx.fillStyle = 'rgba(244, 63, 94, 0.2)';
        ctx.fillRect(36, 36, 440, 52);
        ctx.fillStyle = '#fda4af';
        ctx.font = 'bold 15px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('• OFFICIAL VIP PASS | BRAND ACTIVATION •', 256, 68);

        // Name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('STEVE MARVIN', 256, 405);

        // Title
        ctx.fillStyle = '#fb7185';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('SUPERVISOR BRAND ACTIVATION', 256, 442);

        // GOC Brand portfolio
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '16px sans-serif';
        ctx.fillText('GOC (Purbasari • Amara • Onyx • CleanFace)', 256, 478);

        // Ex Kanzler
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(76, 506, 360, 36, 18);
        else ctx.rect(76, 506, 360, 36);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.stroke();

        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('Ex KANZLER (Cimory Group)', 256, 530);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px monospace';
        ctx.fillText('EVENT MANAGEMENT • BRAND EXPERIENTIAL', 256, 575);

        // Barcode lines
        for (let i = 0; i < 34; i++) {
          ctx.fillStyle = i % 3 === 0 ? '#ffffff' : '#f43f5e';
          ctx.fillRect(86 + i * 10, 620, i % 2 === 0 ? 6 : 3, 52);
        }

        ctx.fillStyle = '#64748b';
        ctx.font = '12px monospace';
        ctx.fillText('PASS ID: SM-GOC-2026', 256, 698);

        const tex = new THREE.CanvasTexture(cvs);
        tex.colorSpace = THREE.SRGBColorSpace;

        // Load Steve Marvin's photo on top asynchronously and refresh texture
        const photo = new Image();
        photo.crossOrigin = 'anonymous';
        photo.src = '/assets/steve.png';
        photo.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.arc(256, 230, 115, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(photo, 141, 115, 230, 230);
          ctx.restore();

          // Border ring around photo
          ctx.beginPath();
          ctx.arc(256, 230, 115, 0, Math.PI * 2);
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 6;
          ctx.stroke();

          tex.needsUpdate = true;
        };

        return tex;
      } else {
        // Back of Card (Credentials, Skills & Brands)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(36, 36, 440, 696);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('BRAND ACTIVATION & EVENT', 256, 90);

        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 15px monospace';
        ctx.fillText('CORE COMPETENCIES', 256, 125);

        const items = [
          '• Event Planning & Stage Production',
          '• Experiential Brand Marketing',
          '• FMCG & Beauty Market Strategy',
          '• Multi-City Roadshow Management',
          '• KOL & Community Activation',
          '• Vendor & Logistics Negotiation',
          '• Budget & ROI Optimization',
        ];

        ctx.fillStyle = '#e2e8f0';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'left';
        items.forEach((item, idx) => {
          ctx.fillText(item, 70, 180 + idx * 38);
        });

        // Brands pill on back
        ctx.fillStyle = 'rgba(244, 63, 94, 0.15)';
        ctx.fillRect(60, 480, 392, 100);
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
        ctx.strokeRect(60, 480, 392, 100);

        ctx.fillStyle = '#fda4af';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PORTOFOLIO BRANDS', 256, 512);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText('Purbasari • CleanFace • Amara • Onyx', 256, 545);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '14px monospace';
        ctx.fillText('Ex KANZLER (Cimory Group)', 256, 615);

        // Security / Verification stamp
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.strokeRect(196, 640, 120, 40);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px monospace';
        ctx.fillText('AUTHENTICATED', 256, 665);

        const tex = new THREE.CanvasTexture(cvs);
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
      }
    };

    const frontTex = createSteveCardCanvas(false);
    const backTex = createSteveCardCanvas(true);

    const strapTex = strapImage
      ? textureLoader.load(strapImage, (tex) => {
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.RepeatWrapping;
          tex.repeat.set(1, 14);
        })
      : null;

    // Card Mesh (Rounded / Box with Front & Back materials)
    const cardMaterials = [
      new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.4 }), // right edge
      new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.4 }), // left edge
      new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.4 }), // top edge
      new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.4 }), // bottom edge
      new THREE.MeshStandardMaterial({
        map: frontTex,
        roughness: 0.25,
        metalness: 0.15,
        clearcoat: 0.5,
        clearcoatRoughness: 0.1,
      }), // Front
      new THREE.MeshStandardMaterial({
        map: backTex,
        roughness: 0.25,
        metalness: 0.15,
        clearcoat: 0.5,
        clearcoatRoughness: 0.1,
      }), // Back
    ];

    const cardGeometry = new THREE.BoxGeometry(cardWidth, cardHeight, cardThickness);
    const cardMesh = new THREE.Mesh(cardGeometry, cardMaterials);
    cardMesh.castShadow = true;
    cardMesh.receiveShadow = true;

    // Card Holder Clip Ring
    const clipGroup = new THREE.Group();
    const clipMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.15,
    });
    const clipRingGeom = new THREE.TorusGeometry(0.18, 0.045, 16, 32);
    const clipRing = new THREE.Mesh(clipRingGeom, clipMat);
    clipRing.position.set(0, cardHeight / 2 + 0.12, 0);
    clipGroup.add(clipRing);

    const clipBaseGeom = new THREE.CylinderGeometry(0.15, 0.15, 0.18, 24);
    const clipBase = new THREE.Mesh(clipBaseGeom, clipMat);
    clipBase.position.set(0, cardHeight / 2 + 0.04, 0);
    clipGroup.add(clipBase);

    // Assembly Group for Card + Clip
    const cardGroup = new THREE.Group();
    cardGroup.add(cardMesh);
    cardGroup.add(clipGroup);
    scene.add(cardGroup);

    // --- Rope / Lanyard Ribbon ---
    const NUM_SEGMENTS = 14;
    const anchorY = 3.8;
    const ropePoints = [];
    const prevRopePoints = [];

    // Initialize rope points from top anchor down to clip position
    for (let i = 0; i <= NUM_SEGMENTS; i++) {
      const t = i / NUM_SEGMENTS;
      const pt = new THREE.Vector3(0, anchorY - t * 3.4, 0);
      ropePoints.push(pt.clone());
      prevRopePoints.push(pt.clone());
    }

    const strapMaterial = new THREE.MeshStandardMaterial({
      color: strapTex ? 0xffffff : 0x0ea5e9,
      map: strapTex,
      roughness: 0.65,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });

    let strapMesh;
    const updateStrapGeometry = () => {
      if (strapMesh) {
        scene.remove(strapMesh);
        strapMesh.geometry.dispose();
      }
      const curve = new THREE.CatmullRomCurve3(ropePoints);
      // Flat ribbon or tube
      const geom = new THREE.TubeGeometry(curve, 32, 0.065, 8, false);
      strapMesh = new THREE.Mesh(geom, strapMaterial);
      scene.add(strapMesh);
    };
    updateStrapGeometry();

    // --- Card Physics State ---
    let cardPos = new THREE.Vector3(0, 0.4, 0);
    let cardVel = new THREE.Vector3(0, 0, 0);
    let cardRot = new THREE.Euler(0, 0, 0);
    let cardRotVel = new THREE.Vector3(0, 0, 0);
    let targetFlipAngle = 0;

    // --- Raycasting & Drag Interaction ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersectionPoint = new THREE.Vector3();
    const dragOffset = new THREE.Vector3();
    let dragging = false;
    let downPointerPos = { x: 0, y: 0, time: 0 };

    const getNDCCoords = (e) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
      return {
        x: ((clientX - rect.left) / rect.width) * 2 - 1,
        y: -((clientY - rect.top) / rect.height) * 2 + 1,
        rawX: clientX,
        rawY: clientY,
      };
    };

    const onPointerDown = (e) => {
      const { x, y, rawX, rawY } = getNDCCoords(e);
      mouse.x = x;
      mouse.y = y;
      downPointerPos = { x: rawX, y: rawY, time: performance.now() };

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(cardMesh);

      if (intersects.length > 0) {
        dragging = true;
        setIsDragging(true);
        container.style.cursor = 'grabbing';
        container.style.touchAction = 'none';
        try {
          if (e.pointerId !== undefined && container.setPointerCapture) {
            container.setPointerCapture(e.pointerId);
          }
        } catch {}
        raycaster.ray.intersectPlane(dragPlane, intersectionPoint);
        dragOffset.copy(cardPos).sub(intersectionPoint);
      }
    };

    const onPointerMove = (e) => {
      const { x, y } = getNDCCoords(e);
      mouse.x = x;
      mouse.y = y;

      if (dragging) {
        raycaster.setFromCamera(mouse, camera);
        if (raycaster.ray.intersectPlane(dragPlane, intersectionPoint)) {
          const targetPos = intersectionPoint.clone().add(dragOffset);
          // Limit drag range
          targetPos.x = THREE.MathUtils.clamp(targetPos.x, -2.8, 2.8);
          targetPos.y = THREE.MathUtils.clamp(targetPos.y, -2.5, 2.0);
          targetPos.z = THREE.MathUtils.clamp(targetPos.z, -1.0, 1.5);

          // Calculate velocity from drag
          cardVel.copy(targetPos).sub(cardPos).multiplyScalar(0.7);
          cardPos.copy(targetPos);
        }
      } else if (!isMobile) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(cardMesh);
        const hovered = intersects.length > 0;
        setIsHovered(hovered);
        container.style.cursor = hovered ? 'grab' : 'default';
      }
    };

    const onPointerUp = (e) => {
      if (dragging) {
        dragging = false;
        setIsDragging(false);
        container.style.cursor = isHovered ? 'grab' : 'default';
        container.style.touchAction = 'pan-y';
        try {
          if (e.pointerId !== undefined && container.releasePointerCapture) {
            container.releasePointerCapture(e.pointerId);
          }
        } catch {}

        const { rawX, rawY } = getNDCCoords(e);
        const dist = Math.hypot(rawX - downPointerPos.x, rawY - downPointerPos.y);
        const elapsed = performance.now() - downPointerPos.time;

        // If it was a quick tap/click without moving much, flip card!
        if (dist < 12 && elapsed < 450) {
          targetFlipAngle += Math.PI;
          setIsFlipped((f) => !f);
        }
      }
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    // --- Resize Handler ---
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 320;
      height = container.clientHeight || 360;
      camera.aspect = width / height;
      camera.position.z = width < 480 ? 8.4 : 7.5;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // --- Animation Loop ---
    let animationFrameId;
    let clock = new THREE.Clock();
    let frameCounter = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsedTime = clock.getElapsedTime();

      // --- Physics for Card Motion ---
      if (!dragging) {
        // Natural rest position hanging below top anchor
        const restY = 0.35;
        const gravity = -9.8;
        const springK = 35.0; // Spring back to center
        const damping = 0.88; // Friction

        // Gentle breeze / idle pendulum wave
        const breezeX = Math.sin(elapsedTime * 1.5) * 0.12;
        const breezeZ = Math.cos(elapsedTime * 1.8) * 0.08;

        const forceX = -springK * (cardPos.x - breezeX);
        const forceY = -springK * (cardPos.y - restY) + gravity * 0.15;
        const forceZ = -springK * (cardPos.z - breezeZ);

        cardVel.x += forceX * delta;
        cardVel.y += forceY * delta;
        cardVel.z += forceZ * delta;

        cardVel.multiplyScalar(damping);
        cardPos.addScaledVector(cardVel, delta);
      }

      // --- Rotation Physics & Tilt ---
      // Tilt card according to lateral movement
      const targetRotZ = -cardVel.x * 0.25;
      const targetRotX = cardVel.y * 0.15 + (cardPos.z > 0 ? 0.1 : -0.1);

      cardRot.z += (targetRotZ - cardRot.z) * 0.12;
      cardRot.x += (targetRotX - cardRot.x) * 0.12;

      // Smooth flip transition
      cardRot.y += (targetFlipAngle - cardRot.y) * 0.1;

      // Apply to card group
      cardGroup.position.copy(cardPos);
      cardGroup.rotation.set(cardRot.x, cardRot.y, cardRot.z);

      // --- Verlet Integration for Rope ---
      const topClipPos = new THREE.Vector3(0, cardHeight / 2 + 0.28, 0)
        .applyEuler(cardGroup.rotation)
        .add(cardGroup.position);

      ropePoints[0].set(0, anchorY, 0); // Fixed anchor at top
      ropePoints[NUM_SEGMENTS].copy(topClipPos); // Attached to clip

      // Verlet step for middle points
      for (let i = 1; i < NUM_SEGMENTS; i++) {
        const cur = ropePoints[i];
        const prev = prevRopePoints[i];
        const vel = cur.clone().sub(prev).multiplyScalar(0.92);

        prev.copy(cur);

        // Add gravity & wind
        const wind = Math.sin(elapsedTime * 2 + i * 0.5) * 0.003;
        cur.add(vel);
        cur.y += -9.8 * 0.0003;
        cur.x += wind;
      }

      // Constraint relaxation passes
      const segmentLen = (anchorY - topClipPos.y) / NUM_SEGMENTS;
      for (let pass = 0; pass < (isMobile ? 3 : 5); pass++) {
        for (let i = 0; i < NUM_SEGMENTS; i++) {
          const p1 = ropePoints[i];
          const p2 = ropePoints[i + 1];
          const diff = p2.clone().sub(p1);
          const dist = diff.length();
          if (dist > 0.0001) {
            const error = (dist - segmentLen) * 0.5;
            diff.normalize().multiplyScalar(error);
            if (i > 0) p1.add(diff);
            if (i + 1 < NUM_SEGMENTS) p2.sub(diff);
          }
        }
      }

      // Update strap tube geometry intelligently to save GPU & garbage collection
      frameCounter++;
      const isMoving = dragging || cardVel.lengthSq() > 0.0002;
      if (strapMesh && (isMoving || frameCounter % 4 === 0)) {
        const curve = new THREE.CatmullRomCurve3(ropePoints);
        strapMesh.geometry.dispose();
        strapMesh.geometry = new THREE.TubeGeometry(curve, isMobile ? 18 : 28, 0.06, isMobile ? 5 : 8, false);
      }

      renderer.render(scene, camera);
    };

    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [frontImage, backImage, strapImage]);

  return (
    <div className={`relative w-full h-[320px] sm:h-[440px] md:h-[560px] flex items-center justify-center select-none overflow-hidden ${className}`}>
      {/* 3D Canvas Mount */}
      <div
        ref={containerRef}
        style={{ touchAction: 'pan-y' }}
        className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center"
        aria-label="Interactive 3D Lanyard ID Badge"
      />

      {/* Interactive Helper Hint Badge */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-md border border-sky-500/25 text-[10px] sm:text-xs text-slate-300 shadow-lg pointer-events-none transition-opacity duration-300 max-w-[90%] truncate">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
        <span className="truncate">Tarik & Sentuh / Klik untuk Membalik ID Card</span>
      </div>

      {/* Active state indicator */}
      {isDragging && (
        <div className="absolute top-3 right-3 text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
          Interacting
        </div>
      )}
    </div>
  );
}
