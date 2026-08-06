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
            I have been a trainer for seven years (2026) and have owned Better than Yesterday Fitness for five! I'm passionate about helping people gain the knowledge and skills to become stronger and healthier through personalized fitness coaching.
            I have always enjoyed working out and coaching. I was a collegiate Track & Field athelete before coaching in the sport while receiving my masters degree. 
            I knew helping and educating people on wellness was what I wanted to do!
          </p>
          <p className="about-text">
            I am focused on helping people imporove their overall wellness at a pace that's right for them. Helping clients reach their goals through exercise tailored to their individual circumstances is my priority.
            I work with a wide variety of clients from those who's goals are to lose weight, gain strength and prevent injury, to those who have chronic diseases like diabetes, cardiovascular issues, cancer, and amputations.
          </p>
          <p className="about-text">
            Fitness is more than just lifting weights; it is about building a sustainable lifestyle, developing mental resilience, and committing to being Better Than Yesterday.
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