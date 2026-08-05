// pages/Home.tsx
import React from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import ProgramCard from '../components/ProgramCard';
import ConsultationForm from '../components/ConsultationForm';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png'

export default function Home() {
  const navigate = useNavigate();

  const handleProgramSelect = (programName: string) => {
    // Route to dedicated consultation page with state pre-selected
    navigate('/consultation', { state: { selectedProgram: programName } });
  };

  const handleScrollToForm = (programName?: string) => {
    const formElement = document.getElementById('consultation');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/consultation', { state: { selectedProgram: programName } });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-20 max-w-6xl">
      {/* Hero Section */}
      <Hero />

      {/* Meet Madison */}
      <About />

      {/* Programs + Visual Media Section */}
      <section id="programs" className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-[#38C2DE] text-xs font-bold tracking-widest uppercase">
            Services
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight">TRAINING PROGRAMS</h2>
          <p className="text-[#A0A5AA] text-sm">
            Select a program tailored to your fitness goals and lifestyle.
          </p>
        </div>

        {/* 2-Column Flex Layout */}
        <div 
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            alignItems: 'stretch'
          }}
        >
          {/* Left Column: 3 Program Cards */}
          <div style={{ flex: '1 1 480px' }} className="flex flex-col gap-4">
            <ProgramCard
            title="1-on-1 Private Coaching"
            description="High-intensity strength & conditioning tailored directly to your biomechanics and personal targets."
            onSelect={() => navigate('/book', { state: { selectedProgram: '1-on-1 Private Coaching' } })}
            />
            <ProgramCard
              title="Online Hybrid Fitness"
              description="Custom training plans, weekly video form audits, and direct message check-ins via our client portal."
              onSelect={() => navigate('/programs')}
            />
            <ProgramCard
              title="Nutrition & Macro Strategy"
              description="Flexible macro plans focused on sustainable habits, performance fuel, body recomposition, and longevity."
              onSelect={() => navigate('/consultation', { state: { selectedProgram: 'Nutrition & Macro Strategy' } })}
            />
          </div>

          {/* Right Column: Visual Media Feature Card */}
          <aside 
            style={{ flex: '1 1 320px', minHeight: '420px' }} 
            className="glass-card-interactive overflow-hidden p-0 relative"
          >
            {/* Top Media Zone */}
            <div
              className="relative"
              style={{
                height: 'clamp(220px, 30vw, 300px)',
                background: '#182127',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem',
              }}
            >
              <img 
                src={logo} 
                alt="BTY Fitness Training Session" 
                style={{
                  maxWidth: '78%',
                  maxHeight: '78%',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  opacity: 0.56,
                  transition: 'opacity 0.3s ease',
                }}
              />
            </div>

            {/* Content Zone */}
            <div className="p-6 space-y-4">
              <span className="bg-[#38C2DE]/20 text-[#38C2DE] border border-[#38C2DE]/40 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-md">
                In Action
              </span>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight leading-tight">
                  REAL RESULTS.<br />
                  <span className="text-[#38C2DE]">NO GUESSWORK.</span>
                </h3>
                <p className="text-[#A0A5AA] text-xs mt-2 leading-relaxed">
                  Every program is backed by biomechanical form analysis and personalized feedback loops.
                </p>
              </div>

             <button 
            onClick={() => navigate('/book')}
            className="btn-neon-primary w-full text-sm py-3 mt-2 shadow-lg"
            >
            Schedule Free Assessment
            </button>
            </div>
          </aside>

        </div>
      </section>

      {/* Lead Capture Form */}
      <section id="consultation">
        <ConsultationForm />
      </section>
    </div>
  );
}