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
            margin: '0 0 1rem',
            fontSize: '0.95rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#f5f7f8',
            textAlign: 'center',
            lineHeight: 1.4,
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
