import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FlipRevealCarousel from '../components/FlipRevealCarousel';
import './__styles__/BrandPages.css';
import squatImg from '../assets/squat3.jpeg';
import clientSquatImg from '../assets/IMG_1575.jpeg';
import clientMobilityImg from '../assets/IMG_1578.jpeg';
import clientPressImg from '../assets/IMG_1583.jpeg';
import clientLungeImg from '../assets/IMG_1584.jpeg';
import clientBalanceImg from '../assets/IMG_1588.jpeg';
import clientWallSquatImg from '../assets/IMG_1590.jpeg';
import balanceLungeImg from '../assets/lunges1.jpeg';
import loadedSquatImg from '../assets/squat1.jpeg';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8005';

const aboutGalleryItems = [
  { image: squatImg, title: 'Strength Coaching' },
  { image: clientSquatImg, title: 'Supported Strength' },
  { image: clientMobilityImg, title: 'Mobility' },
  { image: clientPressImg, title: 'Progressive Strength' },
  { image: clientLungeImg, title: 'Functional Movement' },
  { image: clientBalanceImg, title: 'Balance & Stability' },
  { image: clientWallSquatImg, title: 'Individual Coaching' },
  { image: balanceLungeImg, title: 'Balance Training' },
  { image: loadedSquatImg, title: 'Loaded Strength' },
];

const defaults: Record<string, string> = {
  about_page_kicker: 'About Madison',
  about_page_title: 'Strength coaching built for real life and lasting change.',
  about_page_subtitle: 'BTY is less about chasing a perfect body and more about learning how to train with intention. Every plan is built around biomechanics, goals and progressive overload for momentum you can keep. ',
  about_page_section_title: 'Why I coach this way',
  about_page_paragraph_1: 'Most people do not fail because they lack effort. They fail because their plan is generic, exhausting, or disconnected from their actual lifestyle. My coaching system is designed to fix that.',
  about_page_paragraph_2: 'We start by understanding your movement quality, injury history, schedule, and stress load. Then we build a structure that meets you where you are and grows with you.',
  about_page_cta_qualifications: 'View Qualifications',
  about_page_cta_testimonials: 'Read Testimonials',
  about_page_pillar_1_title: 'Precision',
  about_page_pillar_1_text: 'Technique-first coaching that protects joints and improves power output over time.',
  about_page_pillar_2_title: 'Consistency',
  about_page_pillar_2_text: 'Programming designed to survive busy weeks, travel, and the realities of daily life.',
  about_page_pillar_3_title: 'Ownership',
  about_page_pillar_3_text: 'Clients learn the why behind each decision so progress continues beyond each session.',
};

export default function AboutMe() {
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
    <div className="brand-page about-page">
      <header>
        <span className="brand-kicker">{content.about_page_kicker}</span>
        <h1 className="brand-title">{content.about_page_title}</h1>
        <p className="brand-subtitle">
          {content.about_page_subtitle}
        </p>
      </header>

      <section className="page-grid">
        <article className="editorial-panel">
          <h2>{content.about_page_section_title}</h2>
          <p>
            {content.about_page_paragraph_1}
          </p>
          <p>
            {content.about_page_paragraph_2}
          </p>
          <div className="action-row">
            <Link to="/qualifications" className="btn-neon-primary">{content.about_page_cta_qualifications}</Link>
            <Link to="/testimonials" className="btn-neon-outline">{content.about_page_cta_testimonials}</Link>
          </div>
        </article>

        <aside className="about-drift-wall">
          <div className="profile-media-zone about-drift-wall-zone">
            <FlipRevealCarousel
              items={aboutGalleryItems}
              columns={14}
              rows={18}
              flipDuration={2.2}
              stagger={2.6}
              autoPlay
            />
          </div>
        </aside>
      </section>

      <section className="pillar-grid">
        <article className="pillar">
          <h3>{content.about_page_pillar_1_title}</h3>
          <p>{content.about_page_pillar_1_text}</p>
        </article>
        <article className="pillar">
          <h3>{content.about_page_pillar_2_title}</h3>
          <p>{content.about_page_pillar_2_text}</p>
        </article>
        <article className="pillar">
          <h3>{content.about_page_pillar_3_title}</h3>
          <p>{content.about_page_pillar_3_text}</p>
        </article>
      </section>
    </div>
  );
}