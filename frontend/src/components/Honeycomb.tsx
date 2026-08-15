import React, { useEffect, useRef } from 'react';

interface StaticHexGridProps {
  cellSize?: number;
  color?: string;
  opacity?: number;
  maskRadius?: number;
}

export default function StaticHexGrid({
  cellSize = 20,
  color = '#4FD4EE',
  opacity = 0.08,
  maskRadius = 160,
}: StaticHexGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const dpr = window.devicePixelRatio || 1;
      const width = parent.clientWidth;
      const height = parent.clientHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      ctx.clearRect(0, 0, width, height);

      const cleanHex = color.replace('#', '');
      const r = parseInt(cleanHex.substring(0, 2), 16);
      const g = parseInt(cleanHex.substring(2, 4), 16);
      const b = parseInt(cleanHex.substring(4, 6), 16);

      // 1. Draw Static Ambient Hex Grid
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
      ctx.lineWidth = 1;

      const hexRadius = cellSize;
      const hexWidth = Math.sqrt(3) * hexRadius;
      const rowStep = 1.5 * hexRadius;
      const cols = Math.ceil(width / hexWidth) + 2;
      const rows = Math.ceil(height / rowStep) + 2;

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
      ctx.stroke();

      // 2. Erase Center Exclusion Zone
      if (maskRadius > 0) {
        ctx.globalCompositeOperation = 'destination-out';
        const centerX = width / 2;
        const centerY = height / 2;

        const eraseGrad = ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          maskRadius
        );

        eraseGrad.addColorStop(0, 'rgba(0,0,0,1)');
        eraseGrad.addColorStop(0.6, 'rgba(0,0,0,1)');
        eraseGrad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = eraseGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, maskRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalCompositeOperation = 'source-over';
      }
    };

    render();
    window.addEventListener('resize', render);
    return () => window.removeEventListener('resize', render);
  }, [cellSize, color, opacity, maskRadius]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
}