import React from 'react';
import { Link } from 'react-router-dom';
import './__styles__/BrandPages.css';

const qualifications = [
  {
    title: 'M.S.E. in Exercise Science',
    detail: 'Advanced academic grounding in biomechanics, physiological adaptation, and performance optimization.',
    year: 'Master’s'
  },
  {
    title: 'B.A. in Human Performance',
    detail: 'Comprehensive foundation in motor learning, functional anatomy, and structured athletic development.',
    year: 'Bachelor’s'
  },
  {
    title: 'First Aid & CPR Certified',
    detail: 'Fully certified in emergency safety protocols, ensuring a secure and reliable training environment.',
    year: 'Certified'
  },
  {
    title: 'Coaching & Programming Methodology',
    detail: 'Focused on progressive, individualized plans that adapt to your goals and lifestyle.',
    year: 'Applied'
  },
  {
    title: 'Accountability & Client Support Systems',
    detail: 'Structured check-ins, progress reviews, and coaching adjustments that keep momentum high.',
    year: 'Integrated'
  }
];

const highlights = [
  'Movement assessments and individualized training strategy',
  'Programming built around real life, recovery, and consistency',
  'Supportive coaching that balances performance with sustainability'
];

export default function Qualifications() {
  return (
    <div className="brand-page qualifications-page">
      <header>
        <span className="brand-kicker">Qualifications</span>
        <h1 className="brand-title">Built on education, sharpened by real client outcomes.</h1>
        <p className="brand-subtitle">
          Every recommendation in BTY coaching is rooted in formal movement science—backed by an M.S.E. in Exercise Science, a B.A. in Human Performance, and practical coaching experience.
        </p>
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
        <h2>How that shows up in your program</h2>
        {highlights.map((item, idx) => (
          <div className="method-line" key={item}>
            <strong>{String(idx + 1).padStart(2, '0')}</strong>
            <span>{item}</span>
          </div>
        ))}
        <div className="action-row">
          <Link to="/about" className="btn-neon-outline">Back to About</Link>
          <Link to="/consultation" className="btn-neon-primary">Book a Consultation</Link>
        </div>
      </section>
    </div>
  );
}