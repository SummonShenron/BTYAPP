import React, { useEffect, useRef, useState } from 'react';
import './__styles__/DriftWall.css';

export type DriftWallItem = {
  image: string;
  title: string;
  href?: string;
};

type DriftWallProps = {
  items: DriftWallItem[];
  columns?: number;
  tileWidth?: number;
  tileHeight?: number;
  gap?: number;
  tilt?: number;
  turn?: number;
  perspective?: number;
  depth?: number;
  speed?: number;
  direction?: 'up' | 'down';
  variance?: number;
  parallax?: number;
  // Extra parallax multiplier applied to alternating (2nd, 4th, ...) columns.
  // 1 = no extra effect; higher = those columns respond more to pointer movement.
  altColumnParallax?: number;
  lift?: number;
  fade?: number;
  dim?: number;
  overlayColor?: string;
  radius?: number;
  // Optional message shown as an overlay when the wall is hovered.
  ctaMessage?: string;
  // Optional link the hover CTA card navigates to when clicked.
  ctaHref?: string;
};

export default function DriftWall({
  items,
  columns = 2,
  tileWidth = 172,
  tileHeight = 220,
  gap = 16,
  tilt = 16,
  turn = -14,
  perspective = 1200,
  depth = 120,
  speed = 42,
  direction = 'up',
  variance = 0.4,
  parallax = 0.6,
  altColumnParallax = 1,
  lift = 64,
  fade = 0.75,
  dim = 0.7,
  overlayColor = '#060010',
  radius = 12,
  ctaMessage,
  ctaHref,
}: DriftWallProps) {
  const wallRef = useRef<HTMLDivElement>(null);
  const [expandedItem, setExpandedItem] = useState<DriftWallItem | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const columnCount = Math.max(1, Math.round(columns));
  const columnItems = Array.from({ length: columnCount }, (_, columnIndex) =>
    items.filter((_, itemIndex) => itemIndex % columnCount === columnIndex)
  );
  const longestColumn = Math.max(1, ...columnItems.map((column) => column.length));
  const cycleHeight = longestColumn * (tileHeight + gap);
  const duration = Math.max(8, cycleHeight / Math.max(speed, 1));
  const wallStyle = {
    '--drift-columns': columnCount,
    '--drift-tile-width': `${tileWidth}px`,
    '--drift-tile-height': `${tileHeight}px`,
    '--drift-gap': `${gap}px`,
    '--drift-tilt': `${tilt}deg`,
    '--drift-turn': `${turn}deg`,
    '--drift-perspective': `${perspective}px`,
    '--drift-depth': `${depth}px`,
    '--drift-duration': `${duration}s`,
    '--drift-parallax': parallax,
    '--drift-lift': `${lift}px`,
    '--drift-fade': fade,
    '--drift-fade-size': `${18 + Math.min(Math.max(fade, 0), 1) * 24}%`,
    '--drift-dim': dim,
    '--drift-overlay': overlayColor,
    '--drift-radius': `${radius}px`,
  } as React.CSSProperties;

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const pointerX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const pointerY = (event.clientY - bounds.top) / bounds.height - 0.5;
    wallRef.current?.style.setProperty('--drift-pointer-x', pointerX.toFixed(3));
    wallRef.current?.style.setProperty('--drift-pointer-y', pointerY.toFixed(3));
  };

  const openItem = (item: DriftWallItem, target: HTMLElement) => {
    const wallBounds = wallRef.current?.getBoundingClientRect();
    const tileBounds = target.getBoundingClientRect();
    if (wallBounds) {
      const originX = ((tileBounds.left + tileBounds.width / 2 - wallBounds.left) / wallBounds.width) * 100;
      const originY = ((tileBounds.top + tileBounds.height / 2 - wallBounds.top) / wallBounds.height) * 100;
      wallRef.current?.style.setProperty('--drift-expand-origin-x', `${originX}%`);
      wallRef.current?.style.setProperty('--drift-expand-origin-y', `${originY}%`);
    }
    setIsClosing(false);
    setExpandedItem(item);
  };

  const closeExpandedItem = () => setIsClosing(true);

  useEffect(() => {
    if (!isClosing) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setExpandedItem(null);
      setIsClosing(false);
    }, 360);

    return () => window.clearTimeout(timeoutId);
  }, [isClosing]);

  useEffect(() => {
    if (!expandedItem) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeExpandedItem();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [expandedItem]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      ref={wallRef}
      className={`drift-wall${expandedItem ? ' is-expanded' : ''}${ctaMessage ? ' has-cta' : ''}`}
      style={wallStyle}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        wallRef.current?.style.setProperty('--drift-pointer-x', '0');
        wallRef.current?.style.setProperty('--drift-pointer-y', '0');
      }}
      aria-label="BTY training photo wall"
    >
      <div className="drift-wall-plane">
        {columnItems.map((column, columnIndex) => {
          const repeatedItems = [...column, ...column, ...column];
          const columnDuration = duration * (1 + ((columnIndex % 2 === 0 ? -1 : 1) * variance * 0.18));
          // Alternating columns (2nd, 4th, ...) get a boosted parallax response.
          const columnParallax = columnIndex % 2 === 1 ? altColumnParallax : 1;

          return (
            <div
              className={`drift-wall-column drift-wall-column--${direction}`}
              style={{
                '--drift-column-duration': `${columnDuration}s`,
                '--drift-column-delay': `${-columnIndex * duration * variance * 0.35}s`,
                '--drift-column-parallax': columnParallax,
              } as React.CSSProperties}
              aria-hidden={columnIndex > 0 ? undefined : false}
              key={columnIndex}
            >
              {repeatedItems.map((item, repeatedIndex) => {
                const content = (
                  <>
                    <img src={item.image} alt={repeatedIndex < column.length ? item.title : ''} loading="lazy" />
                    <span>{item.title}</span>
                  </>
                );

                return item.href ? (
                  <a
                    className="drift-wall-tile"
                    href={item.href}
                    tabIndex={repeatedIndex < column.length ? 0 : -1}
                    key={`${item.image}-${repeatedIndex}`}
                  >
                    {content}
                  </a>
                ) : (
                  <button
                    type="button"
                    className="drift-wall-tile"
                    onClick={(event) => openItem(item, event.currentTarget)}
                    aria-label={`Expand ${item.title}`}
                    key={`${item.image}-${repeatedIndex}`}
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {expandedItem && (
        <div
          className={`drift-wall-expanded${isClosing ? ' is-closing' : ''}`}
          onClick={closeExpandedItem}
          role="presentation"
        >
          <div
            className="drift-wall-expanded-media"
            role="dialog"
            aria-modal="true"
            aria-label={expandedItem.title}
            onClick={(event) => event.stopPropagation()}
          >
            <img src={expandedItem.image} alt={expandedItem.title} />
            <span>{expandedItem.title}</span>
            <button type="button" onClick={closeExpandedItem} aria-label="Close expanded image">
              &times;
            </button>
          </div>
        </div>
      )}

      {ctaMessage && (
        <div className="drift-wall-cta">
          {ctaHref ? (
            <a href={ctaHref} className="drift-wall-cta-card drift-wall-cta-link">
              <span className="drift-wall-cta-text">{ctaMessage}</span>
            </a>
          ) : (
            <div className="drift-wall-cta-card" aria-hidden="true">
              <span className="drift-wall-cta-text">{ctaMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}