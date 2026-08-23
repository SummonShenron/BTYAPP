// src/components/FlipRevealCarousel.tsx
// Full-bleed photo carousel where a grid of tiles individually 3D-flips to
// reveal the next photo already sitting behind it — no cover color, no delay,
// like an airport split-flap board built out of photographs.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './__styles__/FlipRevealCarousel.css';

export type FlipRevealItem = {
  image: string;
  title?: string;
  alt?: string;
};

type FlipRevealCarouselProps = {
  items: FlipRevealItem[];
  columns?: number;
  rows?: number;
  // seconds a single tile takes to flip
  flipDuration?: number;
  // total extra seconds spread across the diagonal wave of tiles
  stagger?: number;
  autoPlay?: boolean;
  className?: string;
};

export default function FlipRevealCarousel({
  items,
  columns = 6,
  rows = 9,
  flipDuration = 2.2,
  stagger = 2.6,
  autoPlay = true,
  className = '',
}: FlipRevealCarouselProps) {
  const safeColumns = Math.max(1, Math.round(columns));
  const safeRows = Math.max(1, Math.round(rows));
  const maxDistance = safeColumns - 1 + (safeRows - 1);
  const delayUnit = maxDistance > 0 ? stagger / maxDistance : 0;
  const totalDurationMs = (flipDuration + stagger) * 835;

  // Two persistent 3D "faces" per tile hold image indices; only the face
  // currently facing away from the viewer is ever re-targeted, so a tile
  // never appears to pop mid-flip.
  const [layerAIndex, setLayerAIndex] = useState(0);
  const [layerBIndex, setLayerBIndex] = useState(items.length > 1 ? 1 : 0);
  const [displayIndex, setDisplayIndex] = useState(0);
  // Rotation toggles between 0deg/180deg (never accumulates), so each flip
  // reverses direction from the last — forward, then back, then forward.
  const [flipped, setFlipped] = useState(false);
  const flippedRef = useRef(false);

  const triggerFlip = useCallback(
    (targetIndex: number) => {
      if (items.length < 2) return;
      const normalized = ((targetIndex % items.length) + items.length) % items.length;
      if (normalized === displayIndex) return;

      const aIsFrontNow = !flippedRef.current;
      if (aIsFrontNow) {
        setLayerBIndex(normalized);
      } else {
        setLayerAIndex(normalized);
      }

      setDisplayIndex(normalized);
      flippedRef.current = !flippedRef.current;
      setFlipped(flippedRef.current);
    },
    [items.length, displayIndex]
  );

  useEffect(() => {
    if (!autoPlay || items.length < 2) return;
    // Single wave at a time: wait for this flip to fully finish before the
    // next one begins.
    const id = setTimeout(() => {
      triggerFlip(displayIndex + 1);
    }, totalDurationMs);
    return () => clearTimeout(id);
  }, [autoPlay, totalDurationMs, items.length, displayIndex, triggerFlip]);

  const aIsFront = !flipped;
  const angleA = flipped ? 180 : 0;
  const angleB = flipped ? 0 : 180;

  const tiles = useMemo(() => {
    const list: { row: number; col: number; distance: number }[] = [];
    for (let row = 0; row < safeRows; row += 1) {
      for (let col = 0; col < safeColumns; col += 1) {
        list.push({ row, col, distance: row + col });
      }
    }
    return list;
  }, [safeRows, safeColumns]);

  if (items.length === 0) {
    return null;
  }

  const current = items[displayIndex];
  const layerAItem = items[layerAIndex] ?? items[0];
  const layerBItem = items[layerBIndex] ?? items[0];

  const tileImageStyle = (row: number, col: number): React.CSSProperties => ({
    position: 'absolute',
    width: `${safeColumns * 100}%`,
    height: `${safeRows * 100}%`,
    left: `-${col * 100}%`,
    top: `-${row * 100}%`,
    objectFit: 'cover',
    display: 'block',
    maxWidth: 'none',
  });

  return (
    <div
      className={`flip-reveal-carousel${className ? ` ${className}` : ''}`}
      style={{ '--flip-duration': `${flipDuration}s` } as React.CSSProperties}
    >
      <div
        className="flip-reveal-grid"
        style={{
          gridTemplateColumns: `repeat(${safeColumns}, 1fr)`,
          gridTemplateRows: `repeat(${safeRows}, 1fr)`,
        }}
      >
        {tiles.map(({ row, col, distance }) => {
          // Forward (flipped=true) sweeps top-left → bottom-right; the return
          // trip (flipped=false) reverses so it sweeps bottom-right → top-left.
          const delay = (flipped ? distance : maxDistance - distance) * delayUnit;
          return (
          <div className="flip-reveal-tile" key={`${row}-${col}`} style={{ transitionDelay: `${delay}s` }}>
            <div className="flip-reveal-stage">
              <div
                className="flip-reveal-face"
                style={{ transform: `rotateY(${angleA}deg)`, transitionDelay: `${delay}s` }}
              >
                <img src={layerAItem.image} alt={aIsFront ? layerAItem.alt ?? layerAItem.title ?? '' : ''} style={tileImageStyle(row, col)} />
              </div>
              <div
                className="flip-reveal-face"
                style={{ transform: `rotateY(${angleB}deg)`, transitionDelay: `${delay}s` }}
              >
                <img src={layerBItem.image} alt={!aIsFront ? layerBItem.alt ?? layerBItem.title ?? '' : ''} style={tileImageStyle(row, col)} />
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {current?.title && (
        <div className="flip-reveal-caption">
          <span>{current.title}</span>
        </div>
      )}

      {items.length > 1 && (
        <div className="flip-reveal-controls">
          <button type="button" className="flip-reveal-arrow" onClick={() => triggerFlip(displayIndex - 1)} aria-label="Previous photo">
            ‹
          </button>
          <div className="flip-reveal-dots">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`flip-reveal-dot${i === displayIndex ? ' active' : ''}`}
                onClick={() => triggerFlip(i)}
                aria-label={`Go to photo ${i + 1}`}
              />
            ))}
          </div>
          <button type="button" className="flip-reveal-arrow" onClick={() => triggerFlip(displayIndex + 1)} aria-label="Next photo">
            ›
          </button>
        </div>
      )}
    </div>
  );
}
