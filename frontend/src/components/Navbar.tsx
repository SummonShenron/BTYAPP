// components/Navbar.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './__styles__/Navbar.css';

const toggleTheme = () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'day' ? 'dark' : 'day';
  if (newTheme === 'day') {
    document.documentElement.setAttribute('data-theme', 'day');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
};

export default function Navbar() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleBookSession = () => {
    navigate('/book');
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        
        {/* Brand Logo */}
        <Link to="/home" className="nav-brand">
          <span className="brand-title">BTY FITNESS</span>
          <span className="brand-subtitle">by Madison Spear</span>
        </Link>

        {/* Links */}
        <ul className="nav-links">
          <li>
            <Link to="/home" className="nav-link">Home</Link>
          </li>
          <li>
            <Link to="/programs" className="nav-link">Programs</Link>
          </li>
          <li>
            <Link to="/consultation" className="nav-link">Consultation</Link>
          </li>
          <li>
            <Link to="/merch" className="nav-link">Merch</Link>
          </li>
          <li>
            <Link to="/about" className="nav-link">About</Link>
          </li>
          <li>
            <Link to="/qualifications" className="nav-link">Qualifications</Link>
          </li>
          <li>
            <Link to="/testimonials" className="nav-link">Testimonials</Link>
          </li>
        </ul>

        <div className="nav-actions">
          {/* CTA Button */}
          <button onClick={handleBookSession} className="nav-cta-btn nav-cta-desktop">
            Book Session
          </button>

          <button
            type="button"
            className="nav-mobile-toggle"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            <span className="nav-mobile-toggle-line" />
            <span className="nav-mobile-toggle-line" />
            <span className="nav-mobile-toggle-line" />
          </button>

          <button onClick={toggleTheme} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          {/* ☀️ / 🌙 */}
          </button>
        </div>

        <div className={`nav-mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <Link to="/home" className="nav-mobile-link" onClick={closeMobileMenu}>Home</Link>
          <Link to="/programs" className="nav-mobile-link" onClick={closeMobileMenu}>Programs</Link>
          <Link to="/consultation" className="nav-mobile-link" onClick={closeMobileMenu}>Consultation</Link>
          <Link to="/merch" className="nav-mobile-link" onClick={closeMobileMenu}>Merch</Link>
          <Link to="/about" className="nav-mobile-link" onClick={closeMobileMenu}>About</Link>
          <Link to="/qualifications" className="nav-mobile-link" onClick={closeMobileMenu}>Qualifications</Link>
          <Link to="/testimonials" className="nav-mobile-link" onClick={closeMobileMenu}>Testimonials</Link>
          <button type="button" onClick={handleBookSession} className="nav-mobile-cta">
            Book Session
          </button>
        </div>

      </div>
    </nav>
  );
}