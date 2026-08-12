import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface PlateInfo {
  color: string;
  textColor: string;
  heightPx: number;
  widthPx: number;
}

const PLATE_CONFIG: Record<number, PlateInfo> = {
  45: { color: '#38C2DE', textColor: '#000000', heightPx: 110, widthPx: 15 }, // BTY Cyan
//   35: { color: '#eab308', textColor: '#000000', heightPx: 96,  widthPx: 13 }, // Yellow
  25: { color: '#22c55e', textColor: '#000000', heightPx: 82,  widthPx: 11 }, // Green
  10: { color: '#f8fafc', textColor: '#000000', heightPx: 60,  widthPx: 9  }, // White
  5:  { color: '#ef4444', textColor: '#ffffff', heightPx: 48,  widthPx: 7  }, // Red
  2.5:{ color: '#a1a1aa', textColor: '#000000', heightPx: 34,  widthPx: 5  }, // Grey
};

const PLATE_WEIGHTS = [45, 25, 10, 5, 2.5];

export default function Calculator() {
  // Start with empty / 0 values
  const [weight, setWeight] = useState<number>(0);
  const [reps, setReps] = useState<number>(0);
  const [barWeight, setBarWeight] = useState<number>(45);
  
  // Start with an empty barbell
  const [platesOneSide, setPlatesOneSide] = useState<number[]>([]);

  // Epley Formula: 1RM = Weight * (1 + Reps / 30)
  const estimatedOneRepMax = weight <= 0 || reps <= 0 
    ? 0 
    : reps === 1 
      ? weight 
      : Math.round(weight * (1 + reps / 30));

  // Auto-calculate plates for a given target weight
  const autoCalculatePlatesForTarget = (targetWeight: number, barW: number) => {
    let remaining = (targetWeight - barW) / 2;
    if (remaining <= 0) return [];

    const newPlates: number[] = [];
    for (const pWeight of PLATE_WEIGHTS) {
      const count = Math.floor(remaining / pWeight);
      for (let i = 0; i < count; i++) {
        newPlates.push(pWeight);
      }
      remaining %= pWeight;
    }
    return newPlates;
  };

  // Sync plates when inputs change or 1RM updates
  useEffect(() => {
    if (estimatedOneRepMax > barWeight) {
      setPlatesOneSide(autoCalculatePlatesForTarget(estimatedOneRepMax, barWeight));
    } else {
      setPlatesOneSide([]);
    }
  }, [weight, reps, barWeight]);

  // Calculate current total weight on bar
  const currentTotalWeight = barWeight + platesOneSide.reduce((sum, p) => sum + p, 0) * 2;

  // Manual Plate Actions
  const handleAddPlate = (pWeight: number) => {
    const updated = [...platesOneSide, pWeight].sort((a, b) => b - a);
    setPlatesOneSide(updated);
  };

  const handleRemovePlateIndex = (indexToRemove: number) => {
    setPlatesOneSide(platesOneSide.filter((_, i) => i !== indexToRemove));
  };

  const handleClearBar = () => {
    setPlatesOneSide([]);
  };

  const handleLoadTargetWeight = (targetWeight: number) => {
    setPlatesOneSide(autoCalculatePlatesForTarget(targetWeight, barWeight));
  };

  const percentages = [
    { pct: 100, label: '1RM / Max Effort' },
    { pct: 95, label: 'Heavy Singles' },
    { pct: 90, label: 'Strength Block' },
    { pct: 85, label: 'Hypertrophy / 5s' },
    { pct: 80, label: 'Volume Work' },
    { pct: 75, label: 'Moderate Volume' },
    { pct: 70, label: 'Endurance / Speed' },
    { pct: 65, label: 'Dynamic Warm-up' },
  ];

  // Group plate summary for text readout
  const plateSummaryText = () => {
    if (platesOneSide.length === 0) return 'Bar Only';
    const counts: Record<number, number> = {};
    platesOneSide.forEach((p) => {
      counts[p] = (counts[p] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([w, count]) => `${count}x ${w}lb`)
      .join(', ');
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem', color: '#f8fafc', fontFamily: 'sans-serif' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>
          1-Rep Max & <span style={{ color: '#38C2DE' }}>Plate Calculator</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>
          Estimate your max lifting potential, manually rack plates, and calculate exact barbell weights instantly.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Left Card: Inputs */}
        <div style={{ backgroundColor: '#121820', border: '1px solid #1e293b', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Input Lift Stats</h2>
              <span style={{ fontSize: '0.7rem', color: '#38C2DE', background: 'rgba(56, 194, 222, 0.1)', padding: '0.25rem 0.6rem', borderRadius: '20px', border: '1px solid rgba(56, 194, 222, 0.2)' }}>
                Epley Formula
              </span>
            </div>

            {/* Weight Input */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                Weight Lifted (lbs)
              </label>
              <input
                type="number"
                min="0"
                max="1500"
                value={weight === 0 ? '' : weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                style={{ width: '100%', backgroundColor: '#0b0f17', border: '1px solid #334155', borderRadius: '10px', padding: '0.75rem 1rem', color: '#fff', fontSize: '1.1rem', boxSizing: 'border-box', outline: 'none' }}
                placeholder="0"
              />
            </div>

            {/* Reps Input */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                Reps Performed: <span style={{ color: '#38C2DE', fontWeight: 'bold' }}>{reps}</span>
              </label>
              <input
                type="range"
                min="0"
                max="12"
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#38C2DE', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>
                <span>0 Reps</span>
                <span>6 Reps</span>
                <span>12 Reps</span>
              </div>
            </div>

            {/* Barbell Weight Selector */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                Barbell Weight
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                {[45, 35, 70].map((bWeight) => (
                  <button
                    key={bWeight}
                    onClick={() => setBarWeight(bWeight)}
                    style={{
                      padding: '0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: '1px solid',
                      transition: 'all 0.2s',
                      backgroundColor: barWeight === bWeight ? '#38C2DE' : '#0b0f17',
                      color: barWeight === bWeight ? '#000000' : '#94a3b8',
                      borderColor: barWeight === bWeight ? '#38C2DE' : '#1e293b',
                    }}
                  >
                    {bWeight} lbs {bWeight === 45 ? '(Std)' : bWeight === 35 ? '(Women)' : '(Hex Bar)'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 1RM Box */}
          <div style={{ backgroundColor: '#0b0f17', border: '1px solid rgba(56, 194, 222, 0.3)', borderRadius: '12px', padding: '1rem', textAlign: 'center', marginTop: '1rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Estimated 1-Rep Max
            </span>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#38C2DE', margin: '0.2rem 0' }}>
              {estimatedOneRepMax} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#94a3b8' }}>lbs</span>
            </div>
          </div>
        </div>

        {/* Right Card: Full Barbell Visualizer & Manual Rack */}
        <div style={{ backgroundColor: '#121820', border: '1px solid #1e293b', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Barbell Visualizer</h2>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Loaded Weight: <span style={{ color: '#38C2DE', fontWeight: 'bold', fontSize: '1.1rem' }}>{currentTotalWeight} lbs</span>
              </div>
            </div>

            {/* Full Barbell Display Container */}
            <div style={{ backgroundColor: '#0b0f17', border: '1px solid #1e293b', borderRadius: '12px', padding: '1.5rem 0.5rem', marginBottom: '1.25rem', minHeight: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', overflowX: 'auto' }}>
              
              {/* Symmetrical Full Barbell Graphic */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', minWidth: '450px', height: '130px', position: 'relative' }}>
                
                {/* 1. LEFT SLEEVE */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minWidth: '110px', backgroundColor: '#334155', height: '16px', borderTop: '1px solid #475569', borderBottom: '1px solid #1e293b', borderRadius: '4px 0 0 4px', position: 'relative' }}>
                  {/* Left End Collar Nut */}
                  {platesOneSide.length > 0 && (
                    <div style={{ height: '20px', width: '6px', backgroundColor: '#94a3b8', borderRadius: '2px', marginRight: '2px', flexShrink: 0 }} />
                  )}
                  {/* Left Plates (Outer -> Inner order) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    {[...platesOneSide].reverse().map((pWeight, idx) => {
                      const originalIdx = platesOneSide.length - 1 - idx;
                      const cfg = PLATE_CONFIG[pWeight] || PLATE_CONFIG[45];
                      return (
                        <div
                          key={`L-${pWeight}-${idx}`}
                          onClick={() => handleRemovePlateIndex(originalIdx)}
                          title={`Click to remove ${pWeight} lb plate`}
                          style={{
                            backgroundColor: cfg.color,
                            height: `${cfg.heightPx}px`,
                            width: `${cfg.widthPx}px`,
                            borderRadius: '2px',
                            boxShadow: '-2px 0 4px rgba(0,0,0,0.4)',
                            borderLeft: '1px solid rgba(0,0,0,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '8px',
                            fontWeight: 'bold',
                            color: cfg.textColor,
                            userSelect: 'none',
                            flexShrink: 0
                          }}
                        >
                          {cfg.heightPx >= 60 ? pWeight : ''}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. LEFT COLLAR STOP */}
                <div style={{ height: '38px', width: '10px', backgroundColor: '#64748b', borderRadius: '2px', borderLeft: '2px solid #1e293b', boxShadow: '-2px 0 4px rgba(0,0,0,0.5)', flexShrink: 0, zIndex: 2 }} />

                {/* 3. CENTER SHAFT (Knurled Barbell Grip) */}
                <div style={{ height: '12px', width: '110px', backgroundColor: '#475569', borderTop: '1px solid #64748b', borderBottom: '1px solid #334155', flexShrink: 0, position: 'relative', backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.06) 50%, transparent 50%)', backgroundSize: '4px 100%' }} />

                {/* 4. RIGHT COLLAR STOP */}
                <div style={{ height: '38px', width: '10px', backgroundColor: '#64748b', borderRadius: '2px', borderRight: '2px solid #1e293b', boxShadow: '2px 0 4px rgba(0,0,0,0.5)', flexShrink: 0, zIndex: 2 }} />

                {/* 5. RIGHT SLEEVE */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', minWidth: '110px', backgroundColor: '#334155', height: '16px', borderTop: '1px solid #475569', borderBottom: '1px solid #1e293b', borderRadius: '0 4px 4px 0', position: 'relative' }}>
                  {/* Right Plates (Inner -> Outer order) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    {platesOneSide.map((pWeight, idx) => {
                      const cfg = PLATE_CONFIG[pWeight] || PLATE_CONFIG[45];
                      return (
                        <div
                          key={`R-${pWeight}-${idx}`}
                          onClick={() => handleRemovePlateIndex(idx)}
                          title={`Click to remove ${pWeight} lb plate`}
                          style={{
                            backgroundColor: cfg.color,
                            height: `${cfg.heightPx}px`,
                            width: `${cfg.widthPx}px`,
                            borderRadius: '2px',
                            boxShadow: '2px 0 4px rgba(0,0,0,0.4)',
                            borderRight: '1px solid rgba(0,0,0,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '8px',
                            fontWeight: 'bold',
                            color: cfg.textColor,
                            userSelect: 'none',
                            flexShrink: 0
                          }}
                        >
                          {cfg.heightPx >= 60 ? pWeight : ''}
                        </div>
                      );
                    })}
                  </div>
                  {/* Right End Collar Nut */}
                  {platesOneSide.length > 0 && (
                    <div style={{ height: '20px', width: '6px', backgroundColor: '#94a3b8', borderRadius: '2px', marginLeft: '2px', flexShrink: 0 }} />
                  )}
                </div>

              </div>

              {/* Per side summary */}
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>
                Plates per side: <span style={{ color: '#fff', fontWeight: 'bold' }}>{plateSummaryText()}</span>
              </div>
            </div>

            {/* Manual Plate Rack (Add / Clear Plates) */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                  Manual Plate Rack (Click to Add / Click Sleeve to Remove)
                </h3>
                <button
                  onClick={handleClearBar}
                  style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Clear Bar
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.4rem' }}>
                {PLATE_WEIGHTS.map((pWeight) => {
                  const cfg = PLATE_CONFIG[pWeight];
                  return (
                    <button
                      key={pWeight}
                      onClick={() => handleAddPlate(pWeight)}
                      style={{
                        backgroundColor: '#0b0f17',
                        border: `1px solid ${cfg.color}`,
                        borderRadius: '8px',
                        padding: '0.5rem 0.25rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        color: '#ffffff',
                        transition: 'transform 0.1s',
                      }}
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: cfg.color }}>+{pWeight}</div>
                      <div style={{ fontSize: '0.6rem', color: '#64748b' }}>lb</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Matrix Section */}
            <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
              1RM Training Percentages (Click to Auto-Load)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.5rem' }}>
              {percentages.map((item) => {
                const targetW = Math.round((estimatedOneRepMax * item.pct) / 100);
                const isSelected = currentTotalWeight > barWeight && currentTotalWeight === targetW;

                return (
                  <button
                    key={item.pct}
                    onClick={() => handleLoadTargetWeight(targetW)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '10px',
                      border: '1px solid',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      backgroundColor: isSelected ? 'rgba(56, 194, 222, 0.15)' : '#0b0f17',
                      borderColor: isSelected ? '#38C2DE' : '#1e293b',
                      color: isSelected ? '#ffffff' : '#cbd5e1',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '0.1rem' }}>
                      <span style={{ color: isSelected ? '#38C2DE' : '#94a3b8' }}>{item.pct}%</span>
                      <span>{targetW} lbs</span>
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Consultation CTA Banner */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Need a personalized periodization plan based on your numbers?
            </div>
            <Link
              to="/consultation"
              style={{
                backgroundColor: '#38C2DE',
                color: '#000000',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              Book Coaching Session
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}