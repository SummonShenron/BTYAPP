import React, { useState } from "react";
import { Link } from 'react-router-dom';
import Navbar from "./components/Navbar";
import { Outlet } from "react-router-dom";
import logoFallback from './assets/logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8005';

export default function Layout() {
  const [brandLogoSrc, setBrandLogoSrc] = useState<string>(`${API_URL}/api/media/brand_logo?v=${Date.now()}`);

  return (
    <div className="bty-container">
      <Navbar />

      {/* Hero Banner (optional but recommended) */}
      <div className="bty-hero-banner">
        <img
          src={brandLogoSrc}
          onError={() => {
            if (brandLogoSrc !== logoFallback) {
              setBrandLogoSrc(logoFallback);
            }
          }}
          alt="BTY Fitness Logo"
          className="bty-hero-logo"
        />
      </div>

      {/* Page Content */}
      <main className="bty-main">
        <Outlet />
      </main>

      <footer className="bty-footer">
        © {new Date().getFullYear()} BTY Fitness by Madison Spear. All rights reserved.
        {/* Discrete Coach Login Link */}
        <Link 
          to="/admin" 
          className="hover:text-[#38C2DE] transition-colors flex items-center gap-1 opacity-60 hover:opacity-100"
        >
          Coach Portal
        </Link>
      </footer>
    </div>
  );
}
