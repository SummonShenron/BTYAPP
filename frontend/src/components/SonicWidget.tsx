// src/components/SonicWidget.tsx
import React, { useState } from 'react';
import logo from '../assets/logo.png';

export default function SonicWidget() {
  const [isOpen, setIsOpen] = useState(false);

  // Clean trailing slash if present
  const baseSonicUrl = (import.meta.env.VITE_SONIC_ASSISTANT_URL || 'http://127.0.0.1:8080').replace(/\/$/, '');

  // Put query parameters BEFORE the hash router path
  const sonicAppUrl = `${baseSonicUrl}/#/chat?mode=embed&theme=bty&affiliate=Affiliate_D`;
  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, fontFamily: 'inherit' }}>
      {/* Chat Drawer Window */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          bottom: '75px',
          right: '0',
          width: '380px',
          height: '550px',
          background: '#16171b',
          border: '1px solid rgba(56, 194, 222, 0.3)',
          borderRadius: '20px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeInUp 0.3s ease-out'
        }}>
          {/* Widget Header */}
          <div style={{
            background: '#121316',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38C2DE', boxShadow: '0 0 10px #38C2DE' }}></span>
              <h3 style={{ color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 800, margin: 0 }}>Sonic Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#A0A5AA',
                fontSize: '1.2rem',
                cursor: 'pointer',
                fontWeight: 700,
                padding: '0 0.25rem'
              }}
            >
              &times;
            </button>
          </div>

          {/* Iframe Embedding Your RAG App */}
          <iframe
            src={sonicAppUrl}
            title="Sonic Assistant"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: '#121316'
            }}
          />
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close Madi’s Assistant' : 'Open Madi’s Assistant'}
        style={{
            background: '#38C2DE',
            color: '#000000',
            border: 'none',
            borderRadius: '50px',
            padding: '0.85rem 1.2rem',
            fontWeight: 900,
            fontSize: '0.82rem',
            cursor: 'pointer',
            boxShadow: '0 0 25px rgba(56, 194, 222, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
        {isOpen ? 'Close' : "Ask"}
        </button>
    </div>
  );
}