// components/Navbar.tsx
import React from 'react';
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

  return (
    <nav className="navbar">
      <div className="nav-container">
        
        {/* Brand Logo */}
        <Link to="/" className="nav-brand">
          <span className="brand-title">BTY FITNESS</span>
          <span className="brand-subtitle">by Madison Spear</span>
        </Link>

        {/* Links */}
        <ul className="nav-links">
          <li>
            <Link to="/" className="nav-link">Home</Link>
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

        {/* CTA Button */}
        <button 
          onClick={() => navigate('/book')}
          className="nav-cta-btn"
        >
          Book Session
        </button>
        <button onClick={toggleTheme} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        {/* ☀️ / 🌙 */}
        </button>

      </div>
    </nav>
  );
}