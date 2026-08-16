import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import aboutSectionFallbackPhoto from '../assets/madi1.jpg';
import madisonVideo from '../assets/madison.mp4';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8005';

const defaults: Record<string, string> = {
  about_title: 'Meet Madison Spear',
  about_paragraph_1:
    "I have been a trainer for seven years (2026) and have owned Better than Yesterday Fitness for five! I'm passionate about helping people gain the knowledge and skills to become stronger and healthier through personalized fitness coaching. I have always enjoyed working out and coaching. I was a collegiate Track & Field athlete before coaching in the sport while receiving my master's degree. I knew helping and educating people on wellness was what I wanted to do!",
  about_paragraph_2:
    "I am focused on helping people improve their overall wellness at a pace that's right for them. Helping clients reach their goals through exercise tailored to their individual circumstances is my priority. I work with a wide variety of clients from those whose goals are to lose weight, gain strength and prevent injury, to those who have chronic diseases like diabetes, cardiovascular issues, cancer, and amputations.",
  about_paragraph_3:
    'Fitness is more than just lifting weights; it is about building a sustainable lifestyle, developing mental resilience, and committing to being Better Than Yesterday.',
  about_cta_story_label: 'Learn My Story',
  about_cta_credentials_label: 'View Credentials',
};

export const About: React.FC = () => {
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
    <section id="about" className="about-section">
      <div className="about-container">
        <div className="about-photo-shell about-image-wrapper chat-input-wrapper">
          <video
            src={madisonVideo}
            poster={aboutSectionFallbackPhoto}
            autoPlay
            muted
            loop
            playsInline
            className="about-img about-img-sleek"
            style={{
              objectFit: 'cover',
              objectPosition: '50% 18%',
              display: 'block',
              width: '100%',
              height: '100%',
              filter: 'brightness(0.72) saturate(0.9)',
            }}
          />
          <div className="about-photo-veil" aria-hidden="true" />
          <div className="about-photo-ring" aria-hidden="true" />
        </div>
        <div className="about-content">
          <h2 className="section-title">{content.about_title}</h2>
          <p className="about-text">
            {content.about_paragraph_1}
          </p>
          <p className="about-text">
            {content.about_paragraph_2}
          </p>
          <p className="about-text">
            {content.about_paragraph_3}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/about" className="btn-neon-primary">{content.about_cta_story_label}</Link>
            <Link to="/qualifications" className="btn-neon-outline">{content.about_cta_credentials_label}</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;