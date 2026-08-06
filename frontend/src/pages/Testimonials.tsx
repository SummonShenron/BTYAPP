import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './__styles__/BrandPages.css';

const testimonials = [
  {
    quote: "Madison helped me not just transform my body, but my life as well. Without her coaching I wouldn't be the same person I am today.",
    name: 'Jack H.',
    role: 'Performance Client'
  },
  {
    quote: 'Getting back into shape felt overwhelming. But thanks to BTY and my amazing trainer Madison, I\'m not just back on track, I\'m thriving!.\n My personalized workouts were always acessible, whether i was at the gym or squeezing in a quick session at home. Plus, the video demonstrations were fantastic -- no more wondering if i was doing the exercises correctly.\n Madison is a constant source of encouragmeent and knowledge. She even gave me suggestions to help with nutrition. And the best part? She listened to my physical limitations and created a plan that worked for me. Honestly without BTY, I\'d probably still be on the couch, beating myself up. BTY jump started my fitness journey, and now exercise is a regular part of my life. \n I feel stronger, more confident, and incredibly grateful to Madison and BTY',
    name: 'Jane N.',
    role: 'Hybrid Coaching Client'
  },
  {
    quote: 'I\'m a middle -aged active woman who had been intimidated by free weight training but knew how essential it is for overall health. Madison creates fun, safe, and challenging workouts to help me achieve my fitness goals.',
    name: 'Amy R.',
    role: 'Hybrid Coaching Client'
  },
  {
    quote: 'I\'ve been training with Madison for over 5 years. I was one of her first clients. I had just had a total knee replacement and was concerned about training. Madison did research and learned about proper exercises for my situation. It was important to me that she listened to my concerns and took the time to learn. I\'ve found her to continue to design my training to my particular needs. All of this and she is a lot of fun.',
    name: 'Bruce',
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