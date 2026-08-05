import React from 'react';
import { Link } from 'react-router-dom';
import madi1 from '../assets/madi1.jpg';

export const About: React.FC = () => {
  return (
    <section id="about" className="about-section">
      <div className="about-container">
        <div className="about-photo-shell about-image-wrapper chat-input-wrapper">
          <img src={madi1} alt="Madison Spear - BTY Fitness" className="about-img about-img-sleek" />
          <div className="about-photo-veil" aria-hidden="true" />
          <div className="about-photo-ring" aria-hidden="true" />
        </div>
        <div className="about-content">
          <h2 className="section-title">Meet Madison Spear</h2>
          <p className="about-text">
            Fitness is more than just lifting weights; it is about building a sustainable lifestyle,
            developing mental resilience, and committing to being Better Than Yesterday.
          </p>
          <p className="about-text">
            With customized training protocols and dedicated nutrition coaching, my goal is to help you
            break past your plateaus and achieve results you never thought possible.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link to="/about" className="btn-neon-primary">Learn My Story</Link>
            <Link to="/qualifications" className="btn-neon-outline">View Credentials</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;