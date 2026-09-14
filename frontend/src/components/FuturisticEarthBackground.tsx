import React, { useEffect, useRef } from 'react';

export const FuturisticEarthBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    window.addEventListener('resize', handleResize);

    interface ShiningStar {
      x: number;
      y: number;
      size: number;
      baseAlpha: number;
      twinkleSpeed: number;
      twinklePhase: number;
      vx: number;
      vy: number;
      color: string;
      glowColor: string;
      isSparkle: boolean; // special 4-point cross shining star
      sparkleAngle: number;
      sparkleRotSpeed: number;
    }

    let stars: ShiningStar[] = [];

    const starPalettes = [
      { rgb: '255, 255, 255', glow: 'rgba(255, 255, 255, 0.8)' },    // Pure white diamond
      { rgb: '240, 246, 255', glow: 'rgba(224, 242, 254, 0.7)' },    // Crisp ice white
      { rgb: '192, 132, 252', glow: 'rgba(192, 132, 252, 0.75)' },   // Soft cosmic purple
      { rgb: '56, 189, 248', glow: 'rgba(56, 189, 248, 0.75)' },     // Vibrant sky blue
      { rgb: '147, 197, 253', glow: 'rgba(147, 197, 253, 0.65)' },   // Gentle blue
    ];

    const initStars = () => {
      // Density: around 160-220 stars depending on screen width
      const count = Math.min(220, Math.max(120, Math.floor((width * height) / 8500)));
      stars = [];

      for (let i = 0; i < count; i++) {
        const palette = starPalettes[Math.floor(Math.random() * starPalettes.length)];
        const isSparkle = Math.random() < 0.18; // ~18% are distinct 4-point shining stars

        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: isSparkle ? Math.random() * 1.6 + 1.2 : Math.random() * 1.5 + 0.5,
          baseAlpha: Math.random() * 0.45 + 0.25,
          twinkleSpeed: Math.random() * 0.025 + 0.012,
          twinklePhase: Math.random() * Math.PI * 2,
          vx: (Math.random() - 0.5) * 0.16, // Gentle, smooth drift
          vy: (Math.random() - 0.5) * 0.14 - 0.03, // Slight floating drift
          color: palette.rgb,
          glowColor: palette.glow,
          isSparkle,
          sparkleAngle: Math.random() * Math.PI,
          sparkleRotSpeed: (Math.random() - 0.5) * 0.006,
        });
      }
    };

    initStars();

    let time = 0;

    const render = () => {
      time++;
      ctx.clearRect(0, 0, width, height);

      // Render each shining star particle
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        // Smooth gentle movement
        s.x += s.vx;
        s.y += s.vy;
        s.sparkleAngle += s.sparkleRotSpeed;

        // Wrap around viewport edges smoothly
        if (s.x < -10) s.x = width + 10;
        if (s.x > width + 10) s.x = -10;
        if (s.y < -10) s.y = height + 10;
        if (s.y > height + 10) s.y = -10;

        // Gentle sinusoidal twinkling brightness
        const twinkle = Math.sin(time * s.twinkleSpeed + s.twinklePhase);
        const currentAlpha = Math.max(0.08, Math.min(1.0, s.baseAlpha + twinkle * 0.35));

        ctx.save();

        if (s.isSparkle && currentAlpha > 0.4) {
          // 4-Point Shining Star Diamond Glint
          ctx.translate(s.x, s.y);
          ctx.rotate(s.sparkleAngle);

          const spikeLength = s.size * (2.8 + twinkle * 1.5);
          const spikeWidth = s.size * 0.6;

          ctx.shadowBlur = 8 + twinkle * 4;
          ctx.shadowColor = s.glowColor;

          ctx.fillStyle = `rgba(${s.color}, ${currentAlpha.toFixed(3)})`;

          // Horizontal spike
          ctx.beginPath();
          ctx.moveTo(-spikeLength, 0);
          ctx.quadraticCurveTo(0, -spikeWidth, 0, -spikeLength);
          ctx.quadraticCurveTo(0, -spikeWidth, spikeLength, 0);
          ctx.quadraticCurveTo(0, spikeWidth, 0, spikeLength);
          ctx.quadraticCurveTo(0, spikeWidth, -spikeLength, 0);
          ctx.fill();

          // Core bright center dot
          ctx.beginPath();
          ctx.arc(0, 0, s.size * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${(currentAlpha * 1.1).toFixed(2)})`;
          ctx.fill();
        } else {
          // Standard soft shining particle with gentle radial glow
          ctx.shadowBlur = currentAlpha > 0.5 ? 6 : 2;
          ctx.shadowColor = s.glowColor;
          ctx.fillStyle = `rgba(${s.color}, ${currentAlpha.toFixed(3)})`;

          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        display: 'block',
      }}
    />
  );
};
