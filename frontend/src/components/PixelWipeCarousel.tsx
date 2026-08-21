// src/components/PixelWipeCarousel.tsx
// Full-bleed image carousel with a pixel-tile wipe transition between slides.
import React, { useEffect, useRef, useState, useCallback } from 'react';
import './__styles__/PixelWipeCarousel.css';

export type PixelWipeItem = {
  image: string;
  label?: string;
  alt?: string;
};

type PixelWipeCarouselProps = {
  items: PixelWipeItem[];
  gridSize?: number;
  pixelColor?: string;
  // ms each slide stays visible before wiping to the next
  interval?: number;
  // seconds per tile's cover/uncover animation
  animationStepDuration?: number;
  autoPlay?: boolean;
  // optional logo shown centered on the tile backdrop during the wipe
  logoSrc?: string;
  className?: string;
};

export default function PixelWipeCarousel({
  items,
  gridSize = 10,
  pixelColor = '#38C2DE',
  interval = 5000,
  animationStepDuration = 0.3,
  autoPlay = true,
  logoSrc,
  className = '',
}: PixelWipeCarouselProps) {
  const [index, setIndex] = useState(0);
  const [isWiping, setIsWiping] = useState(false);
  const [isCovered, setIsCovered] = useState(false);
  const timersRef = useRef<number[]>([]);
  const pendingRef = useRef<number | null>(null);
  const indexRef = useRef(0);

  const safeGridSize = Math.max(2, Math.round(gridSize));
  const pixelCount = safeGridSize * safeGridSize;
  const duration = Math.max(0.1, animationStepDuration);
  const maxDistance = (safeGridSize - 1) * 2;
  const stagger = duration * 0.04;
  const maxDelay = maxDistance * stagger;
  const coverDuration = duration + maxDelay;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const goTo = useCallback(
    (nextIndex: number) => {
      if (items.length < 2) return;
      const target = ((nextIndex % items.length) + items.length) % items.length;
      if (target === indexRef.current || isWiping) return;

      clearTimers();
      setIsWiping(true);
      setIsCovered(false);
      pendingRef.current = target;

      // Logo fades in partway through the cover phase (once tiles are mostly
      // covering) and hides the instant the uncover phase begins.
      const logoShowAt = coverDuration * 0.55 * 1000;
      const coverMidpoint = coverDuration * 1000;

      timersRef.current = [
        window.setTimeout(() => {
          setIsCovered(true);
        }, logoShowAt),
        window.setTimeout(() => {
          setIsCovered(false);
          if (pendingRef.current !== null) {
            indexRef.current = pendingRef.current;
            setIndex(pendingRef.current);
            pendingRef.current = null;
          }
        }, coverMidpoint),
        window.setTimeout(() => {
          setIsWiping(false);
        }, coverDuration * 2 * 1000),
      ];
    },
    [items.length, isWiping, coverDuration, clearTimers]
  );

  // Auto-advance
  useEffect(() => {
    if (!autoPlay || items.length < 2) return;
    const id = window.setInterval(() => {
      if (!isWiping) goTo(indexRef.current + 1);
    }, interval);
    return () => window.clearInterval(id);
  }, [autoPlay, interval, items.length, isWiping, goTo]);

  const current = items[index];
  const style = {
    '--wipe-grid-size': safeGridSize,
    '--wipe-color': pixelColor,
    '--wipe-duration': `${duration}s`,
    '--wipe-cover-duration': `${coverDuration}s`,
  } as React.CSSProperties;

  return (
    <div className={`pixel-wipe-carousel${className ? ` ${className}` : ''}`} style={style}>
      {/* Slides */}
      {items.map((item, i) => (
        <div
          key={item.image}
          className={`pixel-wipe-slide${i === index ? ' is-active' : ''}`}
          aria-hidden={i !== index}
        >
          <img src={item.image} alt={item.alt ?? item.label ?? ''} />
        </div>
      ))}

      {/* Pixel wipe overlay */}
      <div className={`pixel-wipe-grid${isWiping ? ' is-wiping' : ''}`} aria-hidden="true">
        {Array.from({ length: pixelCount }, (_, i) => {
          const row = Math.floor(i / safeGridSize);
          const column = i % safeGridSize;
          const distance = row + column;
          return (
            <span
              key={i}
              style={{
                '--wipe-delay': `${distance * stagger}s`,
                '--wipe-reverse-delay': `${(maxDistance - distance) * stagger}s`,
              } as React.CSSProperties}
            />
          );
        })}
      </div>

      {/* Logo rides the wipe backdrop — visible only while tiles fully cover */}
      {logoSrc && (
        <div className={`pixel-wipe-logo${isCovered ? ' is-visible' : ''}`} aria-hidden="true">
          <img src={logoSrc} alt="" />
        </div>
      )}

      {/* Caption */}
      {current?.label && (
        <div className="pixel-wipe-caption">
          <span>{current.label}</span>
        </div>
      )}

      {/* Controls */}
      {items.length > 1 && (
        <div className="pixel-wipe-controls">
          <button
            type="button"
            className="pixel-wipe-arrow"
            onClick={() => goTo(index - 1)}
            aria-label="Previous photo"
          >
            ‹
          </button>
          <div className="pixel-wipe-dots">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`pixel-wipe-dot${i === index ? ' active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Go to photo ${i + 1}`}
              />
            ))}
          </div>
          <button
            type="button"
            className="pixel-wipe-arrow"
            onClick={() => goTo(index + 1)}
            aria-label="Next photo"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
