import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import './__styles__/Landing.css';

export default function Landing() {
  return (
    <div className="landing-shell">
      <section className="landing-center">
        <img src={logo} alt="BTY Fitness" className="landing-logo" />

        <Link to="/home" className="landing-enter-btn">
          Enter
        </Link>
      </section>
    </div>
  );
}
