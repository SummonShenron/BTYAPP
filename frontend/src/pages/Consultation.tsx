// pages/Consultation.tsx
import React, { useEffect, useState } from 'react';
import ConsultationForm from '../components/ConsultationForm';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8005';

const defaults: Record<string, string> = {
  consultation_kicker: 'Start Your Journey',
  consultation_title: 'BOOK A FREE CONSULTATION',
  consultation_subtitle: "Let's discuss your current fitness baseline, review past injuries or mechanics, and map out a tailored strategy to reach your goals.",
  consultation_what_next_title: 'What Happens Next?',
  consultation_step_1_title: '1. Movement Screening',
  consultation_step_1_description: 'We review joint mobility, past injury history, and daily postural habits.',
  consultation_step_2_title: '2. Goal Blueprinting',
  consultation_step_2_description: 'Define concrete targets for muscle building, fat loss, athletic power, or mobility.',
  consultation_step_3_title: '3. Custom Plan Roadmap',
  consultation_step_3_description: 'Get recommended program structures and training cadence tailored for you.',
  consultation_quote_text: "Training isn't about pushing past bad biomechanics - it's about teaching your body how to produce power efficiently without injury.",
  consultation_quote_author: '- Madison Spear, Head Coach',
};

export default function Consultation() {
  const [content, setContent] = useState<Record<string, string>>(defaults);

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
        setContent({
          ...defaults,
          ...items,
        });
      } catch {
        // Keep defaults if content endpoint is unavailable.
      }
    };

    void loadContent();

    return () => controller.abort();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl space-y-12">
      {/* Page Title Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-[#38C2DE] text-xs font-bold tracking-widest uppercase">
          {content.consultation_kicker}
        </span>
        <h1 className="text-4xl font-black tracking-tight text-white">
          {content.consultation_title}
        </h1>
        <p className="text-[#A0A5AA] text-sm leading-relaxed">
          {content.consultation_subtitle}
        </p>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Left Side: What to Expect Breakdown (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card-interactive p-6 space-y-6">
            <h3 className="text-xl font-bold text-white border-b border-[#2a2a32] pb-3">
              {content.consultation_what_next_title}
            </h3>

            <div className="space-y-5">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-[#38C2DE]/20 border border-[#38C2DE]/40 text-[#38C2DE] font-black text-sm flex items-center justify-center shrink-0">
                  
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{content.consultation_step_1_title}</h4>
                  <p className="text-xs text-[#A0A5AA] mt-1 leading-relaxed">
                    {content.consultation_step_1_description}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-[#38C2DE]/20 border border-[#38C2DE]/40 text-[#38C2DE] font-black text-sm flex items-center justify-center shrink-0">
                    
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{content.consultation_step_2_title}</h4>
                  <p className="text-xs text-[#A0A5AA] mt-1 leading-relaxed">
                    {content.consultation_step_2_description}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-[#38C2DE]/20 border border-[#38C2DE]/40 text-[#38C2DE] font-black text-sm flex items-center justify-center shrink-0">
                  
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{content.consultation_step_3_title}</h4>
                  <p className="text-xs text-[#A0A5AA] mt-1 leading-relaxed">
                    {content.consultation_step_3_description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Quote / Guarantee Box */}
          <div className="glass-card-interactive p-6 space-y-2 border-l-4 border-l-[#38C2DE]">
            <p className="text-xs italic text-[#A0A5AA] leading-relaxed">
              "{content.consultation_quote_text}"
            </p>
            <span className="text-[11px] font-bold text-[#38C2DE] block">
              {content.consultation_quote_author}
            </span>
          </div>
        </div>

        {/* Right Side: Embedded Consultation Form (3 cols) */}
        <div className="lg:col-span-3">
          <div className="glass-card-interactive p-6 sm:p-8">
            <ConsultationForm contentOverrides={content} />
          </div>
        </div>
      </div>
    </div>
  );
}