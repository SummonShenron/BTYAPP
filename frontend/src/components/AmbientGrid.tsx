import React, { useEffect, useRef } from 'react';

interface AmbientGridProps {
  cellSize?: number;
  color?: string;
  radius?: number;
  spawnInterval?: number;
  holdTime?: number;
  fadeDuration?: number;
  maxActive?: number;
  baseOpacity?: number;
  centerMaskRadius?: number;
  centerMaskRadiusX?: number; // Horizontal clear radius
  centerMaskRadiusY?: number; // Vertical clear radius (stretch for text)
}

interface LightPoint {
  x: number;
  y: number;
  createdAt: number;
  seed: number;
}

export default function AmbientGrid({
  cellSize = 20,
  color = '#4FD4EE',
  radius = 200,
  spawnInterval = 400,
  holdTime = 300,
  fadeDuration = 800,
  maxActive = 6,
  baseOpacity = 0.08,
  centerMaskRadius = 200,
  centerMaskRadiusX,
  centerMaskRadiusY,
}: AmbientGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastSpawn = 0;
    let lightPoints: LightPoint[] = [];

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = parent.clientWidth * dpr;
        canvas.height = parent.clientHeight * dpr;
        ctx.scale(dpr, dpr);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const totalLife = holdTime + fadeDuration;

    const hexToRgb = (hex: string) => {
      const cleanHex = hex.replace('#', '');
      const r = parseInt(cleanHex.substring(0, 2), 16);
      const g = parseInt(cleanHex.substring(2, 4), 16);
      const b = parseInt(cleanHex.substring(4, 6), 16);
      return { r, g, b };
    };

    const { r, g, b } = hexToRgb(color);

    const buildHexGridPath = (w: number, h: number, hexRadius: number) => {
      const hexWidth = Math.sqrt(3) * hexRadius;
      const rowStep = 1.5 * hexRadius;
      const cols = Math.ceil(w / hexWidth) + 2;
      const rows = Math.ceil(h / rowStep) + 2;

      ctx.beginPath();
      for (let row = -1; row < rows; row++) {
        const y = row * rowStep;
        const xOffset = row % 2 !== 0 ? hexWidth / 2 : 0;
        for (let col = -1; col < cols; col++) {
          const x = col * hexWidth + xOffset;
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i + Math.PI / 6;
            const hx = x + hexRadius * Math.cos(angle);
            const hy = y + hexRadius * Math.sin(angle);
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
        }
      }
    };

    const render = (time: number) => {
      const parent = canvas.parentElement;
      const width = parent?.clientWidth || canvas.width;
      const height = parent?.clientHeight || canvas.height;

      const hexRadius = cellSize;
      const hexWidth = Math.sqrt(3) * hexRadius;
      const rowStep = 1.5 * hexRadius;

      if (time - lastSpawn > spawnInterval && lightPoints.length < maxActive) {
        const cols = Math.ceil(width / hexWidth) + 1;
        const rows = Math.ceil(height / rowStep) + 1;
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);
        const xOffset = row % 2 !== 0 ? hexWidth / 2 : 0;
        const randomX = col * hexWidth + xOffset;
        const randomY = row * rowStep;

        lightPoints.push({
          x: randomX,
          y: randomY,
          createdAt: time,
          seed: Math.random() * 100,
        });
        lastSpawn = time;
      }

      lightPoints = lightPoints.filter((p) => time - p.createdAt < totalLife);

      ctx.clearRect(0, 0, width, height);

      // 1. Base ambient grid
      if (baseOpacity > 0) {
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${baseOpacity})`;
        ctx.lineWidth = 1;
        buildHexGridPath(width, height, hexRadius);
        ctx.stroke();
      }

      // 2. Dynamic light ripples
      ctx.globalCompositeOperation = 'lighter';

      lightPoints.forEach((point) => {
        const age = time - point.createdAt;
        const lifeProgress = age / totalLife;

        let alpha = 1;
        if (age < holdTime) {
          alpha = age / holdTime;
        } else {
          alpha = 1 - (age - holdTime) / fadeDuration;
        }

        const flutter = 0.8 + 0.2 * Math.sin(time * 0.018 + point.seed);
        const finalOpacity = Math.max(0, Math.min(1, alpha * flutter));
        const currentRadius = 20 + (radius - 20) * Math.pow(lifeProgress, 0.7);

        const grad = ctx.createRadialGradient(
          point.x,
          point.y,
          0,
          point.x,
          point.y,
          currentRadius
        );

        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${finalOpacity * 0.95})`);
        grad.addColorStop(
          Math.min(0.85, 0.2 + lifeProgress * 0.65),
          `rgba(${r}, ${g}, ${b}, ${finalOpacity * 0.6})`
        );
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.3;

        buildHexGridPath(width, height, hexRadius);
        ctx.stroke();
      });

      // 3. ERASE LOGO + TEXT ZONE (Elliptical Destination-Out)
      const maskX = centerMaskRadiusX ?? centerMaskRadius;
      const maskY = centerMaskRadiusY ?? centerMaskRadius;

      if (maskX > 0 && maskY > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';

        const centerX = width / 2;
        const centerY = height / 2 - height * 0.06;

        // Scale vertical Y axis relative to X to turn the radial gradient into an ellipse
        const scaleY = maskY / maskX;

        ctx.translate(centerX, centerY);
        ctx.scale(1, scaleY);

        const eraseGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, maskX);

        eraseGrad.addColorStop(0, 'rgba(0,0,0,1)');
        eraseGrad.addColorStop(0.55, 'rgba(0,0,0,0.95)');
        eraseGrad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = eraseGrad;
        ctx.beginPath();
        ctx.arc(0, 0, maskX, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      ctx.globalCompositeOperation = 'source-over';

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    cellSize,
    color,
    radius,
    spawnInterval,
    holdTime,
    fadeDuration,
    maxActive,
    baseOpacity,
    centerMaskRadius,
    centerMaskRadiusX,
    centerMaskRadiusY,
  ]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
}