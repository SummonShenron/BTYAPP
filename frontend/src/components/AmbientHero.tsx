import React, { useEffect, useRef } from 'react';

interface TypingBlipGridProps {
  cellSize?: number;
  color?: string;
  baseGridOpacity?: number;
  maskRadius?: number;
}

interface HexBlip {
  col: number;
  row: number;
  createdAt: number;
  fadeIn: number;
  hold: number;
  fadeOut: number;
}

export default function TypingBlipGrid({
  cellSize = 20,
  color = '#4FD4EE',
  baseGridOpacity = 0.05,
  maskRadius = 180,
}: TypingBlipGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let blips: HexBlip[] = [];

    let nextSpawnTime = 0;
    let keysLeftInWord = 0;
    let currentGridPos = { col: 0, row: 0 };

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;

      // 1. Set internal buffer size
      canvas.width = w * dpr;
      canvas.height = h * dpr;

      // 2. Set explicit CSS dimensions to prevent browser stretching
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      // 3. Reset transform matrix before scaling
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const hexToRgb = (hex: string) => {
      const cleanHex = hex.replace('#', '');
      return {
        r: parseInt(cleanHex.substring(0, 2), 16),
        g: parseInt(cleanHex.substring(2, 4), 16),
        b: parseInt(cleanHex.substring(4, 6), 16),
      };
    };

    const { r, g, b } = hexToRgb(color);

    const drawSingleHex = (centerX: number, centerY: number, radius: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i + Math.PI / 6;
        const hx = centerX + radius * Math.cos(angle);
        const hy = centerY + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
    };

    const render = (time: number) => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      const hexRadius = cellSize;
      const hexWidth = Math.sqrt(3) * hexRadius;
      const rowStep = 1.5 * hexRadius;
      const cols = Math.ceil(width / hexWidth) + 2;
      const rows = Math.ceil(height / rowStep) + 2;

      // 1. TYPING CADENCE
      if (time >= nextSpawnTime) {
        if (keysLeftInWord <= 0) {
          currentGridPos = {
            col: Math.floor(Math.random() * (cols - 2)),
            row: Math.floor(Math.random() * (rows - 2)),
          };
          keysLeftInWord = Math.floor(Math.random() * 4) + 3;
          nextSpawnTime = time + Math.floor(Math.random() * 250) + 200;
        } else {
          currentGridPos.col = Math.max(0, Math.min(cols - 1, currentGridPos.col + (Math.floor(Math.random() * 3) - 1)));
          currentGridPos.row = Math.max(0, Math.min(rows - 1, currentGridPos.row + (Math.floor(Math.random() * 3) - 1)));

          blips.push({
            col: currentGridPos.col,
            row: currentGridPos.row,
            createdAt: time,
            fadeIn: 140,
            hold: 60,
            fadeOut: 280,
          });

          keysLeftInWord--;
          nextSpawnTime = time + Math.floor(Math.random() * 50) + 50;
        }
      }

      blips = blips.filter((p) => time - p.createdAt < p.fadeIn + p.hold + p.fadeOut);

      ctx.clearRect(0, 0, width, height);

      // 2. DRAW BASE GRID
      if (baseGridOpacity > 0) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${baseGridOpacity})`;
        ctx.lineWidth = 1;
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
      }

      // 3. RENDER BLIPS
      if (blips.length > 0) {
        ctx.globalCompositeOperation = 'lighter';

        blips.forEach((blip) => {
          const age = time - blip.createdAt;

          let alpha = 0;
          if (age < blip.fadeIn) {
            alpha = age / blip.fadeIn;
          } else if (age < blip.fadeIn + blip.hold) {
            alpha = 1;
          } else {
            const fadeAge = age - (blip.fadeIn + blip.hold);
            alpha = 1 - fadeAge / blip.fadeOut;
          }

          alpha = Math.max(0, Math.min(1, alpha));

          const xOffset = blip.row % 2 !== 0 ? hexWidth / 2 : 0;
          const keyX = blip.col * hexWidth + xOffset;
          const keyY = blip.row * rowStep;

          drawSingleHex(keyX, keyY, hexRadius);
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.65})`;
          ctx.lineWidth = 1.3;
          ctx.stroke();
        });
      }

      // 4. DYNAMIC LOGO EXCLUSION MASK
        if (maskRadius > 0) {
        const banner = document.querySelector('.bty-hero-banner');
        if (banner) {
            const rect = banner.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            ctx.globalCompositeOperation = 'destination-out';

            const eraseGrad = ctx.createRadialGradient(
            centerX,
            centerY,
            0,
            centerX,
            centerY,
            maskRadius
            );

            eraseGrad.addColorStop(0, 'rgba(0,0,0,1)');
            eraseGrad.addColorStop(0.5, 'rgba(0,0,0,1)');
            eraseGrad.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.fillStyle = eraseGrad;
            ctx.beginPath();
            ctx.arc(centerX, centerY, maskRadius, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalCompositeOperation = 'source-over';
        }
        }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [cellSize, color, baseGridOpacity, maskRadius]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
      }}
    />
  );
}