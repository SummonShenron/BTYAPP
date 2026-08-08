import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import './__styles__/Landing.css';

export default function Landing() {
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
          src={logoImg}
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
