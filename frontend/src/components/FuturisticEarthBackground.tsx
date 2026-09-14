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

    // 1. Starfield Particles (Drifting & Gently Twinkling)
    interface Star {
      x: number;
      y: number;
      size: number;
      baseAlpha: number;
      twinkleSpeed: number;
      twinklePhase: number;
      vx: number;
      vy: number;
      color: string;
    }

    let stars: Star[] = [];
    const starColors = [
      '240, 246, 255', // Pure soft white/cyan
      '192, 132, 252', // Soft purple
      '56, 189, 248',  // Sky blue
      '224, 231, 255', // Ice blue
    ];

    const initStars = () => {
      const starCount = Math.floor((width * height) / 11000); // Proportional to screen size
      stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.6 + 0.5,
          baseAlpha: Math.random() * 0.55 + 0.15,
          twinkleSpeed: Math.random() * 0.02 + 0.008,
          twinklePhase: Math.random() * Math.PI * 2,
          vx: (Math.random() - 0.5) * 0.08,
          vy: (Math.random() - 0.5) * 0.06 - 0.02, // Gentle upward/ambient drift
          color: starColors[Math.floor(Math.random() * starColors.length)],
        });
      }
    };

    initStars();

    // 2. Digital Earth Surface Nodes (Spherical Coordinates)
    interface GlobeNode {
      lat: number;
      lon: number;
      size: number;
      color: string;
    }

    const globeNodes: GlobeNode[] = [];
    // Distribute surface cluster points to resemble digital continent networks
    for (let i = 0; i < 280; i++) {
      // Golden spiral distribution for uniform sphere sampling
      const phi = Math.acos(1 - (2 * (i + 0.5)) / 280);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
      const lat = phi - Math.PI / 2;
      const lon = theta;
      const isPurple = Math.random() > 0.45;
      globeNodes.push({
        lat,
        lon,
        size: Math.random() * 1.6 + 0.8,
        color: isPurple ? 'rgba(192, 132, 252, ' : 'rgba(56, 189, 248, ',
      });
    }

    // 3. Orbiting Data Satellites / Glowing Particles around globe
    interface OrbitParticle {
      orbitIndex: number;
      progress: number;
      speed: number;
      size: number;
      color: string;
    }

    const orbitParticles: OrbitParticle[] = [
      { orbitIndex: 0, progress: 0.1, speed: 0.004, size: 2.5, color: '#38bdf8' },
      { orbitIndex: 0, progress: 0.6, speed: 0.004, size: 2.0, color: '#c084fc' },
      { orbitIndex: 1, progress: 0.25, speed: -0.0035, size: 2.2, color: '#c084fc' },
      { orbitIndex: 1, progress: 0.75, speed: -0.0035, size: 2.8, color: '#38bdf8' },
      { orbitIndex: 2, progress: 0.4, speed: 0.003, size: 2.2, color: '#38bdf8' },
      { orbitIndex: 2, progress: 0.9, speed: 0.003, size: 1.8, color: '#a855f7' },
      { orbitIndex: 3, progress: 0.15, speed: -0.0028, size: 2.4, color: '#7dd3fc' },
      { orbitIndex: 3, progress: 0.65, speed: -0.0028, size: 2.0, color: '#c084fc' },
    ];

    let rotationAngle = 0;
    let time = 0;

    const render = () => {
      time++;
      rotationAngle += 0.0025; // Continuous subtle rotation

      ctx.clearRect(0, 0, width, height);

      // --- A. Render Twinkling Drifting Stars ---
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.x += star.vx;
        star.y += star.vy;

        // Wrap around bounds
        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        // Natural sinusoidal twinkle
        const alpha = Math.max(
          0.05,
          star.baseAlpha + Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.3
        );

        ctx.fillStyle = `rgba(${star.color}, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- B. Globe Coordinates & Placement ---
      // Positioned on the right / lower-right area as requested
      // Scales adaptively so on small devices it stays gracefully visible without blocking
      const globeRadius = Math.min(width * 0.22, height * 0.38, 280);
      const isMobile = width < 768;
      const globeCenterX = isMobile ? width * 0.78 : Math.max(width - globeRadius * 1.45, width * 0.72);
      const globeCenterY = isMobile ? height * 0.42 : Math.min(height * 0.52, 480);

      // --- C. Ambient Nebula Glow Behind Earth (Purple & Sky Blue) ---
      const ambientGlow = ctx.createRadialGradient(
        globeCenterX,
        globeCenterY,
        globeRadius * 0.3,
        globeCenterX,
        globeCenterY,
        globeRadius * 2.2
      );
      ambientGlow.addColorStop(0, 'rgba(56, 189, 248, 0.09)');
      ambientGlow.addColorStop(0.35, 'rgba(192, 132, 252, 0.07)');
      ambientGlow.addColorStop(0.7, 'rgba(99, 102, 241, 0.03)');
      ambientGlow.addColorStop(1, 'transparent');

      ctx.fillStyle = ambientGlow;
      ctx.beginPath();
      ctx.arc(globeCenterX, globeCenterY, globeRadius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Soft ambient light on the left side (distant, keeping center clean)
      const leftAmbient = ctx.createRadialGradient(
        width * 0.1,
        height * 0.25,
        50,
        width * 0.1,
        height * 0.25,
        450
      );
      leftAmbient.addColorStop(0, 'rgba(192, 132, 252, 0.04)');
      leftAmbient.addColorStop(1, 'transparent');
      ctx.fillStyle = leftAmbient;
      ctx.beginPath();
      ctx.arc(width * 0.1, height * 0.25, 450, 0, Math.PI * 2);
      ctx.fill();

      // --- D. Digital Earth Sphere Glow & Atmospheric Halo ---
      // Outer atmosphere halo
      const haloGrad = ctx.createRadialGradient(
        globeCenterX,
        globeCenterY,
        globeRadius * 0.95,
        globeCenterX,
        globeCenterY,
        globeRadius * 1.28
      );
      haloGrad.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
      haloGrad.addColorStop(0.4, 'rgba(192, 132, 252, 0.12)');
      haloGrad.addColorStop(0.8, 'rgba(147, 51, 234, 0.04)');
      haloGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(globeCenterX, globeCenterY, globeRadius * 1.28, 0, Math.PI * 2);
      ctx.fill();

      // Dark translucent globe disc (3D crescent shadow)
      const sphereBodyGrad = ctx.createRadialGradient(
        globeCenterX - globeRadius * 0.35,
        globeCenterY - globeRadius * 0.35,
        globeRadius * 0.1,
        globeCenterX,
        globeCenterY,
        globeRadius
      );
      sphereBodyGrad.addColorStop(0, 'rgba(14, 22, 40, 0.82)');
      sphereBodyGrad.addColorStop(0.65, 'rgba(8, 12, 22, 0.92)');
      sphereBodyGrad.addColorStop(1, 'rgba(5, 7, 14, 0.98)');

      ctx.fillStyle = sphereBodyGrad;
      ctx.beginPath();
      ctx.arc(globeCenterX, globeCenterY, globeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Subtle globe perimeter edge ring
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(globeCenterX, globeCenterY, globeRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner crescent illumination rim
      const rimGrad = ctx.createRadialGradient(
        globeCenterX - globeRadius * 0.3,
        globeCenterY - globeRadius * 0.3,
        globeRadius * 0.7,
        globeCenterX,
        globeCenterY,
        globeRadius
      );
      rimGrad.addColorStop(0, 'transparent');
      rimGrad.addColorStop(0.85, 'rgba(56, 189, 248, 0.08)');
      rimGrad.addColorStop(1, 'rgba(192, 132, 252, 0.22)');

      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(globeCenterX, globeCenterY, globeRadius - 1, 0, Math.PI * 2);
      ctx.fill();

      // --- E. Rotating Digital Meridians & Latitudes (Wireframe Grid) ---
      // Save context with circular clipping mask so grid doesn't bleed outside Earth
      ctx.save();
      ctx.beginPath();
      ctx.arc(globeCenterX, globeCenterY, globeRadius - 1, 0, Math.PI * 2);
      ctx.clip();

      // 1. Latitude parallels (fixed tilt)
      const latAngles = [-55, -35, -15, 0, 15, 35, 55];
      for (const latDeg of latAngles) {
        const latRad = (latDeg * Math.PI) / 180;
        const yOffset = Math.sin(latRad) * globeRadius * 0.88;
        const rParallel = Math.cos(latRad) * globeRadius;

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.ellipse(
          globeCenterX,
          globeCenterY + yOffset,
          rParallel,
          rParallel * 0.28,
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }

      // 2. Rotating Longitude Meridians
      // 8 meridians rotating around Y-axis
      const meridianCount = 8;
      for (let m = 0; m < meridianCount; m++) {
        const baseAngle = (m * Math.PI) / meridianCount;
        const currentLonAngle = baseAngle + rotationAngle;
        const cosLon = Math.cos(currentLonAngle);
        const isFront = Math.sin(currentLonAngle) >= 0;

        // Only draw or highlight front-facing lines with higher opacity
        const alpha = isFront ? 0.12 : 0.04;
        ctx.strokeStyle = m % 2 === 0 ? `rgba(192, 132, 252, ${alpha})` : `rgba(56, 189, 248, ${alpha})`;
        ctx.lineWidth = isFront ? 1.0 : 0.6;

        ctx.beginPath();
        ctx.ellipse(
          globeCenterX,
          globeCenterY,
          Math.abs(cosLon) * globeRadius,
          globeRadius,
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }

      // 3. Digital Continental Surface Points (Rotating 3D Nodes)
      for (let i = 0; i < globeNodes.length; i++) {
        const node = globeNodes[i];
        const rotLon = node.lon + rotationAngle;

        // 3D Cartesian coordinates on sphere
        const x3d = Math.cos(node.lat) * Math.sin(rotLon);
        const y3d = -Math.sin(node.lat);
        const z3d = Math.cos(node.lat) * Math.cos(rotLon);

        // Only render nodes on the visible front hemisphere (z3d > 0)
        if (z3d > -0.15) {
          const px = globeCenterX + x3d * globeRadius;
          const py = globeCenterY + y3d * globeRadius * 0.94; // slightly squashed for realistic obliquity

          // Depth-based lighting: brighter towards the front and top-left
          const depthFactor = Math.max(0.08, z3d);
          const alpha = depthFactor * 0.75;

          ctx.fillStyle = `${node.color}${alpha.toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(px, py, node.size * (0.65 + z3d * 0.45), 0, Math.PI * 2);
          ctx.fill();

          // Connect nearby front nodes with faint network lines (data mesh)
          if (i % 7 === 0 && z3d > 0.25) {
            const nextNode = globeNodes[(i + 1) % globeNodes.length];
            const nextRotLon = nextNode.lon + rotationAngle;
            const nextX3d = Math.cos(nextNode.lat) * Math.sin(nextRotLon);
            const nextY3d = -Math.sin(nextNode.lat);
            const nextZ3d = Math.cos(nextNode.lat) * Math.cos(nextRotLon);

            if (nextZ3d > 0.2) {
              const npx = globeCenterX + nextX3d * globeRadius;
              const npy = globeCenterY + nextY3d * globeRadius * 0.94;

              ctx.strokeStyle = `rgba(56, 189, 248, ${(0.14 * depthFactor).toFixed(3)})`;
              ctx.lineWidth = 0.7;
              ctx.beginPath();
              ctx.moveTo(px, py);
              ctx.lineTo(npx, npy);
              ctx.stroke();
            }
          }
        }
      }

      ctx.restore(); // End globe clipping

      // --- F. Faint Flowing Digital/Network Orbital Lines Around Earth ---
      // 4 Orbital Ellipses with different tilts & radii
      const orbits = [
        { rx: globeRadius * 1.35, ry: globeRadius * 0.42, tilt: -0.32, color: 'rgba(56, 189, 248, 0.16)' },
        { rx: globeRadius * 1.55, ry: globeRadius * 0.48, tilt: 0.45, color: 'rgba(192, 132, 252, 0.14)' },
        { rx: globeRadius * 1.78, ry: globeRadius * 0.38, tilt: -0.15, color: 'rgba(129, 140, 248, 0.12)' },
        { rx: globeRadius * 1.95, ry: globeRadius * 0.55, tilt: 0.25, color: 'rgba(56, 189, 248, 0.1)' },
      ];

      for (let oIdx = 0; oIdx < orbits.length; oIdx++) {
        const orb = orbits[oIdx];
        ctx.save();
        ctx.translate(globeCenterX, globeCenterY);
        ctx.rotate(orb.tilt);

        // Very faint dashed flowing line
        ctx.strokeStyle = orb.color;
        ctx.lineWidth = 1.0;
        ctx.setLineDash([8, 14]);
        ctx.lineDashOffset = -time * (0.35 + oIdx * 0.1);

        ctx.beginPath();
        ctx.ellipse(0, 0, orb.rx, orb.ry, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

      // --- G. Subtle Blue and Purple Light Particles Orbiting the Globe ---
      for (let pIdx = 0; pIdx < orbitParticles.length; pIdx++) {
        const p = orbitParticles[pIdx];
        p.progress += p.speed;
        if (p.progress > 1) p.progress -= 1;
        if (p.progress < 0) p.progress += 1;

        const orb = orbits[p.orbitIndex];
        const theta = p.progress * Math.PI * 2;

        // Position on unrotated ellipse
        const localX = Math.cos(theta) * orb.rx;
        const localY = Math.sin(theta) * orb.ry;

        // Apply orbit tilt rotation
        const cosT = Math.cos(orb.tilt);
        const sinT = Math.sin(orb.tilt);
        const worldX = globeCenterX + (localX * cosT - localY * sinT);
        const worldY = globeCenterY + (localX * sinT + localY * cosT);

        // Check if behind globe to fade particle
        const isBehind = Math.sin(theta) < 0 && Math.hypot(worldX - globeCenterX, worldY - globeCenterY) < globeRadius * 0.95;
        const pAlpha = isBehind ? 0.15 : 0.85;

        // Particle soft outer glow
        ctx.save();
        ctx.shadowBlur = isBehind ? 4 : 10;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = pAlpha;

        ctx.beginPath();
        ctx.arc(worldX, worldY, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Tiny trailing spark
        const prevTheta = theta - p.speed * 8;
        const prevLocalX = Math.cos(prevTheta) * orb.rx;
        const prevLocalY = Math.sin(prevTheta) * orb.ry;
        const prevWorldX = globeCenterX + (prevLocalX * cosT - prevLocalY * sinT);
        const prevWorldY = globeCenterY + (prevLocalX * sinT + prevLocalY * cosT);

        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size * 0.6;
        ctx.globalAlpha = pAlpha * 0.45;
        ctx.beginPath();
        ctx.moveTo(prevWorldX, prevWorldY);
        ctx.lineTo(worldX, worldY);
        ctx.stroke();

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
