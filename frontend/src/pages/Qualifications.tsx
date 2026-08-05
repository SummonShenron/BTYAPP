import React from 'react';
import { Link } from 'react-router-dom';
import './__styles__/BrandPages.css';

const qualifications = [
  {
    title: 'Exercise Science & Movement Foundations',
    detail: 'A strong base in biomechanics, strength development, and performance training.',
    year: 'Foundation'
  },
  {
    title: 'Coaching & Programming Methodology',
    detail: 'Focused on progressive, individualized plans that adapt to your goals and lifestyle.',
    year: 'Applied'
  },
  {
    title: 'Nutrition & Lifestyle Coaching',
    detail: 'Specialized in sustainable fueling strategies and habit-based progress.',
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
          Every recommendation in BTY coaching is rooted in movement science and practical coaching experience. Add your exact degrees,
          certifications, and issuing institutions here when ready.
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