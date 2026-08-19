import React, { useState } from 'react';
import './__styles__/AccordionGallery.css';

export type AccordionGalleryItem = {
  image: string;
  label: string;
  alt?: string;
  link?: string;
};

type AccordionGalleryProps = {
  items: AccordionGalleryItem[];
  defaultIndex?: number;
  expandRatio?: number;
  trigger?: 'hover' | 'click';
};

export default function AccordionGallery({
  items,
  defaultIndex = 0,
  expandRatio = 0.52,
  trigger = 'hover',
}: AccordionGalleryProps) {
  const initialIndex = Math.min(Math.max(defaultIndex, 0), Math.max(items.length - 1, 0));
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const activeRatio = Math.min(Math.max(expandRatio, 0.35), 0.8);
  const collapsedRatio = items.length > 1 ? (1 - activeRatio) / (items.length - 1) : 1;

  return (
    <div
      className="accordion-gallery"
      aria-label="Madison and BTY Fitness gallery"
      onPointerLeave={trigger === 'hover' ? () => setActiveIndex(initialIndex) : undefined}
    >
      {items.map((item, index) => {
        const isActive = index === activeIndex;
        const panelStyle = {
          flexGrow: isActive ? activeRatio : collapsedRatio,
        };
        const panelContent = (
          <>
            <img src={item.image} alt={item.alt ?? item.label} loading="lazy" />
            <span className="accordion-gallery-shade" aria-hidden="true" />
            <span className="accordion-gallery-label">{item.label}</span>
          </>
        );
        const sharedProps = {
          className: `accordion-gallery-panel${isActive ? ' is-active' : ''}`,
          style: panelStyle,
          onPointerEnter: trigger === 'hover' ? () => setActiveIndex(index) : undefined,
          onFocus: () => setActiveIndex(index),
          onClick: () => setActiveIndex(index),
          'aria-label': `View ${item.label}`,
        };

        return item.link ? (
          <a {...sharedProps} href={item.link} key={item.label}>
            {panelContent}
          </a>
        ) : (
          <button {...sharedProps} type="button" key={item.label}>
            {panelContent}
          </button>
        );
      })}
    </div>
  );
}