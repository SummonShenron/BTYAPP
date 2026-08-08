import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logoFallback from '../assets/logo.png';
import './__styles__/Landing.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8005';

export default function Landing() {
  const [landingLogoSrc, setLandingLogoSrc] = useState<string>(`${API_URL}/api/media/landing_logo?v=${Date.now()}`);

  return (
    <div className="landing-shell">
      <section className="landing-center">
        <h1
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            margin: '-1px',
            padding: 0,
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        >
          BTY Fitness Personal Training by Madison Spear
        </h1>

        <img
          src={landingLogoSrc}
          onError={() => {
            if (landingLogoSrc !== logoFallback) {
              setLandingLogoSrc(logoFallback);
            }
          }}
          alt="BTY Fitness"
          className="landing-logo"
        />

        <Link to="/home" className="landing-enter-btn">
          Enter
        </Link>
      </section>
    </div>
  );
}
