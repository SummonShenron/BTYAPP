// src/components/SonicWidget.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Patchy, { PatchyStatus } from './Patchy';
import './__styles__/SonicWidget.css';

// Statuses the embedded chat app can send to drive Patchy's animations.
// The chat iframe posts: { source: 'sonic-assistant', patchyStatus: '<status>' }
const VALID_STATUSES: PatchyStatus[] = [
  'idle',
  'thinking',
  'streaming',
  'done',
  'error',
];

const RESOLVED_DWELL_MS = 3000;

export default function SonicWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [patchyStatus, setPatchyStatus] = useState<PatchyStatus>('idle');
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean trailing slash if present
  const baseSonicUrl = (import.meta.env.VITE_SONIC_ASSISTANT_URL || 'http://127.0.0.1:8080').replace(/\/$/, '');

  // Put query parameters BEFORE the hash router path
  const sonicAppUrl = `${baseSonicUrl}/#/chat?mode=embed&theme=bty&affiliate=Affiliate_D`;

  const scheduleReturnToIdle = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => setPatchyStatus('idle'), RESOLVED_DWELL_MS);
  }, []);

  useEffect(() => {
    const allowedOrigin = new URL(baseSonicUrl).origin;

    const handleMessage = (event: MessageEvent) => {
      // Only trust messages from the assistant app (works cross-origin in prod)
      if (event.origin !== allowedOrigin) return;
      const data = event.data;
      if (!data || data.source !== 'sonic-assistant') return;
      if (!VALID_STATUSES.includes(data.patchyStatus)) return;

      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }

      if (data.patchyStatus === 'done') {
        // Show the celebration briefly, then settle back to idle
        setPatchyStatus('done');
        scheduleReturnToIdle();
      } else {
        setPatchyStatus(data.patchyStatus);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [baseSonicUrl, scheduleReturnToIdle]);

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
            title="Patchy Assistant"
            className="sonic-widget-iframe"
          />
        </div>
      )}

      {/* Toggle: "Ask" pill when closed, mini Patchy when open */}
      {isOpen ? (
        <button
          onClick={() => setIsOpen(false)}
          aria-label="Close Patchy, Madison’s Assistant"
          className="sonic-widget-toggle patchy-widget-toggle patchy-open"
        >
          <Patchy status={patchyStatus} />
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open Patchy, Madison’s Assistant"
          className="sonic-widget-toggle"
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Ask
        </button>
      )}
    </div>
  );
}