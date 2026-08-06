// pages/Consultation.tsx
import React from 'react';
import ConsultationForm from '../components/ConsultationForm';

export default function Consultation() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl space-y-12">
      {/* Page Title Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-[#38C2DE] text-xs font-bold tracking-widest uppercase">
          Start Your Journey
        </span>
        <h1 className="text-4xl font-black tracking-tight text-white">
          BOOK A FREE CONSULTATION
        </h1>
        <p className="text-[#A0A5AA] text-sm leading-relaxed">
          Let’s discuss your current fitness baseline, review past injuries or mechanics, and map out a tailored strategy to reach your goals.
        </p>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Left Side: What to Expect Breakdown (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card-interactive p-6 space-y-6">
            <h3 className="text-xl font-bold text-white border-b border-[#2a2a32] pb-3">
              What Happens Next?
            </h3>

            <div className="space-y-5">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-[#38C2DE]/20 border border-[#38C2DE]/40 text-[#38C2DE] font-black text-sm flex items-center justify-center shrink-0">
                  
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">1. Movement Screening</h4>
                  <p className="text-xs text-[#A0A5AA] mt-1 leading-relaxed">
                    We review joint mobility, past injury history, and daily postural habits.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-[#38C2DE]/20 border border-[#38C2DE]/40 text-[#38C2DE] font-black text-sm flex items-center justify-center shrink-0">
                    
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">2. Goal Blueprinting</h4>
                  <p className="text-xs text-[#A0A5AA] mt-1 leading-relaxed">
                    Define concrete targets for muscle building, fat loss, athletic power, or mobility.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-[#38C2DE]/20 border border-[#38C2DE]/40 text-[#38C2DE] font-black text-sm flex items-center justify-center shrink-0">
                  
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">3. Custom Plan Roadmap</h4>
                  <p className="text-xs text-[#A0A5AA] mt-1 leading-relaxed">
                    Get recommended program structures and training cadence tailored for you.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Quote / Guarantee Box */}
          <div className="glass-card-interactive p-6 space-y-2 border-l-4 border-l-[#38C2DE]">
            <p className="text-xs italic text-[#A0A5AA] leading-relaxed">
              "Training isn't about pushing past bad biomechanics—it's about teaching your body how to produce power efficiently without injury."
            </p>
            <span className="text-[11px] font-bold text-[#38C2DE] block">
              — Madison Spear, Head Coach
            </span>
          </div>
        </div>

        {/* Right Side: Embedded Consultation Form (3 cols) */}
        <div className="lg:col-span-3">
          <div className="glass-card-interactive p-6 sm:p-8">
            <ConsultationForm />
          </div>
        </div>
      </div>
    </div>
  );
}