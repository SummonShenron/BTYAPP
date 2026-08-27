import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DriftWall from '../components/DriftWall';
import './__styles__/BrandPages.css';
import squatImg from '../assets/squat3.jpeg';
import clientSquatImg from '../assets/IMG_1575.jpeg';
import clientMobilityImg from '../assets/IMG_1578.jpeg';
import clientPressImg from '../assets/IMG_1583.jpeg';
import clientLungeImg from '../assets/IMG_1584.jpeg';
import clientBalanceImg from '../assets/IMG_1588.jpeg';
import clientWallSquatImg from '../assets/IMG_1590.jpeg';
import balanceLungeImg from '../assets/lunges1.jpeg';
import loadedSquatImg from '../assets/squat1.jpeg';
import boxImg from '../assets/box.jpeg';
import coverPhotoImg from '../assets/cover_photo.jpg';
import coverPhoto2Img from '../assets/cover_photo2.jpg';
import img1603 from '../assets/IMG_1603.jpeg';
import img1605 from '../assets/IMG_1605.jpeg';
import img1606 from '../assets/IMG_1606.jpeg';
import img1607 from '../assets/IMG_1607.jpeg';
import img1610 from '../assets/IMG_1610.jpeg';
import img1611 from '../assets/IMG_1611.jpeg';
import img1613 from '../assets/IMG_1613.jpeg';
import landmineImg from '../assets/landmine.jpeg';
import landmineRDLImg from '../assets/landmineRDL.jpeg';
import lungesImg from '../assets/lunges.jpeg';
import madi1Img from '../assets/madi1.jpg';
import madi2Img from '../assets/madi2.jpeg';
import medBallImg from '../assets/medBall.jpeg';
import squatBaseImg from '../assets/squat.jpeg';
import squat2Img from '../assets/squat2.jpeg';
import squat4Img from '../assets/squat4.jpeg';
import squat5Img from '../assets/squat5.jpg';

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
  testimonials_item_5_quote: "I’ve had a great experience with Better Than Yesterday (BTY) and Madison Spear. Madison brings an incredible level of knowledge, energy and passion to strength and training, while creating an environment that is welcoming, motivating and focused on helping each individual reach their goals. What sets BTY apart is the emphasis on consistent progress. Madison understands that getting stronger and improving your fitness is a journey, and she provides the encouragement, guidance and accountability needed to help clients become better every day. Whether you are looking to build strength, improve your overall fitness or simply challenge yourself to reach the next level, Better Than Yesterday is a place where you can feel supported and motivated. Madison has built something special with BTY, and her passion for helping people become stronger—both physically and mentally—shines through in everything she does. I highly recommend BTY to anyone looking for knowledgeable coaching, effective training and a positive environment that will push you to be better than yesterday.",
  testimonials_item_5_name: 'Stacie M.',
  testimonials_item_5_role: 'Performance Client',
  testimonials_item_6_quote: "Been working out with Madison since 2019. She keeps me strong and able to do the things I want to do.",
  testimonials_item_6_name: 'Snookies Malt Shop',
  testimonials_item_6_role: 'Performance Client',
  testimonials_item_7_quote: "I love working out with my trainer Madison Spear. I’ve had some surgeries over the past few years and she tailors my workouts to accommodate my needs. I hold her in the highest regard and would recommend Madison to anyone. Go BTY!!!",
  testimonials_item_7_name: 'Lorel J.',
  testimonials_item_7_role: 'Performance Client',
  testimonials_cta_title: 'Ready to start your own story?',
  testimonials_cta_subtitle: "Book a free consult and let's map out a plan that fits your goals.",
  testimonials_cta_button: 'Book a Consultation',
};

interface TestimonialItem {
  quote: string;
  name: string;
  role: string;
}

interface PlateInfo {
  color: string;
  textColor: string;
  heightPx: number;
  widthPx: number;
}

interface PRRecord {
  id: string;
  weight: number;
  liftName: string;
  name: string;
  barWeight: number;
  platesOneSide: number[];
  date: string;
}

const PLATE_CONFIG: Record<number, PlateInfo> = {
  45: { color: '#38C2DE', textColor: '#000000', heightPx: 110, widthPx: 15 },
  25: { color: '#22c55e', textColor: '#000000', heightPx: 110, widthPx: 11 },
  10: { color: '#f8fafc', textColor: '#000000', heightPx: 110, widthPx: 9 },
  5: { color: '#ef4444', textColor: '#ffffff', heightPx: 48, widthPx: 7 },
  2.5: { color: '#a1a1aa', textColor: '#000000', heightPx: 34, widthPx: 5 },
};

const PLATE_WEIGHTS = [45, 25, 10, 5, 2.5];

const testimonialGalleryItems = [
  { image: squatImg, title: 'Strength Coaching' },
  { image: clientSquatImg, title: 'Supported Strength' },
  { image: clientMobilityImg, title: 'Mobility' },
  { image: clientPressImg, title: 'Progressive Strength' },
  { image: clientLungeImg, title: 'Functional Movement' },
  { image: clientBalanceImg, title: 'Balance & Stability' },
  { image: clientWallSquatImg, title: 'Individual Coaching' },
  { image: balanceLungeImg, title: 'Balance Training' },
  { image: loadedSquatImg, title: 'Loaded Strength' },
  { image: boxImg, title: 'Box Work' },
  { image: coverPhotoImg, title: 'Training Environment' },
  { image: coverPhoto2Img, title: 'Coaching Session' },
  { image: img1603, title: 'Form Focus' },
  { image: img1605, title: 'Guided Session' },
  { image: img1606, title: 'Progress' },
  { image: img1607, title: 'Consistency' },
  { image: img1610, title: 'Movement Quality' },
  { image: img1611, title: 'Client Work' },
  { image: img1613, title: 'Technique' },
  { image: landmineImg, title: 'Landmine Training' },
  { image: landmineRDLImg, title: 'Posterior Chain' },
  { image: lungesImg, title: 'Lunge Patterns' },
  { image: madi1Img, title: 'Coach Madison' },
  { image: madi2Img, title: 'Coaching' },
  { image: medBallImg, title: 'Power Work' },
  { image: squatBaseImg, title: 'Squat Patterning' },
  { image: squat2Img, title: 'Loaded Movement' },
  { image: squat4Img, title: 'Strength' },
  { image: squat5Img, title: 'Training' },
];

const autoCalculatePlatesForTarget = (targetWeight: number, barWeight: number) => {
  let remaining = (targetWeight - barWeight) / 2;
  if (remaining <= 0) return [];

  const plates: number[] = [];
  for (const plateWeight of PLATE_WEIGHTS) {
    const count = Math.floor(remaining / plateWeight);
    for (let i = 0; i < count; i++) {
      plates.push(plateWeight);
    }
    remaining %= plateWeight;
  }

  return plates;
};

const BarbellGraphic = ({
  plates,
  compact = false,
}: {
  plates: number[];
  compact?: boolean;
}) => {
  const hMult = compact ? 0.55 : 0.85;
  const containerHeight = compact ? '70px' : '120px';
  const sleeveHeight = compact ? '10px' : '14px';
  const collarHeight = compact ? '24px' : '34px';
  const collarWidth = compact ? '6px' : '8px';
  const barHeight = compact ? '7px' : '10px';
  const minSleeveWidth = compact ? '55px' : '90px';
  const fontSize = compact ? '7px' : '8px';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '100%',
        minWidth: compact ? '0' : '380px',
        height: containerHeight,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          minWidth: minSleeveWidth,
          backgroundColor: '#334155',
          height: sleeveHeight,
          borderRadius: '3px 0 0 3px',
          position: 'relative',
        }}
      >
        {plates.length > 0 && (
          <div
            style={{
              height: compact ? '13px' : '18px',
              width: compact ? '3px' : '5px',
              backgroundColor: '#94a3b8',
              borderRadius: '2px',
              marginRight: '2px',
              flexShrink: 0,
            }}
          />
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: compact ? '1px' : '2px' }}>
          {[...plates].reverse().map((pWeight, idx) => {
            const cfg = PLATE_CONFIG[pWeight] || PLATE_CONFIG[45];
            return (
              <div
                key={`L-${pWeight}-${idx}`}
                style={{
                  backgroundColor: cfg.color,
                  height: `${cfg.heightPx * hMult}px`,
                  width: `${Math.max(compact ? 4 : 5, cfg.widthPx * (compact ? 0.75 : 1))}px`,
                  borderRadius: '2px',
                  borderLeft: '1px solid rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: fontSize,
                  fontWeight: 'bold',
                  color: cfg.textColor,
                  flexShrink: 0,
                }}
              >
                {cfg.heightPx >= (compact ? 40 : 60) ? pWeight : ''}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ height: collarHeight, width: collarWidth, backgroundColor: '#64748b', borderRadius: '2px', flexShrink: 0, zIndex: 2 }} />
      <div style={{ height: barHeight, width: compact ? '50px' : '90px', backgroundColor: '#475569', flexShrink: 0, backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.06) 50%, transparent 50%)', backgroundSize: '4px 100%' }} />
      <div style={{ height: collarHeight, width: collarWidth, backgroundColor: '#64748b', borderRadius: '2px', flexShrink: 0, zIndex: 2 }} />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          minWidth: minSleeveWidth,
          backgroundColor: '#334155',
          height: sleeveHeight,
          borderRadius: '0 3px 3px 0',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: compact ? '1px' : '2px' }}>
          {plates.map((pWeight, idx) => {
            const cfg = PLATE_CONFIG[pWeight] || PLATE_CONFIG[45];
            return (
              <div
                key={`R-${pWeight}-${idx}`}
                style={{
                  backgroundColor: cfg.color,
                  height: `${cfg.heightPx * hMult}px`,
                  width: `${Math.max(compact ? 4 : 5, cfg.widthPx * (compact ? 0.75 : 1))}px`,
                  borderRadius: '2px',
                  borderRight: '1px solid rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: fontSize,
                  fontWeight: 'bold',
                  color: cfg.textColor,
                  flexShrink: 0,
                }}
              >
                {cfg.heightPx >= (compact ? 40 : 60) ? pWeight : ''}
              </div>
            );
          })}
        </div>
        {plates.length > 0 && (
          <div
            style={{
              height: compact ? '13px' : '18px',
              width: compact ? '3px' : '5px',
              backgroundColor: '#94a3b8',
              borderRadius: '2px',
              marginLeft: '2px',
              flexShrink: 0,
            }}
          />
        )}
      </div>
    </div>
  );
};

function TestimonialsCarousel({ items }: { items: TestimonialItem[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 15000);
    return () => clearInterval(timer);
  }, [items.length]);

  const current = items[index];
  const prev = () => setIndex((i) => (i - 1 + items.length) % items.length);
  const next = () => setIndex((i) => (i + 1) % items.length);

  return (
    <div className="testimonial-carousel">
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
  const [prWeightInput, setPrWeightInput] = useState<number>(0);
  const [prLiftName, setPrLiftName] = useState<string>('Squat');
  const [prName, setPrName] = useState<string>('');
  const [savedPRs, setSavedPRs] = useState<PRRecord[]>([]);

  // Mobile viewport tracking for DriftWall columns
  const [isMobile, setIsMobile] = useState<boolean>(
    () => typeof window !== 'undefined' && window.innerWidth <= 768
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const normalizePrRecord = (record: any): PRRecord => ({
    id: record.id ?? record._id ?? `${record.liftName}-${record.weight}-${Date.now()}`,
    weight: Number(record.weight ?? 0),
    liftName: record.liftName ?? 'Squat',
    name: record.name ?? 'Anonymous Lifter',
    barWeight: Number(record.barWeight ?? 45),
    platesOneSide: Array.isArray(record.platesOneSide) ? record.platesOneSide.map(Number) : [],
    date: record.date ?? new Date(record.created_at ?? Date.now()).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  });

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

    const loadPublicPRs = async () => {
      try {
        const response = await fetch(`${API_URL}/api/prs`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const normalized = Array.isArray(data)
          ? data.map(normalizePrRecord).sort((a, b) => b.weight - a.weight)
          : [];
        setSavedPRs(normalized);
      } catch {
        setSavedPRs([]);
      }
    };

    void loadContent();
    void loadPublicPRs();

    return () => controller.abort();
  }, []);

  const handleCreatePR = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalWeight = prWeightInput || 135;
    const barWeight = 45;
    const platesOneSide = autoCalculatePlatesForTarget(finalWeight, barWeight);
    const payload = {
      weight: finalWeight,
      liftName: prLiftName,
      name: prName.trim() || 'Anonymous Lifter',
      barWeight,
      platesOneSide,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    try {
      const response = await fetch(`${API_URL}/api/prs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Unable to save PR');
      }

      const data = await response.json();
      const savedRecord = normalizePrRecord(data.record ?? payload);
      setSavedPRs((prev) => [savedRecord, ...prev].sort((a, b) => b.weight - a.weight));
      setPrWeightInput(0);
      setPrName('');
      setPrLiftName('Squat');
    } catch {
      // Keep quiet for now; we can add a toast later.
    }
  };

  const handleDeletePR = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/prs/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      setSavedPRs((prev) => prev.filter((pr) => pr.id !== id));
    } catch {
      // Keep quiet for now.
    }
  };

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

      <section
        style={{
          height: '520px',
          width: '100%',
          maxWidth: '1140px',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginTop: '2rem',
        }}
      >
        <DriftWall
          items={testimonialGalleryItems}
          columns={isMobile ? 2 : 4}
          tileWidth={isMobile ? 150 : 270}
          tileHeight={isMobile ? 120 : 170}
          gap={isMobile ? 12 : 20}
          tilt={16}
          turn={-14}
          perspective={1200}
          depth={120}
          speed={42}
          direction="up"
          variance={0.45}
          parallax={0.9}
          altColumnParallax={2.9}
          lift={64}
          fade={0.6}
          dim={0.55}
          overlayColor="#121316"
          ctaMessage="This could be you"
          ctaHref="/consultation"
        />
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

      <section
        style={{
          marginTop: '2rem',
          backgroundColor: '#121820',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          padding: '1rem',
          width: '100%',
          maxWidth: '980px',
          marginLeft: 'auto',
          marginRight: 'auto',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1rem',
            borderBottom: '1px solid #1e293b',
            paddingBottom: '0.75rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>
              Log & Generate <span style={{ color: '#38C2DE' }}>PR Badge</span>
            </h2>
          </div>

          <form onSubmit={handleCreatePR} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'end' }}>
            <div style={{ width: '90px' }}>
              <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
                PR Weight
              </label>
              <input
                type="number"
                value={prWeightInput === 0 ? '' : prWeightInput}
                onChange={(e) => setPrWeightInput(Number(e.target.value))}
                placeholder="315 lbs"
                style={{ width: '100%', backgroundColor: '#0b0f17', border: '1px solid #334155', borderRadius: '6px', padding: '0.35rem 0.45rem', color: '#fff', fontSize: '0.8rem', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ width: '115px' }}>
              <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
                Lift Type
              </label>
              <select
                value={prLiftName}
                onChange={(e) => setPrLiftName(e.target.value)}
                style={{ width: '100%', backgroundColor: '#0b0f17', border: '1px solid #334155', borderRadius: '6px', padding: '0.35rem 0.45rem', color: '#fff', fontSize: '0.8rem', boxSizing: 'border-box' }}
              >
                <option value="Squat">Squat</option>
                <option value="Bench Press">Bench Press</option>
                <option value="Deadlift">Deadlift</option>
                <option value="Overhead Press">Overhead Press</option>
                <option value="Hip Thrust">Hip Thrust</option>
              </select>
            </div>

            <div style={{ width: '120px' }}>
              <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
                Name
              </label>
              <input
                type="text"
                value={prName}
                onChange={(e) => setPrName(e.target.value)}
                placeholder="Alex M."
                style={{ width: '100%', backgroundColor: '#0b0f17', border: '1px solid #334155', borderRadius: '6px', padding: '0.35rem 0.45rem', color: '#fff', fontSize: '0.8rem', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              style={{
                backgroundColor: '#38C2DE',
                color: '#000000',
                fontWeight: 'bold',
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.78rem',
              }}
            >
              + Create Card
            </button>
          </form>
        </div>

        {savedPRs.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', width: '100%', justifyItems: 'stretch' }}>
            {savedPRs.map((pr) => (
              <div
                key={pr.id}
                style={{
                  backgroundColor: '#0b0f17',
                  border: '1px solid #38C2DE',
                  borderRadius: '10px',
                  padding: '0.75rem 0.85rem',
                  position: 'relative',
                  boxShadow: '0 4px 16px rgba(56, 194, 222, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  boxSizing: 'border-box',
                  width: '100%',
                  maxWidth: '100%',
                  minWidth: 0,
                }}
              >
                <button
                  type="button"
                  onClick={() => handleDeletePR(pr.id)}
                  style={{ position: 'absolute', top: '6px', right: '8px', background: 'none', border: 'none', color: '#64748b', fontSize: '1.1rem', cursor: 'pointer', lineHeight: 1 }}
                  title="Remove Badge"
                >
                  ×
                </button>

                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '0.1rem' }}>
                    {pr.name}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {pr.liftName} Personal Record
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#38C2DE', margin: '0.1rem 0' }}>
                    {pr.weight} <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#94a3b8' }}>lbs</span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#121820', border: '1px solid #1e293b', borderRadius: '6px', padding: '0.2rem', margin: '0.35rem 0', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', overflow: 'hidden' }}>
                  <BarbellGraphic plates={pr.platesOneSide} compact={true} />
                </div>

                <div style={{ backgroundColor: 'rgba(56, 194, 222, 0.08)', borderLeft: '3px solid #38C2DE', padding: '0.35rem 0.5rem', borderRadius: '0 5px 5px 0', fontSize: '0.7rem', fontStyle: 'italic', color: '#e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                  <span>"Madison helped me achieve this!"</span>
                  <span style={{ fontSize: '0.58rem', color: '#64748b', fontStyle: 'normal' }}>{pr.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
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