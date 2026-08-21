import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AccordionGallery from './AccordionGallery';
import heroImg from '../assets/cover_photo2.jpg';
import heroImg3 from '../assets/squat.jpeg';
import twinsImg from '../assets/squat4.jpeg';
import './__styles__/hero.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8005';

const defaults: Record<string, string> = {
  hero_badge: 'BTY Fitness Training',
  hero_title_line_1: 'BETTER THAN',
  hero_title_accent: 'YESTERDAY',
  hero_subtitle_1: "Whether your goal is to build strength, lose weight, improve your health, or simply feel more confident, we're here to support you every step of the way.",
  hero_subtitle_2: 'Our gym is a friendly and welcoming environment where people of all fitness levels can feel comfortable, encouraged, and challenged at their own pace.',
  hero_subtitle_3: "With personalized training, expert guidance, and a community that genuinely wants to see you succeed, you'll have the support you need to reach your goals and enjoy the journey along the way.",
  hero_subtitle_4: "Your fitness journey starts here. Let's be Better Than Yesterday.",
  hero_primary_cta_label: 'Book Free Consultation',
  hero_secondary_cta_label: 'Explore Programs',
  hero_sidebar_status: 'Accepting New Clients',
  hero_sidebar_title: '1-on-1 & Hybrid Coaching',
  hero_sidebar_text: 'Direct biomechanics assessment & custom fitness planning.',
};

const heroGalleryItems = [
  { image: heroImg, label: 'Personal Coaching', alt: 'BTY Fitness personal coaching' },
  { image: twinsImg, label: 'Train Together', alt: 'BTY Fitness partner strength training' },
  { image: heroImg3, label: 'Build Strength', alt: 'BTY Fitness strength training' },
];

export default function Hero() {
  const navigate = useNavigate();
  const [content, setContent] = useState<Record<string, string>>(defaults);

  useEffect(() => {
    let active = true;

    const loadContent = async () => {
      try {
        const res = await fetch(`${API_URL}/api/content`);
        if (!res.ok) return;
        const data = await res.json();
        if (active && data?.items && typeof data.items === 'object') {
          setContent({ ...defaults, ...data.items });
        }
      } catch {
        // keep defaults silently
      }
    };

    loadContent();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <span className="hero-badge">{content.hero_badge}</span>

          <h1 className="hero-title">
            {content.hero_title_line_1} <br />
            <span className="accent-text">{content.hero_title_accent}</span>
          </h1>

          <p className="hero-subtitle">{content.hero_subtitle_1}</p>
          <p className="hero-subtitle">{content.hero_subtitle_2}</p>
          <p className="hero-subtitle">{content.hero_subtitle_3}</p>
          <p className="hero-subtitle">{content.hero_subtitle_4}</p>

          <div className="hero-actions">
            <button onClick={() => navigate('/consultation')} className="btn-neon-primary">
              {content.hero_primary_cta_label}
            </button>
            <button onClick={() => navigate('/programs')} className="btn-neon-outline">
              {content.hero_secondary_cta_label}
            </button>
          </div>
        </div>

        <aside className="hero-sidebar">
          <div className="hero-sidebar-card">
            <div className="sidebar-image-slot hero-accordion-gallery">
              <AccordionGallery
                items={heroGalleryItems}
                defaultIndex={2}
                expandRatio={0.52}
                trigger="hover"
              />
            </div>

            <div className="sidebar-card-content">
              <div className="sidebar-status-tag">
                <span className="status-dot"></span> {content.hero_sidebar_status}
              </div>
              <h3 className="sidebar-card-title">{content.hero_sidebar_title}</h3>
              <p className="sidebar-card-text">{content.hero_sidebar_text}</p>
            </div>
          </div>

          <div className="sidebar-stats-row">
            <div className="mini-stat-card">
              <span className="mini-stat-number">100%</span>
              <span className="mini-stat-label">Tailored Protocols</span>
            </div>
            <div className="mini-stat-card">
              <span className="mini-stat-number">Weekly</span>
              <span className="mini-stat-label">Form & Check-ins</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}