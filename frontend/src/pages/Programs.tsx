import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AccordionGallery from '../components/AccordionGallery';
import './__styles__/BrandPages.css';
import clientsVideo from '../assets/clients.mp4';
import landmineImg from '../assets/landmine.jpeg';
import lungesImg from '../assets/lunges.jpeg';
import squatImg from '../assets/squat.jpeg';
import medBallImg from '../assets/medball.jpeg';
import boxImg from '../assets/box.jpeg'; 

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8005';

const programGalleryItems = [
  { image: landmineImg, label: 'Landmine Rotations', alt: 'Client performing landmine rotations' },
  { image: lungesImg, label: 'Lunges', alt: 'Client performing lunges' },
  { image: squatImg, label: 'Strength & Mobility', alt: 'Client performing a strength and mobility exercise' },
  { image: medBallImg, label: 'Medicine Ball Exercises', alt: 'Client performing medicine ball exercises' },
  { image: boxImg, label: 'Box Jumps', alt: 'Client performing box jumps' },
];

interface ProgramDetail {
  id: string;
  badge: string;
  title: string;
  tagline: string;
  description: string;
  price?: string;
  period?: string;
  features: string[];
  popular?: boolean;
}

const programsData: ProgramDetail[] = [
  {
    id: '1-on-1',
    badge: 'In-Person',
    title: '1-on-1 Private Coaching',
    tagline: 'Maximum accountability & real-time form correction.',
    description: 'Strength & conditioning tailored directly to your unique biomechanics, movement patterns, and specific goals.',
    features: [
      'Full body biomechanical screening',
      'Dedicated 60-minute private sessions',
      'Individual modifications as trainer assesses your form and techniques',
      'Progress tracking with clear weekly milestones',
      'Direct 24/7 client portal chat access',
      'Come 1x, 2x or 3x per week for maximum results',
    ],
    popular: true,
  },
  {
    id: 'duo',
    badge: 'Semi-Private',
    title: 'Duo Partner Coaching',
    tagline: 'Shared energy, individual focus & joint accountability.',
    description: 'Train alongside a friend, partner, or teammate while receiving customized exercise modifications for both of your fitness levels.',
    features: [
      'Biomechanical movement screening & goal alignment',
      'Dedicated 60-minute partner sessions',
      'Individualized exercise scaling & load management',
      'Shared accountability and team motivation',
      'Direct 24/7 client portal chat access',
      'Flexible 1x, 2x, or 3x per week partner scheduling',
      'Workouts designed around each others individual goals instead of individualized exercise scaling and load management',
    ],
  },
  {
    id: 'Online',
    badge: 'Most Flexible',
    title: 'Online Hybrid Fitness',
    tagline: 'Train anywhere with elite guidance in your pocket.',
    description: 'Custom training programming updated weekly, paired with video form audits and direct check-ins via our dedicated client portal.',
    features: [
      'Custom app-based workout structure',
      'Weekly check-ins, form review & critiques',
      'Progressive overload tracking',
      'Weekly scheduled check-in calls',
      'Flexible workout schedule adaptation',
    ],
  },
];

const defaultProgramsContent: Record<string, string> = {
  programs_page_kicker: 'Transformational Pathways',
  programs_page_title: 'CHOOSE YOUR PROGRAM',
  programs_page_subtitle: 'Every body moves differently. Select a training structure built specifically around your lifestyle, schedule, and biomechanical needs.',
  programs_page_popular_badge: 'Most Popular',
  programs_page_card_1_badge: 'In-Person',
  programs_page_card_1_title: '1-on-1 Private Coaching',
  programs_page_card_1_tagline: 'Maximum accountability & real-time form correction.',
  programs_page_card_1_description: 'High-intensity strength & conditioning tailored directly to your unique biomechanics, movement patterns, and specific physical targets.',
  programs_page_card_1_features: 'Full body biomechanical screening\nDedicated 60-minute private sessions\nIndividual modifications as trainer assesses your form and techniques\nProgress tracking with clear weekly milestones\nDirect 24/7 client portal chat access\nCome 1x, 2x or 3x per week for maximum results',
  programs_page_card_1_cta_label: 'Select 1-on-1 Program',
  programs_page_card_2_badge: 'Semi-Private',
  programs_page_card_2_title: 'Duo Partner Coaching',
  programs_page_card_2_tagline: 'Shared energy, individual focus & joint accountability.',
  programs_page_card_2_description: 'Train alongside a friend, partner, or teammate while receiving customized exercise modifications for both of your fitness levels.',
  programs_page_card_2_features: 'Biomechanical movement screening & goal alignment\nDedicated 60-minute partner sessions\nIndividualized exercise scaling & load management\nShared accountability and team motivation\nDirect 24/7 client portal chat access\nFlexible 1x, 2x, or 3x per week partner scheduling\nWorkouts designed around each others individual goals instead of individualized exercise scaling and load management',
  programs_page_card_2_cta_label: 'Select Duo Program',
  programs_page_card_3_badge: 'Most Flexible',
  programs_page_card_3_title: 'Online Hybrid Fitness',
  programs_page_card_3_tagline: 'Train anywhere with elite guidance in your pocket.',
  programs_page_card_3_description: 'Custom training programming updated weekly, paired with video form audits and direct check-ins via our dedicated client portal.',
  programs_page_card_3_features: 'Custom app-based workout structure\nWeekly check-ins, form review & critiques\nProgressive overload tracking\nWeekly scheduled check-in calls\nFlexible workout schedule adaptation',
  programs_page_card_3_cta_label: 'Select Online Program',
};

function parseFeatures(value: string): string[] {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function Programs() {
  const navigate = useNavigate();
  const [content, setContent] = useState<Record<string, string>>(defaultProgramsContent);

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
          ...defaultProgramsContent,
          ...items,
        });
      } catch {
        // Keep defaults if content endpoint is unavailable.
      }
    };

    void loadContent();

    return () => controller.abort();
  }, []);

  const programsDataFromContent: ProgramDetail[] = useMemo(
    () => [
      {
        id: '1-on-1',
        badge: content.programs_page_card_1_badge,
        title: content.programs_page_card_1_title,
        tagline: content.programs_page_card_1_tagline,
        description: content.programs_page_card_1_description,
        features: parseFeatures(content.programs_page_card_1_features),
        popular: true,
      },
      {
        id: 'duo',
        badge: content.programs_page_card_2_badge,
        title: content.programs_page_card_2_title,
        tagline: content.programs_page_card_2_tagline,
        description: content.programs_page_card_2_description,
        features: parseFeatures(content.programs_page_card_2_features),
      },
      {
        id: 'online',
        badge: content.programs_page_card_3_badge,
        title: content.programs_page_card_3_title,
        tagline: content.programs_page_card_3_tagline,
        description: content.programs_page_card_3_description,
        features: parseFeatures(content.programs_page_card_3_features),
      },
    ],
    [content]
  );

  return (
  <div className="container mx-auto px-4 py-12 max-w-6xl space-y-12">
    {/* Top Hero Section */}
    <div className="programs-page-hero">
      <div className="programs-page-hero-copy">
        <span
          style={{
            color: '#38C2DE',
            fontSize: '0.75rem',
            fontWeight: '700',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          {content.programs_page_kicker}
        </span>
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          {content.programs_page_title}
        </h1>
        <p style={{ color: '#A0A5AA', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
          {content.programs_page_subtitle}
        </p>
      </div>

      <div className="programs-page-gallery">
        <AccordionGallery
          items={programGalleryItems}
          expandRatio={0.52}
          trigger="hover"
        />
      </div>
    </div>
      {/* Programs Grid */}
      <div className="programs-card-stack">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {programsDataFromContent.map((program, index) => (
          <div
            key={program.id}
            className={`glass-card-interactive flex flex-col justify-between p-8 relative ${
              program.popular ? 'border-[#38C2DE]/50 shadow-[0_0_25px_rgba(56,194,222,0.15)]' : ''
            }`}
          >
            {program.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#38C2DE] text-black text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                {content.programs_page_popular_badge}
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
              {program.price && (
                <div className="flex items-baseline gap-1 py-3 border-y border-[#2a2a32]">
                  <span className="text-3xl font-black text-white">{program.price}</span>
                  <span className="text-xs text-[#A0A5AA]">{program.period}</span>
                </div>
              )}

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
              {index === 0
                ? content.programs_page_card_1_cta_label
                : index === 1
                  ? content.programs_page_card_2_cta_label
                  : content.programs_page_card_3_cta_label}
            </button>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}