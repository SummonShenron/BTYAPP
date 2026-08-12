import React from 'react';

export default function DesMoinesPersonalTraining() {
  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '4rem 1.5rem 5rem', color: '#edf8ff' }}>
      <section style={{ display: 'grid', gap: '1rem' }}>
        <p style={{ margin: 0, color: '#38C2DE', fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
          Personal Trainer in Des Moines, IA
        </p>

        <h1 style={{ margin: 0, fontSize: 'clamp(2.3rem, 4vw, 4rem)', lineHeight: 1.1 }}>
          Personal Training in Des Moines, Iowa
        </h1>

        <p style={{ margin: 0, color: '#b6c8d1', fontSize: '1.08rem', lineHeight: 1.7 }}>
          BTY Fitness helps clients in Des Moines, Urbandale, West Des Moines, and the greater Iowa metro area build strength,
          improve movement quality, and train with more confidence. Coaching is tailored around biomechanics, performance,
          and sustainable progress so each plan fits your body, goals, and life.
        </p>

        <div style={{ display: 'grid', gap: '0.85rem', marginTop: '0.5rem', color: '#dfeef7' }}>
          <div>
            <strong style={{ color: '#38C2DE' }}>Location:</strong> Trainer&apos;s Edge Gym, 3845 100th St, Urbandale, IA 50322
          </div>
          <div>
            <strong style={{ color: '#38C2DE' }}>Phone:</strong> (515) 509-3623
          </div>
          <div>
            <strong style={{ color: '#38C2DE' }}>Services:</strong> 1-on-1 strength coaching, hybrid programming, movement assessments, and custom fitness planning.
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a
            href="/consultation"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.9rem 1.4rem',
              borderRadius: '10px',
              background: '#38C2DE',
              color: '#041018',
              textDecoration: 'none',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Book a Consultation
          </a>
        </div>
      </section>
    </main>
  );
}
