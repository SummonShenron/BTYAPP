import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './__styles__/BrandPages.css';

const testimonials = [
  {
    quote: 'Madison helped me build a plan that finally felt realistic, structured, and motivating.',
    name: 'Ava R.',
    role: 'Online Client'
  },
  {
    quote: 'The coaching felt personal and incredibly clear. I learned how to train smarter and recover better.',
    name: 'Jordan M.',
    role: 'Hybrid Coaching Client'
  },
  {
    quote: 'The attention to detail completely changed the way I approach fitness and nutrition.',
    name: 'Tessa L.',
    role: 'Performance Client'
  }
];
function TestimonialsCarousel() {
  const [index, setIndex] = useState(0);

  // auto-advance every 6s, pauses only on unmount
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const current = testimonials[index];
  const prev = () => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
  const next = () => setIndex((i) => (i + 1) % testimonials.length);

  return (
    <div>
      <p className="carousel-quote">{current.quote}</p>
      <div className="carousel-meta">
        <p className="carousel-meta-name">{current.name}</p>
        <p className="carousel-meta-role">{current.role}</p>
      </div>

      <div className="carousel-controls">
        <button onClick={prev} className="carousel-arrow" aria-label="Previous testimonial">‹</button>
        <div className="carousel-dots">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              className={`carousel-dot ${i === index ? 'active' : ''}`}
            />
          ))}
        </div>
        <button onClick={next} className="carousel-arrow" aria-label="Next testimonial">›</button>
      </div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <div className="brand-page testimonials-page">
      <header className="text-center" style={{ maxWidth: '740px', margin: '0 auto' }}>
        <span className="brand-kicker">
          Testimonials
        </span>
        <h1 className="brand-title">What clients are saying.</h1>
        <p className="brand-subtitle" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
          Real stories, thoughtful coaching, and steady progress are the foundation of every BTY experience.
        </p>
      </header>

      <section className="testimonial-stage">
        <TestimonialsCarousel />
      </section>

      <section className="echo-wall">
        {testimonials.map((item) => (
          <article key={item.name} className="echo-note">
            <p>“{item.quote}”</p>
            <div className="name">{item.name}</div>
            <div className="role">{item.role}</div>
          </article>
        ))}
      </section>

      <section className="cta-ribbon">
        <div>
          <h2>Ready to start your own story?</h2>
          <p>Book a free consult and let’s map out a plan that fits your goals.</p>
        </div>
        <Link to="/consultation" className="btn-neon-primary">
          Book a Consultation
        </Link>
      </section>
    </div>
  );
}