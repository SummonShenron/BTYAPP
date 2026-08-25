import React, { useEffect, useState, useRef } from "react";
import '../components/__styles__/FlipRevealCarousel.css';

interface CarouselItem {
  image: string;
  title?: string;
}

interface LightningRevealCarouselProps {
  items: CarouselItem[];
  autoPlay?: boolean;
  interval?: number;
  duration?: number;
}

export default function LightningRevealCarousel({
  items,
  autoPlay = true,
  interval = 4500,
  duration = 1000,
}: LightningRevealCarouselProps) {
  const [index, setIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [animating, setAnimating] = useState(false);

  const timeoutRef = useRef<number | null>(null);

  const triggerNext = () => {
    if (animating) return;

    const incomingIndex = (index + 1) % items.length;
    setNextIndex(incomingIndex);
    setAnimating(true);

    setTimeout(() => {
      setIndex(incomingIndex);
      setAnimating(false);
    }, duration);
  };

  useEffect(() => {
    if (!autoPlay || animating) return;

    timeoutRef.current = window.setTimeout(triggerNext, interval);

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [index, animating, autoPlay, interval]);

  const currentItem = items[index];
  const nextItem = items[nextIndex];

  return (
    <div className="lightning-carousel-container">
      {/* Base Current Image */}
      <div
        className="lightning-layer current-layer"
        style={{ backgroundImage: `url(${currentItem.image})` }}
      />

      {animating && (
        <>
          {/* Phase 2: Incoming Image Expands Outward from Cut */}
          <div
            className="lightning-layer next-layer"
            style={{
              backgroundImage: `url(${nextItem.image})`,
              animationDuration: `${duration}ms`,
            }}
          />

          {/* Glowing Cyan Seam - Top Edge */}
          <svg
            className="lightning-edge-svg edge-top"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ animationDuration: `${duration}ms` }}
          >
            <path
              className="lightning-edge-path"
              d="M 115 -10 L 82 22 L 72 18 L 48 56 L 35 52 L -15 110"
            />
          </svg>

          {/* Glowing Cyan Seam - Bottom Edge */}
          <svg
            className="lightning-edge-svg edge-bottom"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ animationDuration: `${duration}ms` }}
          >
            <path
              className="lightning-edge-path"
              d="M 115 -10 L 82 22 L 72 18 L 48 56 L 35 52 L -15 110"
            />
          </svg>

          {/* Phase 1: Jagged Lightning Crack Draw */}
          <svg
            className="lightning-svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ animationDuration: `${duration}ms` }}
          >
            <path
              className="lightning-path"
              d="M 115 -10 L 82 22 L 72 18 L 48 56 L 35 52 L -15 110"
              style={{ animationDuration: `${duration}ms` }}
            />
          </svg>
        </>
      )}

      {currentItem.title && (
        <div className="lightning-carousel-copy">
          <h2 className="banner-title">{currentItem.title}</h2>
        </div>
      )}
    </div>
  );
}