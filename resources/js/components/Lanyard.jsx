import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * Ultra-Realistic 3D Interactive Lanyard & VIP ID Card Component
 * Featuring:
 * - High-Resolution (1024x1536) ultra-sharp textures for Front & Back VIP Pass
 * - Steve Marvin's high-contrast portrait photo & crisp legible typography on web & mobile
 * - Double-sided card (Front: VIP All-Access Pass, Back: Core Competencies & Brands)
 * - Realistic Acrylic/PVC Protective Badge Holder with top punch slot & glass sheen
 * - Chrome metallic hardware: Swivel clasp hook, D-ring, and vinyl snap strap with rivet
 * - Realistic flat woven fabric lanyard strap with edge stitching and repeating branding
 * - Real-time Verlet physics rope simulation with natural sway & spring tension
 * - Extended mobile drag range allowing pull-down directly above "Tentang Saya"
 * - Click / tap to flip card animation with sound cue
 */
export default function Lanyard({
  playBeep,
  className = '',
}) {
  const containerRef = useRef(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 360;
    let height = container.clientHeight || 520;
    let isMobile = (window.innerWidth || width) < 640;

    // --- Three.js Scene & Camera Setup ---
    const scene = new THREE.Scene();

    // Camera framing: on mobile bring camera closer so text and photo are large, bold, and crystal clear
    const getCameraZ = (w) => (w < 480 ? 6.2 : w < 640 ? 6.5 : 7.0);
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.25, getCameraZ(window.innerWidth || width));

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));
      renderer.setSize(width, height);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.18;
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL initialization failed:', e);
      return;
    }

    // --- Lighting Rig ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.45);
    scene.add(ambientLight);

    // Key directional light for crisp highlights and shadows
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight1.position.set(4, 9, 7);
    scene.add(dirLight1);

    // Cyan / cool fill light from opposite angle
    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 1.5);
    dirLight2.position.set(-5, -2, 5);
    scene.add(dirLight2);

    // Rose / warm point light for vibrant VIP pass reflections
    const rosePointLight = new THREE.PointLight(0xf43f5e, 2.8, 10);
    rosePointLight.position.set(1.5, 1.8, 3.5);
    scene.add(rosePointLight);

    const violetPointLight = new THREE.PointLight(0xa855f7, 1.8, 8);
    violetPointLight.position.set(-2, -1, 3);
    scene.add(violetPointLight);

    // --- High-Resolution VIP Pass Textures (1024 x 1536) ---
    const createSteveCardCanvas = (isBack = false) => {
      const cvs = document.createElement('canvas');
      cvs.width = 1024;
      cvs.height = 1536;
      const ctx = cvs.getContext('2d');

      const renderCanvasContent = () => {
        ctx.clearRect(0, 0, 1024, 1536);

        if (!isBack) {
          // ========== FRONT CARD ==========
          // Deep obsidian luxury gradient
          const bgGrad = ctx.createLinearGradient(0, 0, 1024, 1536);
          bgGrad.addColorStop(0, '#0a0d18');
          bgGrad.addColorStop(0.35, '#180e28');
          bgGrad.addColorStop(0.7, '#0f0a1d');
          bgGrad.addColorStop(1, '#06070e');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, 1024, 1536);

          // Tech grid pattern background
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
          ctx.lineWidth = 1.5;
          for (let x = 40; x < 1024; x += 48) {
            ctx.beginPath();
            ctx.moveTo(x, 40);
            ctx.lineTo(x, 1496);
            ctx.stroke();
          }
          for (let y = 40; y < 1536; y += 48) {
            ctx.beginPath();
            ctx.moveTo(40, y);
            ctx.lineTo(984, y);
            ctx.stroke();
          }

          // Holographic rainbow foil strip on left edge
          const holoGrad = ctx.createLinearGradient(36, 0, 84, 1536);
          holoGrad.addColorStop(0, 'rgba(244, 63, 94, 0.7)');
          holoGrad.addColorStop(0.25, 'rgba(168, 85, 247, 0.7)');
          holoGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.7)');
          holoGrad.addColorStop(0.75, 'rgba(52, 211, 153, 0.7)');
          holoGrad.addColorStop(1, 'rgba(251, 191, 36, 0.7)');
          ctx.fillStyle = holoGrad;
          ctx.fillRect(36, 36, 36, 1464);

          // Holographic diagonal shimmer lines
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 2;
          for (let i = 0; i < 1536; i += 28) {
            ctx.beginPath();
            ctx.moveTo(36, i);
            ctx.lineTo(72, i + 36);
            ctx.stroke();
          }

          // Outer Rose Perimeter Border with rounded corners
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 12;
          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(24, 24, 976, 1488, 36);
            ctx.stroke();
          } else {
            ctx.strokeRect(24, 24, 976, 1488);
          }

          // Inner glowing border accent
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
          ctx.lineWidth = 2.5;
          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(42, 42, 940, 1452, 26);
            ctx.stroke();
          } else {
            ctx.strokeRect(42, 42, 940, 1452);
          }

          // Top VIP Header Pill
          ctx.fillStyle = 'rgba(244, 63, 94, 0.22)';
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(100, 72, 824, 76, 38);
          else ctx.rect(100, 72, 824, 76);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#fda4af';
          ctx.font = 'bold 30px "Space Grotesk", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('★ OFFICIAL VIP PASS | BRAND ACTIVATION ★', 512, 122);

          // Portrait Photo Section
          const photoY = 430;
          const photoRadius = 185;

          // Photo ambient back glow
          const glowGrad = ctx.createRadialGradient(512, photoY, photoRadius * 0.8, 512, photoY, photoRadius * 1.35);
          glowGrad.addColorStop(0, 'rgba(244, 63, 94, 0.55)');
          glowGrad.addColorStop(1, 'rgba(244, 63, 94, 0)');
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(512, photoY, photoRadius * 1.35, 0, Math.PI * 2);
          ctx.fill();

          // Photo placeholder while image loads
          ctx.fillStyle = '#1e1b4b';
          ctx.beginPath();
          ctx.arc(512, photoY, photoRadius, 0, Math.PI * 2);
          ctx.fill();

          // Draw photo if loaded
          if (photoImg.complete && photoImg.naturalWidth) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(512, photoY, photoRadius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(photoImg, 512 - photoRadius, photoY - photoRadius, photoRadius * 2, photoRadius * 2);
            ctx.restore();
          }

          // Double ring border around photo
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

          // Full Name (Huge, Bold, High Contrast)
          ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
          ctx.shadowBlur = 18;
          ctx.fillStyle = '#ffffff';
          ctx.font = '900 68px "Space Grotesk", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('STEVE MARVIN', 512, 720);
          ctx.shadowBlur = 0;

          // Role Title (Vibrant Rose / Coral)
          ctx.fillStyle = '#fb7185';
          ctx.font = 'bold 38px "Space Grotesk", sans-serif';
          ctx.fillText('SUPERVISOR BRAND ACTIVATION', 512, 780);

          // GOC Portfolio Brands Card Pill
          ctx.fillStyle = 'rgba(255, 255, 255, 0.09)';
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(100, 830, 824, 76, 20);
          else ctx.rect(100, 830, 824, 76);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 30px sans-serif';
          ctx.fillText('GOC (Purbasari • Amara • Onyx • CleanFace)', 512, 878);

          // Ex Kanzler Experience Badge
          ctx.fillStyle = 'rgba(14, 165, 233, 0.14)';
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(150, 930, 724, 64, 32);
          else ctx.rect(150, 930, 724, 64);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#93c5fd';
          ctx.font = 'bold 26px "Space Grotesk", monospace';
          ctx.fillText('Ex KANZLER (Cimory Group)', 512, 972);

          // Tagline & Focus
          ctx.fillStyle = '#cbd5e1';
          ctx.font = 'bold 24px monospace';
          ctx.fillText('EVENT MANAGEMENT • BRAND EXPERIENTIAL', 512, 1045);

          // High-Contrast Scannable VIP Barcode
          const barStartX = 140;
          const barY = 1110;
          const barHeight = 130;
          const barCount = 44;
          const barSpacing = (1024 - barStartX * 2) / barCount;

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

          // Pass ID & Security Code
          ctx.fillStyle = '#e2e8f0';
          ctx.font = 'bold 26px monospace';
          ctx.fillText('PASS ID: SM-GOC-2026-VIP', 512, 1290);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '20px monospace';
          ctx.fillText('SECURITY LEVEL: MAXIMUM ALL-ACCESS', 512, 1330);
        } else {
          // ========== BACK CARD ==========
          // Deep obsidian background
          const bgGrad = ctx.createLinearGradient(0, 0, 1024, 1536);
          bgGrad.addColorStop(0, '#090d18');
          bgGrad.addColorStop(0.4, '#1b0e26');
          bgGrad.addColorStop(1, '#05070e');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, 1024, 1536);

          // Tech grid pattern background
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
          ctx.lineWidth = 1.5;
          for (let x = 40; x < 1024; x += 48) {
            ctx.beginPath();
            ctx.moveTo(x, 40);
            ctx.lineTo(x, 1496);
            ctx.stroke();
          }
          for (let y = 40; y < 1536; y += 48) {
            ctx.beginPath();
            ctx.moveTo(40, y);
            ctx.lineTo(984, y);
            ctx.stroke();
          }

          // Outer Rose Perimeter Border
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 12;
          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(24, 24, 976, 1488, 36);
            ctx.stroke();
          } else {
            ctx.strokeRect(24, 24, 976, 1488);
          }

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
          ctx.lineWidth = 2.5;
          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(42, 42, 940, 1452, 26);
            ctx.stroke();
          } else {
            ctx.strokeRect(42, 42, 940, 1452);
          }

          // Header
          ctx.fillStyle = '#ffffff';
          ctx.font = '900 52px "Space Grotesk", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('STEVE MARVIN', 512, 115);

          ctx.fillStyle = '#fb7185';
          ctx.font = 'bold 30px "Space Grotesk", sans-serif';
          ctx.fillText('SUPERVISOR BRAND ACTIVATION', 512, 170);

          // Competencies Badge
          ctx.fillStyle = 'rgba(244, 63, 94, 0.18)';
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.55)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(140, 210, 744, 60, 30);
          else ctx.rect(140, 210, 744, 60);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#fda4af';
          ctx.font = 'bold 24px monospace';
          ctx.fillText('CORE COMPETENCIES & TRACK RECORD', 512, 248);

          // Competencies List
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
            const itemY = 345 + idx * 72;

            ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(80, itemY - 42, 864, 58, 14);
            else ctx.rect(80, itemY - 42, 864, 58);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 28px sans-serif';
            ctx.fillText(skill, 110, itemY);
          });

          // Brands Box
          const boxY = 880;
          ctx.fillStyle = 'rgba(244, 63, 94, 0.14)';
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.45)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(80, boxY, 864, 210, 24);
          else ctx.rect(80, boxY, 864, 210);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#fda4af';
          ctx.font = 'bold 26px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('PORTFOLIO BRANDS', 512, boxY + 52);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 36px sans-serif';
          ctx.fillText('Purbasari • CleanFace • Amara • Onyx', 512, boxY + 115);

          ctx.fillStyle = '#93c5fd';
          ctx.font = 'bold 28px monospace';
          ctx.fillText('Ex KANZLER (Cimory Group)', 512, boxY + 170);

          // Verification Badge & QR Mockup
          const authY = 1140;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(140, authY, 744, 180, 20);
          else ctx.rect(140, authY, 744, 180);
          ctx.fill();
          ctx.stroke();

          // Mini QR pattern simulation
          const qrSize = 120;
          const qrX = 180;
          const qrY = authY + 30;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(qrX, qrY, qrSize, qrSize);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(qrX + 8, qrY + 8, qrSize - 16, qrSize - 16);
          ctx.fillStyle = '#ffffff';
          // Inner QR markers
          ctx.fillRect(qrX + 16, qrY + 16, 28, 28);
          ctx.fillRect(qrX + qrSize - 44, qrY + 16, 28, 28);
          ctx.fillRect(qrX + 16, qrY + qrSize - 44, 28, 28);
          // Micro dots
          ctx.fillRect(qrX + 54, qrY + 30, 12, 12);
          ctx.fillRect(qrX + 30, qrY + 60, 14, 14);
          ctx.fillRect(qrX + 65, qrY + 65, 20, 20);

          ctx.textAlign = 'left';
          ctx.fillStyle = '#22c55e';
          ctx.font = 'bold 28px monospace';
          ctx.fillText('✔ AUTHENTICATED PASS', 330, authY + 70);

          ctx.fillStyle = '#e2e8f0';
          ctx.font = 'bold 24px monospace';
          ctx.fillText('GOC BRAND ACTIVATION TEAM', 330, authY + 110);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '20px monospace';
          ctx.fillText('SCAN TO CONNECT & VERIFY PROFILE', 330, authY + 148);
        }
      };

      const photoImg = new Image();
      photoImg.crossOrigin = 'anonymous';

      renderCanvasContent();

      const tex = new THREE.CanvasTexture(cvs);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 16;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.generateMipmaps = true;

      // Handle async photo load
      if (!isBack) {
        photoImg.onload = () => {
          renderCanvasContent();
          tex.needsUpdate = true;
        };
        photoImg.onerror = () => {
          if (photoImg.src.indexOf('steve_hd.png') !== -1) {
            photoImg.src = '/assets/steve.png';
          }
        };
        photoImg.src = '/assets/steve_hd.png';
        if (photoImg.complete && photoImg.naturalWidth) {
          photoImg.onload();
        }
      }

      // Re-render when web fonts finish loading
      if (document.fonts?.ready) {
        document.fonts.ready.then(() => {
          renderCanvasContent();
          tex.needsUpdate = true;
        });
      }

      return tex;
    };

    const frontTex = createSteveCardCanvas(false);
    const backTex = createSteveCardCanvas(true);

    // --- Dynamic High-Resolution Woven Lanyard Strap Texture (1024 x 256) ---
    const createStrapCanvas = () => {
      const cvs = document.createElement('canvas');
      cvs.width = 1024;
      cvs.height = 256;
      const ctx = cvs.getContext('2d');

      // Deep dark woven fabric background
      ctx.fillStyle = '#070913';
      ctx.fillRect(0, 0, 1024, 256);

      // Micro woven pattern
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      for (let x = 0; x < 1024; x += 6) {
        for (let y = 0; y < 256; y += 6) {
          if ((x + y) % 12 === 0) {
            ctx.fillRect(x, y, 3, 3);
          }
        }
      }

      // Edge stitching lines (Rose neon)
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(0, 14);
      ctx.lineTo(1024, 14);
      ctx.moveTo(0, 242);
      ctx.lineTo(1024, 242);
      ctx.stroke();

      // White inner thread dashed stitch
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 3;
      ctx.setLineDash([14, 10]);
      ctx.beginPath();
      ctx.moveTo(0, 26);
      ctx.lineTo(1024, 26);
      ctx.moveTo(0, 230);
      ctx.lineTo(1024, 230);
      ctx.stroke();
      ctx.setLineDash([]);

      // Repeating Steve Marvin & Brand Activation metallic typography
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 48px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('STEVE MARVIN  ★  BRAND ACTIVATION  ★  GOC  ★', 512, 130);

      const tex = new THREE.CanvasTexture(cvs);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 16;
      return tex;
    };

    const strapTex = createStrapCanvas();

    // --- 3D ID Card Assembly with Clear Acrylic Badge Holder & Hardware ---
    const cardWidth = 2.4;
    const cardHeight = 3.6;
    const cardThickness = 0.04;

    // Card Core Mesh
    const cardMaterials = [
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.35 }), // right edge
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.35 }), // left edge
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.35 }), // top edge
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.35 }), // bottom edge
      new THREE.MeshStandardMaterial({
        map: frontTex,
        roughness: 0.2,
        metalness: 0.12,
        clearcoat: 0.9,
        clearcoatRoughness: 0.06,
      }), // Front face
      new THREE.MeshStandardMaterial({
        map: backTex,
        roughness: 0.25,
        metalness: 0.1,
        clearcoat: 0.7,
        clearcoatRoughness: 0.08,
      }), // Back face
    ];

    const cardGeometry = new THREE.BoxGeometry(cardWidth, cardHeight, cardThickness);
    const cardMesh = new THREE.Mesh(cardGeometry, cardMaterials);
    cardMesh.castShadow = true;
    cardMesh.receiveShadow = true;

    // Realistic Clear Acrylic Badge Holder Casing
    const casingGroup = new THREE.Group();
    const casingMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.28,
      roughness: 0.1,
      transmission: 0.7,
      thickness: 0.06,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });

    // Casing body enclosing card
    const casingGeom = new THREE.BoxGeometry(cardWidth + 0.16, cardHeight + 0.16, cardThickness + 0.04);
    const casingMesh = new THREE.Mesh(casingGeom, casingMat);
    casingGroup.add(casingMesh);

    // Top Header Tab of Casing with punch slot
    const topTabGeom = new THREE.BoxGeometry(1.6, 0.44, cardThickness + 0.04);
    const topTabMesh = new THREE.Mesh(topTabGeom, casingMat);
    topTabMesh.position.set(0, cardHeight / 2 + 0.24, 0);
    casingGroup.add(topTabMesh);

    // Punch Hole Slot (Dark slot where clip strap threads through)
    const slotGeom = new THREE.BoxGeometry(0.55, 0.14, cardThickness + 0.08);
    const slotMat = new THREE.MeshBasicMaterial({ color: 0x050510 });
    const slotMesh = new THREE.Mesh(slotGeom, slotMat);
    slotMesh.position.set(0, cardHeight / 2 + 0.24, 0);
    casingGroup.add(slotMesh);

    // Hardware: Lobster Clasp, Swivel D-Ring & Vinyl Snap Strap
    const clipGroup = new THREE.Group();
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.96,
      roughness: 0.14,
    });

    // Clear vinyl snap strap that loops through slot
    const vinylStrapMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.65,
      roughness: 0.12,
      transmission: 0.8,
    });
    const vinylStrapGeom = new THREE.BoxGeometry(0.24, 0.42, 0.04);
    const vinylStrap = new THREE.Mesh(vinylStrapGeom, vinylStrapMat);
    vinylStrap.position.set(0, cardHeight / 2 + 0.26, 0);
    clipGroup.add(vinylStrap);

    // Chrome metal snap button / rivet on vinyl strap
    const rivetGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.08, 20);
    rivetGeom.rotateX(Math.PI / 2);
    const rivetMesh = new THREE.Mesh(rivetGeom, chromeMat);
    rivetMesh.position.set(0, cardHeight / 2 + 0.32, 0);
    clipGroup.add(rivetMesh);

    // Swivel clasp connector
    const swivelGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.16, 20);
    const swivelMesh = new THREE.Mesh(swivelGeom, chromeMat);
    swivelMesh.position.set(0, cardHeight / 2 + 0.52, 0);
    clipGroup.add(swivelMesh);

    // Metal D-Ring at top of clasp
    const ringGeom = new THREE.TorusGeometry(0.18, 0.042, 16, 32);
    const ringMesh = new THREE.Mesh(ringGeom, chromeMat);
    ringMesh.position.set(0, cardHeight / 2 + 0.66, 0);
    clipGroup.add(ringMesh);

    // Strap metal crimp clamp
    const crimpGeom = new THREE.BoxGeometry(0.34, 0.14, 0.1, 16);
    const crimpMesh = new THREE.Mesh(crimpGeom, chromeMat);
    crimpMesh.position.set(0, cardHeight / 2 + 0.78, 0);
    clipGroup.add(crimpMesh);

    // Assembly Group for Card + Casing + Hardware
    const cardGroup = new THREE.Group();
    cardGroup.add(cardMesh);
    cardGroup.add(casingGroup);
    cardGroup.add(clipGroup);
    scene.add(cardGroup);

    // --- Flat Woven Lanyard Ribbon Strap & Verlet Physics ---
    const NUM_SEGMENTS = 18;
    const anchorY = 4.2; // Anchor hangs high from above top viewport
    const ropePoints = [];
    const prevRopePoints = [];

    // Initialize rope points from top anchor down to clip clamp
    for (let i = 0; i <= NUM_SEGMENTS; i++) {
      const t = i / NUM_SEGMENTS;
      const pt = new THREE.Vector3(0, anchorY - t * 3.2, 0);
      ropePoints.push(pt.clone());
      prevRopePoints.push(pt.clone());
    }

    const strapMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: strapTex,
      roughness: 0.55,
      metalness: 0.12,
      side: THREE.DoubleSide,
    });

    // Custom Ribbon Geometry Generator for realistic flat lanyard ribbon
    const createRibbonGeometry = (curve, segments = 32, width = 0.26) => {
      const pts = curve.getPoints(segments);
      const positions = [];
      const uvs = [];
      const indices = [];

      const forward = new THREE.Vector3(0, 0, 1);

      for (let i = 0; i <= segments; i++) {
        const p = pts[i];
        const t = i / segments;
        const tan = curve.getTangent(t);

        // Calculate binormal vector perpendicular to curve tangent
        let binormal = new THREE.Vector3().crossVectors(tan, forward).normalize();
        if (binormal.lengthSq() < 0.001) {
          binormal.set(1, 0, 0);
        }

        const halfW = width * 0.5;
        const left = p.clone().addScaledVector(binormal, -halfW);
        const right = p.clone().addScaledVector(binormal, halfW);

        positions.push(left.x, left.y, left.z);
        positions.push(right.x, right.y, right.z);

        const u = t * 5.0; // Repeat strap pattern 5 times along length
        uvs.push(u, 0);
        uvs.push(u, 1);

        if (i < segments) {
          const row1 = i * 2;
          const row2 = (i + 1) * 2;
          // Front face
          indices.push(row1, row1 + 1, row2);
          indices.push(row1 + 1, row2 + 1, row2);
          // Back face (double sided)
          indices.push(row1, row2, row1 + 1);
          indices.push(row1 + 1, row2, row2 + 1);
        }
      }

      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geom.setIndex(indices);
      geom.computeVertexNormals();
      return geom;
    };

    let strapMesh;
    const updateStrapMesh = () => {
      if (strapMesh) {
        scene.remove(strapMesh);
        strapMesh.geometry.dispose();
      }
      const curve = new THREE.CatmullRomCurve3(ropePoints);
      const geom = createRibbonGeometry(curve, isMobile ? 22 : 32, 0.26);
      strapMesh = new THREE.Mesh(geom, strapMaterial);
      scene.add(strapMesh);
    };
    updateStrapMesh();

    // --- Card Physics State ---
    let cardPos = new THREE.Vector3(0, 0.45, 0);
    let cardVel = new THREE.Vector3(0, 0, 0);
    let cardRot = new THREE.Euler(0, 0, 0);
    let targetFlipAngle = 0;

    // --- Drag Interaction & Pointer Handling ---
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
      const intersects = raycaster.intersectObjects([cardMesh, casingMesh, topTabMesh]);

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

          // Clamping bounds:
          // On mobile, allow the card to be pulled all the way down (-1.15 to -1.3)
          // so the bottom edge of the card reaches right above the "Tentang Saya" badge!
          const currentIsMobile = (window.innerWidth || width) < 640;
          const minY = currentIsMobile ? -1.15 : -1.5;
          const maxY = currentIsMobile ? 1.7 : 1.9;

          targetPos.x = THREE.MathUtils.clamp(targetPos.x, -2.5, 2.5);
          targetPos.y = THREE.MathUtils.clamp(targetPos.y, minY, maxY);
          targetPos.z = THREE.MathUtils.clamp(targetPos.z, -1.0, 1.8);

          cardVel.copy(targetPos).sub(cardPos).multiplyScalar(0.75);
          cardPos.copy(targetPos);
        }
      } else if (!isMobile) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects([cardMesh, casingMesh]);
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

        // Quick click / tap to flip card
        if (dist < 14 && elapsed < 420) {
          targetFlipAngle += Math.PI;
          setIsFlipped((f) => !f);
          playBeep?.(850);
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
      width = container.clientWidth || 360;
      height = container.clientHeight || 520;
      isMobile = (window.innerWidth || width) < 640;

      camera.aspect = width / height;
      camera.position.z = getCameraZ(window.innerWidth || width);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // --- Animation & Physics Loop ---
    let animationFrameId;
    const clock = new THREE.Clock();
    let frameCounter = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.045);
      const elapsedTime = clock.getElapsedTime();

      // --- Card Motion Spring Physics ---
      if (!dragging) {
        const restY = 0.45;
        const gravity = -9.8;
        const springK = 38.0; // Spring back to natural hanging position
        const damping = 0.89; // Damping

        // Gentle ambient pendulum wave
        const breezeX = Math.sin(elapsedTime * 1.4) * 0.12;
        const breezeZ = Math.cos(elapsedTime * 1.6) * 0.08;

        const forceX = -springK * (cardPos.x - breezeX);
        const forceY = -springK * (cardPos.y - restY) + gravity * 0.15;
        const forceZ = -springK * (cardPos.z - breezeZ);

        cardVel.x += forceX * delta;
        cardVel.y += forceY * delta;
        cardVel.z += forceZ * delta;

        cardVel.multiplyScalar(damping);
        cardPos.addScaledVector(cardVel, delta);
      }

      // --- Card Tilt & Rotation ---
      const targetRotZ = -cardVel.x * 0.28;
      const targetRotX = cardVel.y * 0.18 + (cardPos.z > 0 ? 0.08 : -0.08);

      cardRot.z += (targetRotZ - cardRot.z) * 0.14;
      cardRot.x += (targetRotX - cardRot.x) * 0.14;
      cardRot.y += (targetFlipAngle - cardRot.y) * 0.12;

      cardGroup.position.copy(cardPos);
      cardGroup.rotation.set(cardRot.x, cardRot.y, cardRot.z);

      // --- Verlet Rope Points Integration ---
      const topClipPos = new THREE.Vector3(0, cardHeight / 2 + 0.82, 0)
        .applyEuler(cardGroup.rotation)
        .add(cardGroup.position);

      ropePoints[0].set(0, anchorY, 0); // Fixed anchor high up
      ropePoints[NUM_SEGMENTS].copy(topClipPos); // Attached to clip clamp

      for (let i = 1; i < NUM_SEGMENTS; i++) {
        const cur = ropePoints[i];
        const prev = prevRopePoints[i];
        const vel = cur.clone().sub(prev).multiplyScalar(0.93);

        prev.copy(cur);

        const wind = Math.sin(elapsedTime * 2.2 + i * 0.45) * 0.0035;
        cur.add(vel);
        cur.y += -9.8 * 0.0003;
        cur.x += wind;
      }

      // Constraint relaxation passes
      const segmentLen = Math.max(0.12, (anchorY - topClipPos.y) / NUM_SEGMENTS);
      const passes = isMobile ? 3 : 5;
      for (let pass = 0; pass < passes; pass++) {
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

      // Dynamic strap ribbon geometry update
      frameCounter++;
      const isMoving = dragging || cardVel.lengthSq() > 0.0002;
      if (strapMesh && (isMoving || frameCounter % 3 === 0)) {
        const curve = new THREE.CatmullRomCurve3(ropePoints);
        strapMesh.geometry.dispose();
        strapMesh.geometry = createRibbonGeometry(curve, isMobile ? 22 : 32, 0.26);
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
  }, [playBeep]);

  return (
    <div
      className={`relative w-full h-[490px] sm:h-[540px] md:h-[620px] lg:h-[680px] flex items-center justify-center select-none ${className}`}
    >
      {/* 3D Canvas Mount */}
      <div
        ref={containerRef}
        style={{ touchAction: 'pan-y' }}
        className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center"
        aria-label="Interactive 3D Lanyard ID Badge Steve Marvin"
      />

      {/* Interactive Helper Hint Badge */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-rose-500/30 text-[11px] sm:text-xs text-slate-200 shadow-xl pointer-events-none transition-all duration-300 max-w-[92%] truncate ${
          isDragging ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
        <span className="truncate font-medium">Tarik ke bawah & Sentuh / Klik untuk Membalik ID Card</span>
      </div>

      {/* Active interaction indicator */}
      {isDragging && (
        <div className="absolute top-4 right-4 text-[10px] uppercase font-mono px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 backdrop-blur-sm pointer-events-none animate-pulse">
          Tarik Aktif
        </div>
      )}
    </div>
  );
}
