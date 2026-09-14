import React, { useEffect, useRef } from 'react';

export const CyberCosmicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    // --- 1. Ambient Floating Star / Node Particles ---
    interface NodeParticle {
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
      hasHalo: boolean;
    }

    let particles: NodeParticle[] = [];

    const initParticles = () => {
      const count = Math.min(90, Math.max(45, Math.floor((width * height) / 14000)));
      particles = [];
      for (let i = 0; i < count; i++) {
        const isCyan = Math.random() > 0.4;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height * 0.85,
          size: Math.random() * 2.2 + 0.8,
          baseAlpha: Math.random() * 0.45 + 0.25,
          twinkleSpeed: Math.random() * 0.02 + 0.01,
          twinklePhase: Math.random() * Math.PI * 2,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.14 - 0.02,
          color: isCyan ? '56, 189, 248' : '192, 132, 252',
          glowColor: isCyan ? 'rgba(56, 189, 248, 0.8)' : 'rgba(192, 132, 252, 0.8)',
          hasHalo: Math.random() < 0.22,
        });
      }
    };

    initParticles();

    // --- 2. Digital Earth Grid Nodes (Spherical Coordinates) ---
    interface GlobeNode {
      lat: number;
      lon: number;
      size: number;
      isHighlighted: boolean;
    }

    const globeNodes: GlobeNode[] = [];
    const nodeCount = 220;
    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / nodeCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
      globeNodes.push({
        lat: phi - Math.PI / 2,
        lon: theta,
        size: Math.random() * 1.5 + 0.7,
        isHighlighted: Math.random() < 0.15,
      });
    }

    // --- 3. Architecture Topology Graph Nodes (Lower-Left) ---
    interface ArchNode {
      id: string;
      label: string;
      icon: string;
      relX: number; // relative to left corner
      relY: number;
    }

    const archNodes: ArchNode[] = [
      { id: 'web', label: 'Website', icon: '🌐', relX: 45, relY: 60 },
      { id: 'srv', label: 'Server', icon: '🖥️', relX: 145, relY: 60 },
      { id: 'ssl', label: 'SSL', icon: '🔒', relX: 45, relY: 135 },
      { id: 'api', label: 'API', icon: '</>', relX: 115, relY: 135 },
      { id: 'db', label: 'Database', icon: '🗄️', relX: 185, relY: 135 },
      { id: 'ai', label: 'AI Analysis', icon: '🧠', relX: 115, relY: 205 },
    ];

    const archLinks = [
      { from: 'web', to: 'srv' },
      { from: 'web', to: 'ssl' },
      { from: 'srv', to: 'api' },
      { from: 'ssl', to: 'api' },
      { from: 'api', to: 'db' },
      { from: 'ssl', to: 'ai' },
      { from: 'api', to: 'ai' },
      { from: 'db', to: 'ai' },
    ];

    // Data packets travelling along architecture links
    const packets = archLinks.map((link, idx) => ({
      link,
      progress: (idx * 0.14) % 1,
      speed: 0.005 + (idx % 3) * 0.0015,
    }));

    let time = 0;
    let globeRotation = 0;

    const render = () => {
      time++;
      globeRotation += 0.0022;

      ctx.clearRect(0, 0, width, height);

      const isMobile = width < 768;

      // =========================================================================
      // LAYER 1: Deep Cosmic Nebula Atmospheric Glows (Matches Image Palette)
      // =========================================================================
      // Top Center Purple Nebula Haze behind header
      const topNebula = ctx.createRadialGradient(
        width * 0.5,
        height * 0.18,
        50,
        width * 0.5,
        height * 0.18,
        width * 0.55
      );
      topNebula.addColorStop(0, 'rgba(147, 51, 234, 0.11)');
      topNebula.addColorStop(0.4, 'rgba(99, 102, 241, 0.06)');
      topNebula.addColorStop(1, 'transparent');
      ctx.fillStyle = topNebula;
      ctx.fillRect(0, 0, width, height);

      // Lower-Right Blue Ambient Glow for Globe
      const globeX = isMobile ? width * 0.92 : Math.min(width - 40, width * 0.88);
      const globeY = isMobile ? height * 0.72 : Math.min(height * 0.78, 760);
      const globeRadius = Math.min(width * 0.22, 210);

      const globeAmbient = ctx.createRadialGradient(
        globeX,
        globeY,
        globeRadius * 0.4,
        globeX,
        globeY,
        globeRadius * 2.2
      );
      globeAmbient.addColorStop(0, 'rgba(56, 189, 248, 0.14)');
      globeAmbient.addColorStop(0.4, 'rgba(99, 102, 241, 0.08)');
      globeAmbient.addColorStop(0.8, 'rgba(168, 85, 247, 0.03)');
      globeAmbient.addColorStop(1, 'transparent');
      ctx.fillStyle = globeAmbient;
      ctx.beginPath();
      ctx.arc(globeX, globeY, globeRadius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Lower-Left Soft Blue Haze for Architecture Blueprint
      const leftHaze = ctx.createRadialGradient(
        width * 0.12,
        height * 0.75,
        30,
        width * 0.12,
        height * 0.75,
        350
      );
      leftHaze.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
      leftHaze.addColorStop(0.5, 'rgba(147, 51, 234, 0.04)');
      leftHaze.addColorStop(1, 'transparent');
      ctx.fillStyle = leftHaze;
      ctx.beginPath();
      ctx.arc(width * 0.12, height * 0.75, 350, 0, Math.PI * 2);
      ctx.fill();

      // =========================================================================
      // LAYER 2: 3D Perspective Cyber Horizon Grid (Bottom of Image)
      // =========================================================================
      const horizonY = isMobile ? height * 0.84 : Math.min(height * 0.82, 820);
      const gridBottomY = Math.min(height, horizonY + 280);

      // Faint glowing horizon curved arc
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 1.6;
      ctx.shadowBlur = 16;
      ctx.shadowColor = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(0, horizonY + 20);
      ctx.quadraticCurveTo(width * 0.5, horizonY - 12, width, horizonY + 20);
      ctx.stroke();
      ctx.restore();

      // Perspective Grid Lines
      const vanishingX = width * 0.5;
      const vanishingY = horizonY - 40;

      // Longitudinal Lines fanning outward
      const longLinesCount = isMobile ? 14 : 26;
      ctx.lineWidth = 0.8;
      for (let i = 0; i <= longLinesCount; i++) {
        const bottomX = (width / longLinesCount) * i;
        ctx.strokeStyle = `rgba(56, 189, 248, ${(0.08 + Math.abs(i - longLinesCount / 2) * 0.008).toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(vanishingX, vanishingY);
        ctx.lineTo(bottomX, gridBottomY + 120);
        ctx.stroke();
      }

      // Transverse horizontal grid lines moving smoothly towards viewer
      const transCount = 10;
      const scrollOffset = (time * 0.35) % 35;

      for (let j = 0; j < transCount; j++) {
        const factor = Math.pow((j * 35 + scrollOffset) / (transCount * 35), 2.2);
        const yLine = horizonY + factor * (gridBottomY - horizonY);

        if (yLine >= horizonY && yLine <= gridBottomY) {
          const alpha = Math.min(0.26, factor * 0.35);
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 0.6 + factor * 0.8;

          ctx.beginPath();
          ctx.moveTo(0, yLine + 20 * (1 - factor));
          ctx.quadraticCurveTo(width * 0.5, yLine - 10 * (1 - factor), width, yLine + 20 * (1 - factor));
          ctx.stroke();
        }
      }

      // =========================================================================
      // LAYER 3: Flowing Ethereal Cyber Waves / Light Streams (Across Background)
      // =========================================================================
      const drawWave = (
        baseY: number,
        amplitude: number,
        freq: number,
        speed: number,
        color: string,
        lineW: number,
        dash: number[] = []
      ) => {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineW;
        if (dash.length) ctx.setLineDash(dash);

        ctx.beginPath();
        for (let x = 0; x <= width; x += 18) {
          const y =
            baseY +
            Math.sin(x * freq + time * speed) * amplitude +
            Math.cos(x * freq * 0.5 - time * speed * 0.6) * (amplitude * 0.4);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      };

      // Wave 1: Cyan High Energy Wave
      drawWave(
        height * 0.44,
        isMobile ? 25 : 45,
        0.0028,
        0.012,
        'rgba(56, 189, 248, 0.16)',
        1.2
      );

      // Wave 2: Cosmic Purple Ribbon
      drawWave(
        height * 0.48,
        isMobile ? 30 : 55,
        0.0022,
        -0.009,
        'rgba(192, 132, 252, 0.14)',
        1.4
      );

      // Wave 3: Flowing Dashed Fiber Stream
      drawWave(
        height * 0.53,
        isMobile ? 22 : 38,
        0.0035,
        0.018,
        'rgba(56, 189, 248, 0.12)',
        1.0,
        [6, 12]
      );

      // Wave 4: Deep Electric Indigo Under-Wave
      drawWave(
        height * 0.58,
        isMobile ? 20 : 35,
        0.0018,
        0.007,
        'rgba(99, 102, 241, 0.1)',
        1.2
      );

      // =========================================================================
      // LAYER 4: Digital Glowing Earth Globe (Lower-Right)
      // =========================================================================
      // Globe Outer Glow
      ctx.save();
      const globeGlow = ctx.createRadialGradient(
        globeX,
        globeY,
        globeRadius * 0.88,
        globeX,
        globeY,
        globeRadius * 1.35
      );
      globeGlow.addColorStop(0, 'rgba(56, 189, 248, 0.28)');
      globeGlow.addColorStop(0.5, 'rgba(147, 51, 234, 0.14)');
      globeGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = globeGlow;
      ctx.beginPath();
      ctx.arc(globeX, globeY, globeRadius * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // Globe Disc Silhouette with 3D shadow
      const sphereGrad = ctx.createRadialGradient(
        globeX - globeRadius * 0.35,
        globeY - globeRadius * 0.35,
        globeRadius * 0.15,
        globeX,
        globeY,
        globeRadius
      );
      sphereGrad.addColorStop(0, 'rgba(10, 20, 38, 0.85)');
      sphereGrad.addColorStop(0.7, 'rgba(5, 10, 22, 0.95)');
      sphereGrad.addColorStop(1, 'rgba(2, 5, 14, 0.98)');

      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(globeX, globeY, globeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Globe Rim Ring
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 1.4;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#38bdf8';
      ctx.beginPath();
      ctx.arc(globeX, globeY, globeRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Clip inside globe for wireframe & matrix nodes
      ctx.save();
      ctx.beginPath();
      ctx.arc(globeX, globeY, globeRadius - 1, 0, Math.PI * 2);
      ctx.clip();

      // Latitude circles
      const lats = [-60, -40, -20, 0, 20, 40, 60];
      for (const latDeg of lats) {
        const latRad = (latDeg * Math.PI) / 180;
        const yOff = Math.sin(latRad) * globeRadius * 0.9;
        const rPar = Math.cos(latRad) * globeRadius;

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.ellipse(globeX, globeY + yOff, rPar, rPar * 0.25, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Rotating Longitude Meridians
      for (let m = 0; m < 7; m++) {
        const lonAngle = (m * Math.PI) / 7 + globeRotation;
        const cosLon = Math.cos(lonAngle);
        const isFront = Math.sin(lonAngle) >= 0;

        ctx.strokeStyle = isFront ? 'rgba(56, 189, 248, 0.16)' : 'rgba(56, 189, 248, 0.05)';
        ctx.lineWidth = isFront ? 1.0 : 0.6;
        ctx.beginPath();
        ctx.ellipse(globeX, globeY, Math.abs(cosLon) * globeRadius, globeRadius, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Rotating Digital Continental / Matrix Points
      for (let i = 0; i < globeNodes.length; i++) {
        const node = globeNodes[i];
        const rotLon = node.lon + globeRotation;
        const x3d = Math.cos(node.lat) * Math.sin(rotLon);
        const y3d = -Math.sin(node.lat);
        const z3d = Math.cos(node.lat) * Math.cos(rotLon);

        if (z3d > -0.1) {
          const px = globeX + x3d * globeRadius;
          const py = globeY + y3d * globeRadius * 0.96;
          const depth = Math.max(0.1, z3d);

          ctx.fillStyle = node.isHighlighted
            ? `rgba(56, 189, 248, ${(0.9 * depth).toFixed(2)})`
            : `rgba(192, 132, 252, ${(0.6 * depth).toFixed(2)})`;

          ctx.beginPath();
          ctx.arc(px, py, node.size * (0.6 + depth * 0.5), 0, Math.PI * 2);
          ctx.fill();

          // Connect nearby front nodes into cyber mesh
          if (i % 6 === 0 && z3d > 0.3) {
            const nextNode = globeNodes[(i + 1) % globeNodes.length];
            const nRotLon = nextNode.lon + globeRotation;
            const nx3d = Math.cos(nextNode.lat) * Math.sin(nRotLon);
            const ny3d = -Math.sin(nextNode.lat);

            ctx.strokeStyle = `rgba(56, 189, 248, ${(0.18 * depth).toFixed(3)})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(globeX + nx3d * globeRadius, globeY + ny3d * globeRadius * 0.96);
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      // Flowing Orbit Rings wrapping around Digital Earth
      const globeOrbits = [
        { rx: globeRadius * 1.35, ry: globeRadius * 0.45, tilt: -0.35, color: 'rgba(56, 189, 248, 0.22)' },
        { rx: globeRadius * 1.6, ry: globeRadius * 0.52, tilt: 0.42, color: 'rgba(192, 132, 252, 0.18)' },
      ];

      for (let oIdx = 0; oIdx < globeOrbits.length; oIdx++) {
        const orb = globeOrbits[oIdx];
        ctx.save();
        ctx.translate(globeX, globeY);
        ctx.rotate(orb.tilt);
        ctx.strokeStyle = orb.color;
        ctx.lineWidth = 1.0;
        ctx.setLineDash([8, 16]);
        ctx.lineDashOffset = -time * 0.4;
        ctx.beginPath();
        ctx.ellipse(0, 0, orb.rx, orb.ry, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Orbiting light particle
        const theta = (time * 0.006 + oIdx * Math.PI) % (Math.PI * 2);
        const pX = Math.cos(theta) * orb.rx;
        const pY = Math.sin(theta) * orb.ry;

        ctx.shadowBlur = 10;
        ctx.shadowColor = oIdx === 0 ? '#38bdf8' : '#c084fc';
        ctx.fillStyle = oIdx === 0 ? '#38bdf8' : '#c084fc';
        ctx.beginPath();
        ctx.arc(pX, pY, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // =========================================================================
      // LAYER 5: Cybersecurity Architecture Blueprint Topology (Lower-Left)
      // =========================================================================
      // In the image, on the lower-left, there's a neat blueprint schematic:
      // Website -> Server -> API -> Database -> AI Analysis with dashed links and data packets!
      const archOriginX = isMobile ? 12 : Math.max(20, width * 0.04);
      const archOriginY = isMobile ? height * 0.72 : Math.min(height * 0.68, 680);

      // Draw dashed connecting lines
      ctx.save();
      ctx.setLineDash([4, 6]);
      ctx.lineWidth = 1.0;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';

      archLinks.forEach((link) => {
        const fromNode = archNodes.find((n) => n.id === link.from);
        const toNode = archNodes.find((n) => n.id === link.to);
        if (fromNode && toNode) {
          ctx.beginPath();
          ctx.moveTo(archOriginX + fromNode.relX, archOriginY + fromNode.relY);
          ctx.lineTo(archOriginX + toNode.relX, archOriginY + toNode.relY);
          ctx.stroke();
        }
      });
      ctx.restore();

      // Draw moving data packet pulses along the architecture lines
      packets.forEach((pkt) => {
        pkt.progress = (pkt.progress + pkt.speed) % 1;
        const fromNode = archNodes.find((n) => n.id === pkt.link.from);
        const toNode = archNodes.find((n) => n.id === pkt.link.to);
        if (fromNode && toNode) {
          const startX = archOriginX + fromNode.relX;
          const startY = archOriginY + fromNode.relY;
          const endX = archOriginX + toNode.relX;
          const endY = archOriginY + toNode.relY;

          const currX = startX + (endX - startX) * pkt.progress;
          const currY = startY + (endY - startY) * pkt.progress;

          ctx.save();
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#38bdf8';
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(currX, currY, 2.0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      // Draw the blueprint node boxes (clean vector boxes with icon & label)
      archNodes.forEach((node) => {
        const nx = archOriginX + node.relX;
        const ny = archOriginY + node.relY;
        const boxW = 34;
        const boxH = 34;

        ctx.save();
        // Subtle rounded node frame
        ctx.fillStyle = 'rgba(10, 16, 32, 0.72)';
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.38)';
        ctx.lineWidth = 1.0;

        ctx.beginPath();
        ctx.roundRect(nx - boxW / 2, ny - boxH / 2, boxW, boxH, 6);
        ctx.fill();
        ctx.stroke();

        // Icon inside node
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.icon, nx, ny);

        // Text label below node
        ctx.font = '10px "Inter", sans-serif';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.85)';
        ctx.fillText(node.label, nx, ny + boxH / 2 + 11);
        ctx.restore();
      });

      // =========================================================================
      // LAYER 6: Drifting Glowing Particles & Stars
      // =========================================================================
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const alpha = Math.max(
          0.08,
          p.baseAlpha + Math.sin(time * p.twinkleSpeed + p.twinklePhase) * 0.35
        );

        ctx.save();
        if (p.hasHalo && alpha > 0.4) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.glowColor;
        }

        ctx.fillStyle = `rgba(${p.color}, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
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
