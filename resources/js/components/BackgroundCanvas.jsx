import React, { useEffect, useRef } from 'react';

/**
 * Immersive Space Cosmic Canvas Effect (alfari.my.id style)
 * Featuring:
 * - Twinkling multi-depth stars with glowing color palette
 * - Dynamic diagonal shooting stars / meteor streaks with fading tails
 * - Floating cosmic dust particles with organic drifting motion
 * - Responsive 60fps performance optimized for both mobile and desktop
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

    // Twinkling multi-depth stars
    const numStars = Math.min(Math.floor((width * height) / 10000), isMobile ? 45 : 120);
    const stars = Array.from({ length: numStars }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.7 + 0.2,
      speed: Math.random() * 0.012 + 0.005,
      color: Math.random() > 0.45 ? '#38bdf8' : Math.random() > 0.5 ? '#a855f7' : '#ffffff',
    }));

    // Floating cosmic dust
    const numDust = isMobile ? 12 : 28;
    const dust = Array.from({ length: numDust }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.5 + 1.2,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      alpha: Math.random() * 0.25 + 0.08,
      color: Math.random() > 0.5 ? '#60a5fa' : '#c084fc',
    }));

    // Shooting stars / meteors
    const meteors = [];
    const createMeteor = () => {
      const startX = Math.random() * width * 1.2;
      const startY = Math.random() * (height * 0.45);
      const length = Math.random() * 80 + 70;
      const speed = Math.random() * 8 + 9;
      const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.2; // ~45 degree diagonal streak

      meteors.push({
        x: startX,
        y: startY,
        length,
        speed,
        vx: -Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1.0,
        decay: Math.random() * 0.015 + 0.012,
      });
    };

    let animId;
    let angle = 0;
    let nextMeteorTimer = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw and twinkle stars
      for (let star of stars) {
        star.alpha += Math.sin(angle * star.speed * 80) * 0.004;
        const currentAlpha = Math.max(0.15, Math.min(0.95, star.alpha));

        ctx.fillStyle = star.color;
        ctx.globalAlpha = currentAlpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Draw drifting cosmic dust
      for (let d of dust) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0) d.x = width;
        if (d.x > width) d.x = 0;
        if (d.y < 0) d.y = height;
        if (d.y > height) d.y = 0;

        ctx.fillStyle = d.color;
        ctx.globalAlpha = d.alpha;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Spawn and draw shooting stars (meteors)
      nextMeteorTimer++;
      if (nextMeteorTimer > (isMobile ? 180 : 120)) {
        if (Math.random() < 0.6) createMeteor();
        nextMeteorTimer = 0;
      }

      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx;
        m.y += m.vy;
        m.alpha -= m.decay;

        if (m.alpha <= 0 || m.x < -100 || m.y > height + 100) {
          meteors.splice(i, 1);
          continue;
        }

        const tailX = m.x - (m.vx / m.speed) * m.length;
        const tailY = m.y - (m.vy / m.speed) * m.length;

        const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${m.alpha})`);
        grad.addColorStop(0.3, `rgba(56, 189, 248, ${m.alpha * 0.8})`);
        grad.addColorStop(1, 'rgba(56, 189, 248, 0)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Glowing meteor head spark
        ctx.fillStyle = `rgba(255, 255, 255, ${m.alpha})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

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
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
      aria-hidden="true"
    />
  );
}
