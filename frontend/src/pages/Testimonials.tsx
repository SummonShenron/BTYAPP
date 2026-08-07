import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './__styles__/BrandPages.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8005';

const defaults: Record<string, string> = {
  testimonials_kicker: 'Testimonials',
  testimonials_title: 'What clients are saying.',
  testimonials_subtitle: 'Real stories, thoughtful coaching, and steady progress are the foundation of every BTY experience.',
  testimonials_item_1_quote: "Madison helped me not just transform my body, but my life as well. Without her coaching I wouldn't be the same person I am today.",
  testimonials_item_1_name: 'Jack H.',
  testimonials_item_1_role: 'Performance Client',
  testimonials_item_2_quote: "Getting back into shape felt overwhelming. But thanks to BTY and my amazing trainer Madison, I'm not just back on track, I'm thriving!. My personalized workouts were always accessible, whether I was at the gym or squeezing in a quick session at home. Plus, the video demonstrations were fantastic - no more wondering if I was doing the exercises correctly. Madison is a constant source of encouragement and knowledge. She even gave me suggestions to help with nutrition. And the best part? She listened to my physical limitations and created a plan that worked for me. Honestly without BTY, I'd probably still be on the couch, beating myself up. BTY jump started my fitness journey, and now exercise is a regular part of my life. I feel stronger, more confident, and incredibly grateful to Madison and BTY.",
  testimonials_item_2_name: 'Jane N.',
  testimonials_item_2_role: 'Hybrid Coaching Client',
  testimonials_item_3_quote: "I'm a middle-aged active woman who had been intimidated by free weight training but knew how essential it is for overall health. Madison creates fun, safe, and challenging workouts to help me achieve my fitness goals.",
  testimonials_item_3_name: 'Amy R.',
  testimonials_item_3_role: 'Hybrid Coaching Client',
  testimonials_item_4_quote: "I've been training with Madison for over 5 years. I was one of her first clients. I had just had a total knee replacement and was concerned about training. Madison did research and learned about proper exercises for my situation. It was important to me that she listened to my concerns and took the time to learn. I've found her to continue to design my training to my particular needs. All of this and she is a lot of fun.",
  testimonials_item_4_name: 'Bruce',
  testimonials_item_4_role: 'Performance Client',
  testimonials_cta_title: 'Ready to start your own story?',
  testimonials_cta_subtitle: "Book a free consult and let's map out a plan that fits your goals.",
  testimonials_cta_button: 'Book a Consultation',
};

interface TestimonialItem {
  quote: string;
  name: string;
  role: string;
}

function TestimonialsCarousel({ items }: { items: TestimonialItem[] }) {
  const [index, setIndex] = useState(0);

  // auto-advance every 6s, pauses only on unmount
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [items.length]);

  const current = items[index];
  const prev = () => setIndex((i) => (i - 1 + items.length) % items.length);
  const next = () => setIndex((i) => (i + 1) % items.length);

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
          {items.map((_, i) => (
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

  const testimonials: TestimonialItem[] = [
    {
      quote: content.testimonials_item_1_quote,
      name: content.testimonials_item_1_name,
      role: content.testimonials_item_1_role,
    },
    {
      quote: content.testimonials_item_2_quote,
      name: content.testimonials_item_2_name,
      role: content.testimonials_item_2_role,
    },
    {
      quote: content.testimonials_item_3_quote,
      name: content.testimonials_item_3_name,
      role: content.testimonials_item_3_role,
    },
    {
      quote: content.testimonials_item_4_quote,
      name: content.testimonials_item_4_name,
      role: content.testimonials_item_4_role,
    },
  ];

  return (
    <div className="brand-page testimonials-page">
      <header className="text-center" style={{ maxWidth: '740px', margin: '0 auto' }}>
        <span className="brand-kicker">
          {content.testimonials_kicker}
        </span>
        <h1 className="brand-title">{content.testimonials_title}</h1>
        <p className="brand-subtitle" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
          {content.testimonials_subtitle}
        </p>
      </header>

      <section className="testimonial-stage">
        <TestimonialsCarousel items={testimonials} />
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
          <h2>{content.testimonials_cta_title}</h2>
          <p>{content.testimonials_cta_subtitle}</p>
        </div>
        <Link to="/consultation" className="btn-neon-primary">
          {content.testimonials_cta_button}
        </Link>
      </section>
    </div>
  );
}