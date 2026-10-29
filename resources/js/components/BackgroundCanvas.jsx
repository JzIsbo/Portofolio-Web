import React, { useEffect, useRef } from 'react';

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

    // Generate random stars (optimized count on mobile for high FPS & battery efficiency)
    const numStars = Math.min(Math.floor((width * height) / 14000), isMobile ? 35 : 85);
    const stars = Array.from({ length: numStars }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.4 + 0.6,
      alpha: Math.random() * 0.7 + 0.2,
      speed: Math.random() * 0.012 + 0.005,
      color: Math.random() > 0.4 ? '#38bdf8' : '#a855f7',
    }));

    let animId;
    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle stars with twinkle
      for (let star of stars) {
        star.alpha += Math.sin(angle * star.speed * 80) * 0.004;
        const currentAlpha = Math.max(0.1, Math.min(0.9, star.alpha));

        ctx.fillStyle = star.color;
        ctx.globalAlpha = currentAlpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
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
      className="fixed inset-0 pointer-events-none z-0 opacity-60"
      aria-hidden="true"
    />
  );
}
