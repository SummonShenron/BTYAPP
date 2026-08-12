import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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
  45: { color: '#38C2DE', textColor: '#000000', heightPx: 110, widthPx: 15 }, // BTY Cyan
  35: { color: '#eab308', textColor: '#000000', heightPx: 96,  widthPx: 13 }, // Yellow
  25: { color: '#22c55e', textColor: '#000000', heightPx: 82,  widthPx: 11 }, // Green
  10: { color: '#f8fafc', textColor: '#000000', heightPx: 60,  widthPx: 9  }, // White
  5:  { color: '#ef4444', textColor: '#ffffff', heightPx: 48,  widthPx: 7  }, // Red
  2.5:{ color: '#a1a1aa', textColor: '#000000', heightPx: 34,  widthPx: 5  }, // Grey
};

const PLATE_WEIGHTS = [45, 35, 25, 10, 5, 2.5];

// Reusable Barbell Graphic Component
const BarbellGraphic = ({
  plates,
  onRemovePlate,
  compact = false,
}: {
  plates: number[];
  onRemovePlate?: (idx: number) => void;
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
        minWidth: compact ? '240px' : '380px',
        height: containerHeight,
        position: 'relative',
      }}
    >
      {/* LEFT SLEEVE */}
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
            const originalIdx = plates.length - 1 - idx;
            const cfg = PLATE_CONFIG[pWeight] || PLATE_CONFIG[45];
            return (
              <div
                key={`L-${pWeight}-${idx}`}
                onClick={() => onRemovePlate && onRemovePlate(originalIdx)}
                title={onRemovePlate ? `Click to remove ${pWeight} lb plate` : undefined}
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
                  cursor: onRemovePlate ? 'pointer' : 'default',
                  flexShrink: 0,
                }}
              >
                {cfg.heightPx >= (compact ? 40 : 60) ? pWeight : ''}
              </div>
            );
          })}
        </div>
      </div>

      {/* COLLAR & SHAFT */}
      <div style={{ height: collarHeight, width: collarWidth, backgroundColor: '#64748b', borderRadius: '2px', flexShrink: 0, zIndex: 2 }} />
      <div style={{ height: barHeight, width: compact ? '50px' : '90px', backgroundColor: '#475569', flexShrink: 0, backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.06) 50%, transparent 50%)', backgroundSize: '4px 100%' }} />
      <div style={{ height: collarHeight, width: collarWidth, backgroundColor: '#64748b', borderRadius: '2px', flexShrink: 0, zIndex: 2 }} />

      {/* RIGHT SLEEVE */}
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
                onClick={() => onRemovePlate && onRemovePlate(idx)}
                title={onRemovePlate ? `Click to remove ${pWeight} lb plate` : undefined}
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
                  cursor: onRemovePlate ? 'pointer' : 'default',
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

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8005';

export default function Calculator() {
  const [weight, setWeight] = useState<number>(0);
  const [reps, setReps] = useState<number>(0);
  const [barWeight, setBarWeight] = useState<number>(45);
  const [platesOneSide, setPlatesOneSide] = useState<number[]>([]);

  // PR Form State (No Age or Sex)
  const [prWeightInput, setPrWeightInput] = useState<number>(0);
  const [prLiftName, setPrLiftName] = useState<string>('Squat');
  const [prName, setPrName] = useState<string>('');
  const [savedPRs, setSavedPRs] = useState<PRRecord[]>([]);

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

  const loadPublicPRs = async () => {
    try {
      const response = await fetch(`${API_URL}/api/prs`);
      if (!response.ok) {
        throw new Error('Unable to load PR records');
      }
      const data = await response.json();
      const normalized = Array.isArray(data) ? data.map(normalizePrRecord) : [];
      setSavedPRs(normalized);
    } catch {
      setSavedPRs([]);
    }
  };

  useEffect(() => {
    loadPublicPRs();
  }, []);

  // Epley Formula: 1RM = Weight * (1 + Reps / 30)
  const estimatedOneRepMax =
    weight <= 0 || reps <= 0
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
      setPrWeightInput(estimatedOneRepMax);
    } else {
      setPlatesOneSide([]);
      if (weight > 0) setPrWeightInput(weight);
    }
  }, [weight, reps, barWeight]);

  // Calculate current total weight on bar
  const currentTotalWeight = barWeight + platesOneSide.reduce((sum, p) => sum + p, 0) * 2;

  // Manual Plate Actions
  const handleAddPlate = (pWeight: number) => {
    const updated = [...platesOneSide, pWeight].sort((a, b) => b - a);
    setPlatesOneSide(updated);
    setPrWeightInput(barWeight + updated.reduce((sum, p) => sum + p, 0) * 2);
  };

  const handleRemovePlateIndex = (indexToRemove: number) => {
    const updated = platesOneSide.filter((_, i) => i !== indexToRemove);
    setPlatesOneSide(updated);
    setPrWeightInput(barWeight + updated.reduce((sum, p) => sum + p, 0) * 2);
  };

  const handleClearBar = () => {
    setPlatesOneSide([]);
    setPrWeightInput(barWeight);
  };

  const handleLoadTargetWeight = (targetWeight: number) => {
    setPlatesOneSide(autoCalculatePlatesForTarget(targetWeight, barWeight));
    setPrWeightInput(targetWeight);
  };

  // PR Card Handler
  const handleCreatePR = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalWeight = prWeightInput || currentTotalWeight || 135;
    const computedPlates = autoCalculatePlatesForTarget(finalWeight, barWeight);

    const payload = {
      weight: finalWeight,
      liftName: prLiftName,
      name: prName.trim() || 'Anonymous Lifter',
      barWeight,
      platesOneSide: computedPlates,
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
      setSavedPRs((prev) => [savedRecord, ...prev]);
      setPrWeightInput(0);
      setPrName('');
      setPrLiftName('Squat');
    } catch {
      // No-op for now; we may add a user-facing error state later.
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
      // No-op for now; we may add a user-facing error state later.
    }
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
    <div style={{ maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '1.25rem 0.5rem', color: '#f8fafc', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem', padding: '0 0.5rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>
          1-Rep Max & <span style={{ color: '#38C2DE' }}>Plate Calculator</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', maxWidth: '600px', margin: '0 auto' }}>
          Estimate your max lifting potential, manually rack plates, and create shareable milestone PR cards.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Left Card: Inputs */}
        <div style={{ backgroundColor: '#121820', border: '1px solid #1e293b', borderRadius: '16px', padding: '1rem 0.85rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0, maxWidth: '100%', boxSizing: 'border-box' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Input Lift Stats</h2>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
                {[45, 35, 70].map((bWeight) => (
                  <button
                    key={bWeight}
                    onClick={() => setBarWeight(bWeight)}
                    style={{
                      padding: '0.5rem 0.2rem',
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
                    {bWeight} lbs {bWeight === 45 ? '(Std)' : bWeight === 35 ? '(Light)' : '(Hex)'}
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
        <div style={{ backgroundColor: '#121820', border: '1px solid #1e293b', borderRadius: '16px', padding: '1rem 0.85rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0, maxWidth: '100%', boxSizing: 'border-box' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Barbell Visualizer</h2>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Loaded Weight: <span style={{ color: '#38C2DE', fontWeight: 'bold', fontSize: '1.1rem' }}>{currentTotalWeight} lbs</span>
              </div>
            </div>

            {/* Visualizer Box */}
            <div style={{ backgroundColor: '#0b0f17', border: '1px solid #1e293b', borderRadius: '12px', padding: '1.25rem 0.25rem', marginBottom: '1.25rem', minHeight: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', overflowX: 'auto', width: '100%', boxSizing: 'border-box' }}>
              <BarbellGraphic plates={platesOneSide} onRemovePlate={handleRemovePlateIndex} />
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>
                Plates per side: <span style={{ color: '#fff', fontWeight: 'bold' }}>{plateSummaryText()}</span>
              </div>
            </div>

            {/* Manual Plate Rack */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.25rem' }}>
                <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                  Manual Plate Rack (Click to Add / Remove)
                </h3>
                <button
                  onClick={handleClearBar}
                  style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Clear Bar
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(48px, 1fr))', gap: '0.35rem' }}>
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
                        padding: '0.5rem 0.2rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        color: '#ffffff',
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.4rem' }}>
              {percentages.map((item) => {
                const targetW = Math.round((estimatedOneRepMax * item.pct) / 100);
                const isSelected = currentTotalWeight > barWeight && currentTotalWeight === targetW;

                return (
                  <button
                    key={item.pct}
                    onClick={() => handleLoadTargetWeight(targetW)}
                    style={{
                      padding: '0.5rem 0.4rem',
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
        </div>

      </div>

      {/* Consultation CTA Banner */}
      <div style={{ backgroundColor: '#121820', border: '1px solid #1e293b', borderRadius: '16px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          Need a personalized periodization plan based on your numbers?
        </div>
        <Link
          to="/consultation"
          style={{
            backgroundColor: '#38C2DE',
            color: '#000000',
            padding: '0.55rem 1.1rem',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            textDecoration: 'none',
            display: 'inline-block'
          }}
        >
          Book Coaching Session
        </Link>
      </div>

      {/* --- PR BADGE SECTION (COMPACT & ROW LAYOUT) --- */}
      <div style={{ backgroundColor: '#121820', border: '1px solid #1e293b', borderRadius: '16px', padding: '1rem', marginBottom: '1.5rem' }}>
        
        {/* Header & Tight Inline Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>
              Log & Generate <span style={{ color: '#38C2DE' }}>PR Badge</span>
            </h2>
          </div>

          {/* Ultra-Tight PR Form Inputs */}
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

        {/* PR Cards Displayed cleanly in Rows (Grid Layout) */}
        {savedPRs.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '0.85rem', width: '100%' }}>
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
                }}
              >
                {/* Delete Badge Button */}
                <button
                  onClick={() => handleDeletePR(pr.id)}
                  style={{ position: 'absolute', top: '6px', right: '8px', background: 'none', border: 'none', color: '#64748b', fontSize: '1.1rem', cursor: 'pointer', lineHeight: 1 }}
                  title="Remove Badge"
                >
                  ×
                </button>

                {/* Card Header Details */}
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '0.1rem' }}>
                    {pr.name}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {pr.liftName} Personal Record
                  </div>

                  {/* Weight Callout */}
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#38C2DE', margin: '0.1rem 0' }}>
                    {pr.weight} <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#94a3b8' }}>lbs</span>
                  </div>
                </div>

                {/* Scaled & Compact Barbell Visualizer */}
                <div style={{ backgroundColor: '#121820', border: '1px solid #1e293b', borderRadius: '6px', padding: '0.2rem', margin: '0.35rem 0', display: 'flex', justifyContent: 'center', alignItems: 'center', overflowX: 'auto' }}>
                  <BarbellGraphic plates={pr.platesOneSide} compact={true} />
                </div>

                {/* Message Right Under Barbell */}
                <div style={{ backgroundColor: 'rgba(56, 194, 222, 0.08)', borderLeft: '3px solid #38C2DE', padding: '0.35rem 0.5rem', borderRadius: '0 5px 5px 0', fontSize: '0.7rem', fontStyle: 'italic', color: '#e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                  <span>"Madison helped me achieve this!"</span>
                  <span style={{ fontSize: '0.58rem', color: '#64748b', fontStyle: 'normal' }}>{pr.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}