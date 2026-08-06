// pages/Programs.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ProgramDetail {
  id: string;
  badge: string;
  title: string;
  tagline: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
}

const programsData: ProgramDetail[] = [
  {
    id: '1-on-1',
    badge: 'In-Person',
    title: '1-on-1 Private Coaching',
    tagline: 'Maximum accountability & real-time form correction.',
    description: 'High-intensity strength & conditioning tailored directly to your unique biomechanics, movement patterns, and specific physical targets.',
    price: '$95',
    period: '/ session',
    features: [
      'Full body biomechanical screening',
      'Dedicated 60-minute private sessions',
      'Real-time posture & joint angle tracking',
      'Progress tracking with clear weekly milestones',
      'Direct 24/7 client portal chat access',
    ],
    popular: true,
  },
  {
    id: 'hybrid',
    badge: 'Most Flexible',
    title: 'Online Hybrid Fitness',
    tagline: 'Train anywhere with elite guidance in your pocket.',
    description: 'Custom training programming updated weekly, paired with video form audits and direct check-ins via our dedicated client portal.',
    price: '$199',
    period: '/ month',
    features: [
      'Custom app-based workout structure',
      'Weekly video form review & critiques',
      'Progressive overload tracking',
      'Weekly scheduled check-in calls',
      'Flexible workout schedule adaptation',
    ],
  },
];

export default function Programs() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-[#38C2DE] text-xs font-bold tracking-widest uppercase">
          Transformational Pathways
        </span>
        <h1 className="text-4xl font-black tracking-tight text-white">
          CHOOSE YOUR PROGRAM
        </h1>
        <p className="text-[#A0A5AA] text-sm leading-relaxed">
          Every body moves differently. Select a training architecture built specifically around your lifestyle, schedule, and biomechanical needs.
        </p>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {programsData.map((program) => (
          <div
            key={program.id}
            className={`glass-card-interactive flex flex-col justify-between p-8 relative ${
              program.popular ? 'border-[#38C2DE]/50 shadow-[0_0_25px_rgba(56,194,222,0.15)]' : ''
            }`}
          >
            {program.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#38C2DE] text-black text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                Most Popular
              </span>
            )}

            <div className="space-y-6">
              {/* Top Tag & Title */}
              <div className="space-y-2">
                <span className="text-[#38C2DE] text-xs font-bold uppercase tracking-wide">
                  {program.badge}
                </span>
                <h2 className="text-2xl font-bold text-white">{program.title}</h2>
                <p className="text-xs text-[#38C2DE]/80 font-medium">{program.tagline}</p>
              </div>

              {/* Price Tag */}
              <div className="flex items-baseline gap-1 py-3 border-y border-[#2a2a32]">
                <span className="text-3xl font-black text-white">{program.price}</span>
                <span className="text-xs text-[#A0A5AA]">{program.period}</span>
              </div>

              <p className="text-xs text-[#A0A5AA] leading-relaxed">
                {program.description}
              </p>

              {/* Features List */}
              <ul className="space-y-3 pt-2">
                {program.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-[#A0A5AA]">
                    <span className="text-[#38C2DE] font-bold">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action CTA */}
            <button
              onClick={() => navigate('/book')}
              className={`w-full text-sm py-3 mt-8 font-bold transition-all ${
                program.popular ? 'btn-neon-primary' : 'btn-neon-outline'
              }`}
            >
              Select {program.title.split(' ')[0]} Program
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}