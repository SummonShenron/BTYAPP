// pages/Home.tsx
import React, { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import ProgramCard from '../components/ProgramCard';
import ConsultationForm from '../components/ConsultationForm';
import { useNavigate } from 'react-router-dom';
import homeFeaturePhoto from '../assets/madi1.jpg';
import logoImg from '../assets/logo.png';
import runningVideo from '../assets/running.mp4';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8005';

const defaultProgramContent: Record<string, string> = {
  programs_kicker: 'Services',
  programs_title: 'TRAINING PROGRAMS',
  programs_subtitle: 'Select a program tailored to your fitness goals and lifestyle.',
  program_card_1_title: '1-on-1 Private Coaching',
  program_card_1_description: 'Personalized fitness coaching tailored to your specific goals, fitness level and abilities.',
  program_card_2_title: 'Duo Session Coaching',
  program_card_2_description: 'Partner exercises, extra accountability and friendly motivation',
  program_card_3_title: 'Online Hybrid Fitness',
  program_card_3_description: 'Online training programs, weekly check in’s, convenience of training on your own time, and direct message check in’s via client portal',
  program_feature_badge: 'In Action',
  program_feature_title_line_1: 'REAL RESULTS',
  program_feature_title_line_2: 'NO GUESSWORK',
  program_feature_description: 'Every program is backed by biomechanical form analysis and personalized feedback loops',
  program_feature_cta_label: 'Schedule Free Assessment',
};

export default function Home() {
  const navigate = useNavigate();
  const [programContent, setProgramContent] = useState<Record<string, string>>(defaultProgramContent);

  useEffect(() => {
    const controller = new AbortController();

    const loadContent = async () => {
      try {
        const response = await fetch(`${API_URL}/api/content`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const items = (data?.items ?? {}) as Record<string, string>;
        setProgramContent({
          ...defaultProgramContent,
          ...items,
        });
      } catch {
        // Keep defaults if content endpoint is unavailable.
      }
    };

    void loadContent();

    return () => controller.abort();
  }, []);

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
            {programContent.programs_kicker}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">{programContent.programs_title}</h1>
          <p className="text-[#A0A5AA] text-sm">
            {programContent.programs_subtitle}
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
            title={programContent.program_card_1_title}
            description={programContent.program_card_1_description}
            onSelect={() => navigate('/book', { state: { selectedProgram: '1-on-1 Private Coaching' } })}
            />
             <ProgramCard
              title={programContent.program_card_2_title}
              description={programContent.program_card_2_description}
              onSelect={() => navigate('/book', { state: { selectedProgram: 'Duo Session Coaching' } })}
              />
            <ProgramCard
              title={programContent.program_card_3_title}
              description={programContent.program_card_3_description}
              onSelect={() => navigate('/programs')}
            />
          </div>

          {/* Right Column: Visual Media Feature Card */}
          <aside 
            style={{ flex: '1 1 320px', minHeight: '420px' }} 
            className="glass-card-interactive overflow-hidden p-0 relative"
          >
            {/* Top Media Zone */}
            <div
              className="relative overflow-hidden"
              style={{
                height: 'clamp(220px, 30vw, 300px)',
                background: '#182127',
              }}
            >
              <video 
                src={runningVideo}
                loop
                autoPlay
                muted
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0.56,
                  transition: 'opacity 0.3s ease',
                }}
              />
            </div>

            {/* Content Zone */}
            <div className="p-6 space-y-4">
              <span className="bg-[#38C2DE]/20 text-[#38C2DE] border border-[#38C2DE]/40 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-md">
                {programContent.program_feature_badge}
              </span>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight leading-tight">
                  {programContent.program_feature_title_line_1}<br />
                  <span className="text-[#38C2DE]">{programContent.program_feature_title_line_2}</span>
                </h3>
                <p className="text-[#A0A5AA] text-xs mt-2 leading-relaxed">
                  {programContent.program_feature_description}
                </p>
              </div>

             <button 
            onClick={() => navigate('/book')}
            className="btn-neon-primary w-full text-sm py-3 mt-2 shadow-lg"
            >
            {programContent.program_feature_cta_label}
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