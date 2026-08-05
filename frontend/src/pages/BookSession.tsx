// pages/BookSession.tsx
import React from 'react';
import { InlineWidget } from 'react-calendly';

export default function BookSession() {
  // Replace this with Madison Spear's actual Calendly URL (e.g., 'https://calendly.com/btyfitness/assessment')
  const calendlyUrl = "https://calendly.com/accreditation-dev/30min"; 

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <span className="text-[#38C2DE] text-xs font-bold tracking-widest uppercase">
          Live Booking
        </span>
        <h1 className="text-4xl font-black text-white tracking-tight">
          SCHEDULE YOUR ASSESSMENT
        </h1>
        <p className="text-[#A0A5AA] text-sm leading-relaxed">
          Pick a time slot that fits your schedule for a 1-on-1 biomechanics & goals review with Coach Madison.
        </p>
      </div>

      {/* Calendly Inline Widget Card */}
      <div className="glass-card-interactive p-2 sm:p-6 min-h-[680px]">
        <InlineWidget
          url={calendlyUrl}
          styles={{
            height: '650px',
            width: '100%',
          }}
          pageSettings={{
            backgroundColor: '121316',
            hideEventTypeDetails: false,
            hideLandingPageDetails: false,
            primaryColor: '38C2DE',
            textColor: 'ffffff',
          }}
        />
      </div>
    </div>
  );
}