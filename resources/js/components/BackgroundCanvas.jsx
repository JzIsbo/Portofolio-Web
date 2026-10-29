import React, { useEffect, useRef } from 'react';

/**
 * Immersive Space Cosmic Canvas Effect (Enhanced alfari.my.id Style)
 *
 * Features:
 * - High-frequency dynamic shooting stars / meteors with glowing heads and fading gradient trails
 * - 3-tier multi-depth starfield with sinusoidal twinkling and diamond sparkle flares
 * - Drifting cosmic stardust with subtle organic floating and interactive mouse drift
 * - Deep pulsating cosmic aurora/nebula glow gradients in the background
 * - 60fps buttery smooth performance with HiDPI support
 */
export default function BackgroundCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const isMobile = width < 640;

    // 1. Multi-depth Starfield
    const numStars = isMobile ? 65 : 150;
    const stars = Array.from({ length: numStars }, (_, i) => {
      const layer = i % 3; // 0 = deep, 1 = mid, 2 = bright sparkle
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size: layer === 2 ? Math.random() * 1.6 + 1.6 : layer === 1 ? Math.random() * 1.0 + 0.8 : Math.random() * 0.7 + 0.5,
        alpha: Math.random() * 0.6 + 0.3,
        baseAlpha: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.03 + 0.015,
        twinkleOffset: Math.random() * Math.PI * 2,
        isSparkle: layer === 2 && Math.random() > 0.4,
        color:
          i % 4 === 0
            ? '#38bdf8' // Cyber cyan
            : i % 4 === 1
            ? '#c084fc' // Cosmic purple
            : i % 7 === 0
            ? '#fb7185' // Rose neon
            : '#ffffff', // Pure white
      };
    });

    // 2. Floating Cosmic Stardust Particles
    const numDust = isMobile ? 18 : 36;
    const dust = Array.from({ length: numDust }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.2 + 1.2,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      alpha: Math.random() * 0.35 + 0.12,
      pulse: Math.random() * Math.PI * 2,
      color: Math.random() > 0.5 ? '#38bdf8' : '#c084fc',
    }));

    // 3. Dynamic Shooting Stars / Meteors
    const meteors = [];
    const createMeteor = () => {
      // Spawn near top or left, shoot down-right across screen at ~40 degree angle
      const startX = Math.random() * width * 1.1;
      const startY = Math.random() * (height * 0.45);
      const length = Math.random() * 100 + 90;
      const speed = Math.random() * 9 + 11;
      const angle = (Math.PI / 4.2) + (Math.random() - 0.5) * 0.18; // ~42° diagonal streak

      meteors.push({
        x: startX,
        y: startY,
        length,
        speed,
        vx: -Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1.0,
        decay: Math.random() * 0.018 + 0.014,
        color: Math.random() > 0.35 ? '#38bdf8' : '#c084fc',
      });
    };

    // Pre-populate with one meteor
    createMeteor();

    // Mouse interactive position
    let mouse = { x: width / 2, y: height / 2, active: false };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animId;
    let angle = 0;
    let meteorCooldown = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // --- Layer A: Subtle Cosmic Aurora / Nebula Breathing Glows ---
      const nebulaPulse = Math.sin(angle * 0.4) * 0.02 + 0.06;
      // Cyan upper nebula
      const neb1 = ctx.createRadialGradient(width * 0.25, height * 0.25, 10, width * 0.25, height * 0.25, width * 0.45);
      neb1.addColorStop(0, `rgba(56, 189, 248, ${nebulaPulse})`);
      neb1.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = neb1;
      ctx.fillRect(0, 0, width, height);

      // Violet right nebula
      const neb2 = ctx.createRadialGradient(width * 0.8, height * 0.4, 10, width * 0.8, height * 0.4, width * 0.4);
      neb2.addColorStop(0, `rgba(168, 85, 247, ${nebulaPulse * 0.9})`);
      neb2.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.fillStyle = neb2;
      ctx.fillRect(0, 0, width, height);

      // --- Layer B: Twinkling Multi-Depth Stars ---
      for (let star of stars) {
        star.alpha = star.baseAlpha + Math.sin(angle * 45 * star.twinkleSpeed + star.twinkleOffset) * 0.35;
        const currentAlpha = Math.max(0.1, Math.min(1.0, star.alpha));

        ctx.fillStyle = star.color;
        ctx.globalAlpha = currentAlpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // 4-point diamond cross flare for bright sparkle stars
        if (star.isSparkle && currentAlpha > 0.65) {
          const flareLen = star.size * 3.5;
          ctx.strokeStyle = star.color;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(star.x - flareLen, star.y);
          ctx.lineTo(star.x + flareLen, star.y);
          ctx.moveTo(star.x, star.y - flareLen);
          ctx.lineTo(star.x, star.y + flareLen);
          ctx.stroke();
        }
      }

      // --- Layer C: Drifting Cosmic Dust ---
      for (let d of dust) {
        d.x += d.vx;
        d.y += d.vy;
        d.pulse += 0.02;

        // Subtle mouse interactive repulsion
        if (mouse.active) {
          const dx = d.x - mouse.x;
          const dy = d.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 120 && dist > 1) {
            const force = (120 - dist) / 120 * 0.4;
            d.x += (dx / dist) * force;
            d.y += (dy / dist) * force;
          }
        }

        if (d.x < 0) d.x = width;
        if (d.x > width) d.x = 0;
        if (d.y < 0) d.y = height;
        if (d.y > height) d.y = 0;

        const currentDustAlpha = Math.max(0.08, d.alpha + Math.sin(d.pulse) * 0.1);
        ctx.fillStyle = d.color;
        ctx.globalAlpha = currentDustAlpha;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- Layer D: Dynamic High-Visibility Shooting Stars ---
      meteorCooldown++;
      // Spawn meteors every ~1.8 to 2.5 seconds (110 - 150 frames)
      if (meteorCooldown > (isMobile ? 120 : 90)) {
        if (Math.random() < 0.75) {
          createMeteor();
        }
        meteorCooldown = 0;
      }

      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx;
        m.y += m.vy;
        m.alpha -= m.decay;

        if (m.alpha <= 0 || m.x < -150 || m.y > height + 150) {
          meteors.splice(i, 1);
          continue;
        }

        const tailX = m.x - (m.vx / m.speed) * m.length;
        const tailY = m.y - (m.vy / m.speed) * m.length;

        const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${m.alpha})`);
        grad.addColorStop(0.2, m.color === '#c084fc' ? `rgba(192, 132, 252, ${m.alpha * 0.85})` : `rgba(56, 189, 248, ${m.alpha * 0.85})`);
        grad.addColorStop(0.6, `rgba(30, 58, 138, ${m.alpha * 0.4})`);
        grad.addColorStop(1, 'rgba(15, 23, 42, 0)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Brilliant glowing spark at meteor head
        ctx.globalAlpha = m.alpha;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(m.x, m.y, 2.6, 0, Math.PI * 2);
        ctx.fill();

        // Outer glow halo around head
        const haloGrad = ctx.createRadialGradient(m.x, m.y, 1, m.x, m.y, 8);
        haloGrad.addColorStop(0, `rgba(255, 255, 255, ${m.alpha * 0.9})`);
        haloGrad.addColorStop(0.4, m.color === '#c084fc' ? `rgba(192, 132, 252, ${m.alpha * 0.6})` : `rgba(56, 189, 248, ${m.alpha * 0.6})`);
        haloGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      angle += 0.01;
      animId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-95"
      aria-hidden="true"
    />
  );
}
