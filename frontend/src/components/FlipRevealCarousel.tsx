import React, { useEffect, useState, useRef } from "react";
import '../components/__styles__/FlipRevealCarousel.css';

interface CarouselItem {
  image: string;
  title?: string;
  kicker?: string;
}

interface DiagonalSweepCarouselProps {
  items: CarouselItem[];
  autoPlay?: boolean;
  interval?: number;
  duration?: number; // Animation duration in ms
}

export default function DiagonalSweepCarousel({
  items,
  autoPlay = true,
  interval = 4500,
  duration = 850,
}: DiagonalSweepCarouselProps) {
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
    <div className="diagonal-carousel-container">
      {/* BASE LAYER: Current Image */}
      <div
        className="diagonal-layer current-layer"
        style={{ backgroundImage: `url(${currentItem.image})` }}
      />

      {/* REVEAL LAYERS: Triggered on transition */}
      {animating && (
        <>
          {/* Incoming Image Layer */}
          <div
            className="diagonal-layer next-layer"
            style={{
              backgroundImage: `url(${nextItem.image})`,
              animationDuration: `${duration}ms`,
            }}
          />

          {/* Leading Blue Edge Accent Bar */}
          <div
            className="diagonal-accent-stripe"
            style={{ animationDuration: `${duration}ms` }}
          />
        </>
      )}

      {/* Copy / Overlay Text */}
      <div className="diagonal-carousel-copy">
        {currentItem.kicker && (
          <span className="banner-kicker">{currentItem.kicker}</span>
        )}
        {currentItem.title && (
          <h2 className="banner-title">{currentItem.title}</h2>
        )}
      </div>
    </div>
  );
}