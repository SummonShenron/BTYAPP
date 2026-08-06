// components/Hero.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import './__styles__/hero.css';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero-section">
      <div className="hero-container">
        
        {/* Left Column: Headline & Action */}
        <div className="hero-content">
          <span className="hero-badge">BTY Fitness Training</span>
          
          <h1 className="hero-title">
            BETTER THAN <br />
            <span className="accent-text">YESTERDAY</span>
          </h1>

          <p className="hero-subtitle">
            Custom personal training and strength conditioning tailored directly to your biomechanics with Madison Spear.
          </p>

          <div className="hero-actions">
            <button 
              onClick={() => navigate('/consultation')}
              className="btn-neon-primary"
            >
              Book Free Consultation
            </button>
            
            {/* Updated button to navigate to /programs */}
            <button 
              onClick={() => navigate('/programs')}
              className="btn-neon-outline"
            >
              Explore Programs
            </button>
          </div>
        </div>

        {/* Right Sidebar Widget Panel */}
        <aside className="hero-sidebar">
          
          {/* Action/Featured Photo Card */}
          <div className="hero-sidebar-card">
            <div className="sidebar-image-slot">
              <img src={logo} alt="BTY Fitness Logo" className="sidebar-logo" />
            </div>

            <div className="sidebar-card-content">
              <div className="sidebar-status-tag">
                <span className="status-dot"></span> Accepting New Clients
              </div>
              <h3 className="sidebar-card-title">1-on-1 & Hybrid Coaching</h3>
              <p className="sidebar-card-text">
                Direct biomechanics assessment & custom fitness planning.
              </p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="sidebar-stats-row">
            <div className="mini-stat-card">
              <span className="mini-stat-number">100%</span>
              <span className="mini-stat-label">Tailored Protocols</span>
            </div>
            <div className="mini-stat-card">
              <span className="mini-stat-number">Weekly</span>
              <span className="mini-stat-label">Form & Check-ins</span>
            </div>
          </div>

        </aside>

      </div>
    </section>
  );
}