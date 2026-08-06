// pages/BookSession.tsx
import React, { useEffect, useMemo, useState } from 'react';
import './__styles__/BookSession.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8005';

const sessionTypes = [
  {
    id: 'consultation',
    title: 'Free Fitness Consultation',
    duration: '30 min',
    duration_minutes: 30,
    description: 'Goals review, movement overview, and next-step planning.',
  },
  {
    id: '1on1',
    title: '1-on-1 Personal Training',
    duration: '60 min',
    duration_minutes: 60,
    description: 'Private in-person strength and biomechanics session.',
  },
  {
    id: 'online',
    title: 'Online Coaching Intake',
    duration: '45 min',
    duration_minutes: 45,
    description: 'Virtual check-in to set up your coaching plan.',
  },
];

interface Slot {
  date: string;
  weekday: number;
  weekday_label: string;
  day_label: string;
  start_time: string;
  end_time: string;
  label: string;
  timezone: string;
  slot_key: string;
  is_booked: boolean;
}

interface BookingFormState {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

function groupSlotsByDate(slots: Slot[]) {
  return slots.reduce<Record<string, Slot[]>>((accumulator, slot) => {
    if (!accumulator[slot.date]) {
      accumulator[slot.date] = [];
    }
    accumulator[slot.date].push(slot);
    return accumulator;
  }, {});
}

export default function BookSession() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [selectedSessionType, setSelectedSessionType] = useState(sessionTypes[0].id);
  const [selectedSlotKey, setSelectedSlotKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState<BookingFormState>({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  const selectedSession = sessionTypes.find((session) => session.id === selectedSessionType) || sessionTypes[0];

  useEffect(() => {
    let active = true;

    const loadSlots = async () => {
      try {
        setLoadingSlots(true);
        setSlotError(null);

        const response = await fetch(
          `${API_URL}/api/schedule/slots?days=21&duration_minutes=${selectedSession.duration_minutes}`
        );
        if (!response.ok) {
          throw new Error(`Unable to load schedule slots (${response.status})`);
        }

        const data = await response.json();
        const incomingSlots: Slot[] = (data.slots || []).filter((slot: Slot) => !slot.is_booked);

        if (!active) {
          return;
        }

        setSlots(incomingSlots);
        setSelectedSlotKey((current) => {
          const existing = incomingSlots.find((slot) => slot.slot_key === current);
          return existing ? current : incomingSlots[0]?.slot_key || '';
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load schedule slots.';
        if (active) {
          setSlotError(message);
        }
      } finally {
        if (active) {
          setLoadingSlots(false);
        }
      }
    };

    loadSlots();
    return () => {
      active = false;
    };
  }, [selectedSession.duration_minutes]);

  const selectedSlot = slots.find((slot) => slot.slot_key === selectedSlotKey) || null;
  const groupedSlots = useMemo(() => groupSlotsByDate(slots), [slots]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSlot) {
      setSubmitError('Please choose an available time slot.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          session_type: selectedSessionType,
          preferred_date: selectedSlot.date,
          preferred_time: selectedSlot.start_time,
          preferred_slot_start: selectedSlot.start_time,
          preferred_slot_end: selectedSlot.end_time,
          preferred_slot_label: selectedSlot.label,
          timezone: selectedSlot.timezone,
          notes: formData.notes,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Booking request failed.');
      }

      setIsSubmitted(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to submit booking request.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="book-session-page book-session-page--success">
        <div className="book-session-panel book-session-panel--success">
          <span className="book-session-kicker">Request Sent</span>
          <h1 className="book-session-title">We Got It</h1>
          <p className="book-session-copy">
            Thank you, <strong>{formData.name}</strong>. Your <strong>{selectedSession.title.toLowerCase()}</strong>{' '}
            request for <strong>{selectedSlot?.day_label}</strong> at <strong>{selectedSlot?.label}</strong> has been sent.
          </p>
          <button className="book-session-primary-button" onClick={() => setIsSubmitted(false)}>
            Book Another Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="book-session-page">
      <div className="book-session-intro">
        <span className="book-session-kicker">Free Scheduler</span>
        <h1 className="book-session-title">BOOK YOUR SESSION</h1>
        <p className="book-session-copy">
          Pick a service, choose an available time from Madison's weekly schedule, and send your request.
        </p>
      </div>

      <div className="book-session-layout">
        <div className="book-session-main-column">
          <section className="book-session-panel">
            <div>
              <span className="book-session-kicker">Step 1</span>
              <h2 className="book-session-section-title">Choose your session</h2>
            </div>

            <div className="session-type-grid">
              {sessionTypes.map((session) => {
                const isActive = session.id === selectedSessionType;
                return (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => setSelectedSessionType(session.id)}
                    className={`session-type-card ${isActive ? 'session-type-card--active' : ''}`}
                  >
                    <div className="session-type-title">{session.title}</div>
                    <div className="session-type-duration">{session.duration}</div>
                    <p className="session-type-copy">{session.description}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="book-session-panel">
            <div>
              <span className="book-session-kicker">Step 2</span>
              <h2 className="book-session-section-title">Choose an available day</h2>
            </div>

            {loadingSlots ? (
              <div className="book-session-status">Loading Madison's recurring schedule...</div>
            ) : slotError ? (
              <div className="book-session-status book-session-status--error">{slotError}</div>
            ) : Object.keys(groupedSlots).length === 0 ? (
              <div className="book-session-status">
                No open slots found. Madison can open more recurring blocks in the admin schedule.
              </div>
            ) : (
              <div className="slot-day-list">
                {Object.entries(groupedSlots).map(([date, daySlots]) => {
                  const firstSlot = daySlots[0];
                  return (
                    <div key={date} className="slot-day-card">
                      <div className="slot-day-card__header">
                        <div>
                          <div className="book-session-kicker">{firstSlot.weekday_label}</div>
                          <div className="slot-day-card__title">{firstSlot.day_label}</div>
                        </div>
                        <div className="slot-day-card__count">{daySlots.length} open slots</div>
                      </div>

                      <div className="slot-grid">
                        {daySlots.map((slot) => {
                          const isActive = slot.slot_key === selectedSlotKey;
                          return (
                            <button
                              key={slot.slot_key}
                              type="button"
                              onClick={() => setSelectedSlotKey(slot.slot_key)}
                              className={`slot-chip ${isActive ? 'slot-chip--active' : ''}`}
                            >
                              <div className="slot-chip__label">{slot.label}</div>
                              <div className="slot-chip__timezone">{slot.timezone}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <div className="book-session-panel book-session-sidebar">
          <div>
            <span className="book-session-kicker">Step 3</span>
            <h2 className="book-session-section-title">Send booking request</h2>
          </div>

          <div className="booking-summary">
            Selected: <strong>{selectedSession.title}</strong>
            {selectedSlot ? (
              <>
                {' '}
                on <strong>{selectedSlot.weekday_label}, {selectedSlot.day_label}</strong> at{' '}
                <strong>{selectedSlot.label}</strong>
              </>
            ) : (
              <span className="booking-summary__warning"> No time selected yet.</span>
            )}
          </div>

          {submitError && <div className="book-session-status book-session-status--error">{submitError}</div>}

          <form className="book-session-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="book-session-label">
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                required
                className="styled-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="book-session-label">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                required
                className="styled-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="book-session-label">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                className="styled-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes" className="book-session-label">
                Goals / Notes
              </label>
              <textarea
                id="notes"
                rows={4}
                className="styled-input"
                placeholder="Tell Madison briefly about your current routine, injuries, or goals..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <button type="submit" className="book-session-primary-button book-session-primary-button--full" disabled={isSubmitting || !selectedSlot}>
              {isSubmitting ? 'Sending Request...' : 'Confirm Booking Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
