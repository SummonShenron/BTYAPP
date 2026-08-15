import React from "react";
import { Link, Outlet } from 'react-router-dom';
import Navbar from "./components/Navbar";
import logoImg from './assets/logo.png';
import StaticHexGrid from "./components/Honeycomb";
import SparseBlipGrid from "./components/AmbientHero.tsx";

export default function Layout() {
  return (
    <div className="bty-container">
      <Navbar />

      {/* Hero Banner with Fixed Background Parallax */}
      <div 
        className="bty-hero-banner" 
        style={{ backgroundImage: `url(${logoImg})` }}
      >
        <SparseBlipGrid cellSize={20} color="#4FD4EE" maskRadius={180}/>
      </div>

      {/* Page Content */}
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