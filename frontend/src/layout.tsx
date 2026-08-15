import React from "react";
import { Link, Outlet } from 'react-router-dom';
import Navbar from "./components/Navbar";
import logoImg from './assets/logo.png';
import SparseBlipGrid from "./components/AmbientHero";

export default function Layout() {
  return (
    <div className="bty-container">
      <Navbar />

     <div 
        className="bty-hero-banner" 
        style={{ 
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02)), url(${logoImg})`,
          backgroundSize: 'cover, 450px', // Layer 1 (Gradient) covers 100%, Layer 2 (Logo) stays 450px
        }}
      >
        <SparseBlipGrid cellSize={20} color="#4FD4EE" maskRadius={220} />
      </div>

      <main className="bty-main">
        <Outlet />
      </main>

      <footer className="bty-footer">
        © {new Date().getFullYear()} BTY Fitness by Madison Spear. All rights reserved.
        <Link 
          to="/admin" 
          className="hover:text-[#38C2DE] transition-colors flex items-center gap-1 opacity-60 hover:opacity-100 justify-center mt-2"
        >
          Coach Portal
        </Link>
      </footer>
    </div>
  );
}