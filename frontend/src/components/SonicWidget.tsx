// src/components/SonicWidget.tsx
import React, { useState } from 'react';
import logo from '../assets/logo.png';
import './__styles__/SonicWidget.css';

export default function SonicWidget() {
  const [isOpen, setIsOpen] = useState(false);

  // Clean trailing slash if present
  const baseSonicUrl = (import.meta.env.VITE_SONIC_ASSISTANT_URL || 'http://127.0.0.1:8080').replace(/\/$/, '');

  // Put query parameters BEFORE the hash router path
  const sonicAppUrl = `${baseSonicUrl}/#/chat?mode=embed&theme=bty&affiliate=Affiliate_D`;
  return (
    <div className="sonic-widget-root">
      {/* Chat Drawer Window */}
      {isOpen && (
        <div className="sonic-widget-drawer">
          {/* Widget Header */}
          <div className="sonic-widget-header">
            <div className="sonic-widget-title-row">
              <span className="sonic-widget-status-dot"></span>
              <h3 className="sonic-widget-title">Madison's Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="sonic-widget-close"
            >
              &times;
            </button>
          </div>

          {/* Iframe Embedding Your RAG App */}
          <iframe
            src={sonicAppUrl}
            title="Sonic Assistant"
            className="sonic-widget-iframe"
          />
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close Madi’s Assistant' : 'Open Madi’s Assistant'}
        className="sonic-widget-toggle"
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isOpen ? 'Close' : "Ask"}
      </button>
    </div>
  );
}