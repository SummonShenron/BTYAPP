import React, { useEffect, useRef, useState } from 'react';
import './__styles__/PixelTransition.css';

type PixelTransitionProps = {
  firstContent: React.ReactNode;
  secondContent: React.ReactNode;
  gridSize?: number;
  pixelColor?: string;
  once?: boolean;
  animationStepDuration?: number;
  className?: string;
};

export default function PixelTransition({
  firstContent,
  secondContent,
  gridSize = 12,
  pixelColor = '#ffffff',
  once = false,
  animationStepDuration = 0.4,
  className = '',
}: PixelTransitionProps) {
  const [showSecondContent, setShowSecondContent] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'reverse' | null>(null);
  const timersRef = useRef<number[]>([]);
  const showingSecondRef = useRef(false);
  const transitionDirectionRef = useRef<'forward' | 'reverse' | null>(null);
  const desiredSecondRef = useRef(false);
  const safeGridSize = Math.max(2, Math.round(gridSize));
  const pixelCount = safeGridSize * safeGridSize;
  const duration = Math.max(0.1, animationStepDuration);
  const maxDistance = (safeGridSize - 1) * 2;
  const stagger = duration * 0.055;
  const maxDelay = maxDistance * stagger;
  const coverDuration = duration + maxDelay;
  const totalDuration = coverDuration * 2;

  useEffect(() => {
    return () => timersRef.current.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const runTransition = (revealSecondContent: boolean) => {
    desiredSecondRef.current = revealSecondContent;
    if (transitionDirectionRef.current || revealSecondContent === showingSecondRef.current) {
      return;
    }

    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    const direction = revealSecondContent ? 'forward' : 'reverse';
    transitionDirectionRef.current = direction;
    setTransitionDirection(direction);

    timersRef.current = [
      window.setTimeout(() => {
        showingSecondRef.current = revealSecondContent;
        setShowSecondContent(revealSecondContent);
      }, coverDuration * 1000),
      window.setTimeout(() => {
        transitionDirectionRef.current = null;
        setTransitionDirection(null);
        if (desiredSecondRef.current !== showingSecondRef.current) {
          runTransition(desiredSecondRef.current);
        }
      }, totalDuration * 1000),
    ];
  };

  const transitionStyle = {
    '--pixel-grid-size': safeGridSize,
    '--pixel-color': pixelColor,
    '--pixel-duration': `${duration}s`,
    '--pixel-cover-duration': `${coverDuration}s`,
  } as React.CSSProperties;

  return (
    <div
      className={`pixel-transition${showSecondContent ? ' is-showing-second' : ''}${transitionDirection ? ` is-transitioning-${transitionDirection}` : ''}${className ? ` ${className}` : ''}`}
      style={transitionStyle}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') {
          runTransition(true);
        }
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse' && !once) {
          runTransition(false);
        }
      }}
      onClick={() => runTransition(!desiredSecondRef.current)}
    >
      <div className="pixel-transition-content pixel-transition-first" aria-hidden={showSecondContent}>
        {firstContent}
      </div>
      <div className="pixel-transition-content pixel-transition-second" aria-hidden={!showSecondContent}>
        {secondContent}
      </div>
      <div className="pixel-transition-grid" aria-hidden="true">
        {Array.from({ length: pixelCount }, (_, index) => {
          const row = Math.floor(index / safeGridSize);
          const column = index % safeGridSize;
          const distance = row + column;

          return (
            <span
              style={{
                '--pixel-delay': `${distance * stagger}s`,
                '--pixel-reverse-delay': `${(maxDistance - distance) * stagger}s`,
              } as React.CSSProperties}
              key={index}
            />
          );
        })}
      </div>
    </div>
  );
}