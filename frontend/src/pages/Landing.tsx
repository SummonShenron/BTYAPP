import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import AmbientGrid from '../components/AmbientGrid';
import './__styles__/Landing.css';

export default function Landing() {
  return (
    <div className="landing-shell">
      {/* Animated ambient background grid */}
      <AmbientGrid 
        cellSize={20} 
        color="#4FD4EE" 
        spawnInterval={600} 
        maxActive={6} 
        
      />

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

        <div className="landing-location-bar">
          Personal Training in Des Moines, IA • Trainer&apos;s Edge Gym • 3845 100th St, Urbandale, IA 50322 • (515) 509-3623
        </div>
      </section>
    </div>
  );
}