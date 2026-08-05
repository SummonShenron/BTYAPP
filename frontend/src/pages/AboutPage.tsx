import React from 'react';
import { Link } from 'react-router-dom';
import './__styles__/BrandPages.css';
import madi2 from '../assets/madi2.jpeg';

export default function AboutMe() {
  return (
    <div className="brand-page about-page">
      <header>
        <span className="brand-kicker">About Madison</span>
        <h1 className="brand-title">Strength coaching built for real life and lasting change.</h1>
        <p className="brand-subtitle">
          BTY is less about chasing a perfect body and more about learning how to train with intention. Every plan is built around biomechanics,
          recovery, and momentum you can keep.
        </p>
      </header>

      <section className="page-grid">
        <article className="editorial-panel">
          <h2>Why I coach this way</h2>
          <p>
            Most people do not fail because they lack effort. They fail because their plan is generic, exhausting, or disconnected from their actual
            lifestyle. My coaching system is designed to fix that.
          </p>
          <p>
            We start by understanding your movement quality, injury history, schedule, and stress load. Then we build a structure that meets you where
            you are and grows with you.
          </p>
          <div className="action-row">
            <Link to="/qualifications" className="btn-neon-primary">View Qualifications</Link>
            <Link to="/testimonials" className="btn-neon-outline">Read Testimonials</Link>
          </div>
        </article>

        <aside className="profile-frame">
          <div className="profile-media-zone">
            <img src={madi2} alt="Madison Spear" className="profile-media-image" />
            <div className="profile-photo-veil" aria-hidden="true" />
            <div className="profile-photo-ring" aria-hidden="true" />
          </div>
        </aside>
      </section>

      <section className="pillar-grid">
        <article className="pillar">
          <h3>Precision</h3>
          <p>Technique-first coaching that protects joints and improves power output over time.</p>
        </article>
        <article className="pillar">
          <h3>Consistency</h3>
          <p>Programming designed to survive busy weeks, travel, and the realities of daily life.</p>
        </article>
        <article className="pillar">
          <h3>Ownership</h3>
          <p>Clients learn the why behind each decision so progress continues beyond each session.</p>
        </article>
      </section>
    </div>
  );
}