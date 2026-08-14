import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './__styles__/BrandPages.css';
import switchUpImg from '../assets/switch_up_your_routine-removebg-preview.png';
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8005';

const defaults: Record<string, string> = {
  qualifications_kicker: 'Qualifications',
  qualifications_title: 'Built on education, sharpened by real client outcomes.',
  qualifications_subtitle: 'Every recommendation in BTY coaching is rooted in formal movement science - backed by an M.S.E. in Exercise Science, a B.A. in Human Performance, and practical coaching experience.',
  qualifications_item_1_title: 'M.S.E. in Exercise Science',
  qualifications_item_1_detail: 'Advanced academic grounding in biomechanics, physiological adaptation, and performance optimization.',
  qualifications_item_1_year: 'Masters',
  qualifications_item_2_title: 'B.A. in Human Performance',
  qualifications_item_2_detail: 'Comprehensive foundation in motor learning, functional anatomy, and structured athletic development.',
  qualifications_item_2_year: 'Bachelors',
  qualifications_item_3_title: 'First Aid & CPR Certified',
  qualifications_item_3_detail: 'Fully certified in emergency safety protocols, ensuring a secure and reliable training environment.',
  qualifications_item_3_year: 'Certified',
  qualifications_item_4_title: 'Coaching & Programming Methodology',
  qualifications_item_4_detail: 'Focused on progressive, individualized plans that adapt to your goals and lifestyle.',
  qualifications_item_4_year: 'Applied',
  qualifications_item_5_title: 'Accountability & Client Support Systems',
  qualifications_item_5_detail: 'Structured check-ins, progress reviews, and coaching adjustments that keep momentum high.',
  qualifications_item_5_year: 'Integrated',
  qualifications_method_title: 'How that shows up in your program',
  qualifications_highlight_1: 'Movement assessments and individualized training strategy',
  qualifications_highlight_2: 'Programming built around real life, recovery, and consistency',
  qualifications_highlight_3: 'Supportive coaching that balances performance with sustainability',
  qualifications_cta_back: 'Back to About',
  qualifications_cta_book: 'Book a Consultation',
};

export default function Qualifications() {
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

  const qualifications = useMemo(
    () => [
      {
        title: content.qualifications_item_1_title,
        detail: content.qualifications_item_1_detail,
        year: content.qualifications_item_1_year,
      },
      {
        title: content.qualifications_item_2_title,
        detail: content.qualifications_item_2_detail,
        year: content.qualifications_item_2_year,
      },
      {
        title: content.qualifications_item_3_title,
        detail: content.qualifications_item_3_detail,
        year: content.qualifications_item_3_year,
      },
      {
        title: content.qualifications_item_4_title,
        detail: content.qualifications_item_4_detail,
        year: content.qualifications_item_4_year,
      },
      {
        title: content.qualifications_item_5_title,
        detail: content.qualifications_item_5_detail,
        year: content.qualifications_item_5_year,
      },
    ],
    [content]
  );

  const highlights = [
    content.qualifications_highlight_1,
    content.qualifications_highlight_2,
    content.qualifications_highlight_3,
  ];

  return (
    <div className="brand-page qualifications-page">
      <header className="qualifications-header">
        <div className="qualifications-header-grid">
          <div className="qualifications-header-copy">
            <span className="brand-kicker">{content.qualifications_kicker}</span>
            <h1 className="brand-title">{content.qualifications_title}</h1>
            <p className="brand-subtitle">
              {content.qualifications_subtitle}
            </p>
          </div>

          <div className="qualifications-header-media">
            <img className="qualifications-img" src={switchUpImg} alt="qualifications" />
          </div>
        </div>
      </header>

      <section className="qual-track">
        {qualifications.map((item) => (
          <article key={item.title} className="qual-item">
            <span className="qual-dot" aria-hidden="true" />
            <div className="qual-main">
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </div>
            <span className="qual-year">{item.year}</span>
          </article>
        ))}
      </section>

      <section className="method-sheet">
        <h2>{content.qualifications_method_title}</h2>
        {highlights.map((item, idx) => (
          <div className="method-line" key={item}>
            <strong>{String(idx + 1).padStart(2, '0')}</strong>
            <span>{item}</span>
          </div>
        ))}
        <div className="action-row">
          <Link to="/about" className="btn-neon-outline">{content.qualifications_cta_back}</Link>
          <Link to="/consultation" className="btn-neon-primary">{content.qualifications_cta_book}</Link>
        </div>
      </section>
    </div>
  );
}