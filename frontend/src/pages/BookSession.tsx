// pages/BookSession.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { reportFrontendError } from '../utils/errorReporter';
import './__styles__/BookSession.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8005';

const defaultBookContent: Record<string, string> = {
  book_kicker: 'Free Scheduler',
  book_title: 'BOOK YOUR SESSION',
  book_subtitle: "Pick a service, choose an available time from Madison's weekly schedule, and send your request.",
  book_step_1_kicker: 'Step 1',
  book_step_1_title: 'Choose your session',
  book_session_consultation_title: 'Free Fitness Consultation',
  book_session_consultation_duration: '30 min',
  book_session_consultation_description: 'Goals review, movement overview, and next-step planning.',
  book_session_1on1_title: '1-on-1 Personal Training',
  book_session_1on1_duration: '60 min',
  book_session_1on1_description: 'Private in-person strength and biomechanics session.',
  book_session_online_title: 'Online Coaching Intake',
  book_session_online_duration: '45 min',
  book_session_online_description: 'Virtual check-in to set up your coaching plan.',
  book_step_2_kicker: 'Step 2',
  book_step_2_title: 'Choose an available day',
  book_loading_slots_text: "Loading Madison's recurring schedule...",
  book_no_slots_text: 'No open slots found. Madison can open more recurring blocks in the admin schedule.',
  book_open_slots_suffix: 'open slots',
  book_step_3_kicker: 'Step 3',
  book_step_3_title: 'Send booking request',
  book_summary_prefix: 'Selected:',
  book_summary_joiner: 'on',
  book_summary_at: 'at',
  book_summary_no_time: 'No time selected yet.',
  book_label_name: 'Full Name *',
  book_label_email: 'Email Address *',
  book_label_phone: 'Phone Number',
  book_label_notes: 'Goals / Notes',
  book_notes_placeholder: 'Tell Madison briefly about your current routine, injuries, or goals...',
  book_submit_loading: 'Sending Request...',
  book_submit_label: 'Confirm Booking Request',
  book_success_kicker: 'Request Sent',
  book_success_title: 'We Got It',
  book_success_intro: 'Thank you',
  book_success_outro: 'has been sent.',
  book_success_button_label: 'Book Another Session',
};

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

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, offset: number) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
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
  const [bookContent, setBookContent] = useState<Record<string, string>>(defaultBookContent);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [selectedSessionType, setSelectedSessionType] = useState('consultation');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlotKey, setSelectedSlotKey] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(() => getMonthStart(new Date()));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState<BookingFormState>({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  const sessionTypes = useMemo(
    () => [
      {
        id: 'consultation',
        title: bookContent.book_session_consultation_title,
        duration: bookContent.book_session_consultation_duration,
        duration_minutes: 30,
        description: bookContent.book_session_consultation_description,
      },
      {
        id: '1on1',
        title: bookContent.book_session_1on1_title,
        duration: bookContent.book_session_1on1_duration,
        duration_minutes: 60,
        description: bookContent.book_session_1on1_description,
      },
      {
        id: 'online',
        title: bookContent.book_session_online_title,
        duration: bookContent.book_session_online_duration,
        duration_minutes: 45,
        description: bookContent.book_session_online_description,
      },
    ],
    [bookContent]
  );

  const selectedSession = sessionTypes.find((session) => session.id === selectedSessionType) || sessionTypes[0];

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
        setBookContent({
          ...defaultBookContent,
          ...items,
        });
      } catch {
        // Keep defaults if content endpoint is unavailable.
      }
    };

    void loadContent();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    let active = true;

    const loadSlots = async () => {
      try {
        setLoadingSlots(true);
        setSlotError(null);

        const response = await fetch(
          `${API_URL}/api/schedule/slots?duration_minutes=${selectedSession.duration_minutes}`
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
        setSelectedDate('');
        setSelectedSlotKey('');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load schedule slots.';
        reportFrontendError(error, { source: 'availability_api', duration_minutes: selectedSession.duration_minutes });
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
  const availableDates = useMemo(() => Array.from(new Set(slots.map((slot) => slot.date))).sort(), [slots]);
  const selectedDateSlots = useMemo(
    () => (selectedDate ? slots.filter((slot) => slot.date === selectedDate) : []),
    [selectedDate, slots]
  );

  useEffect(() => {
    if (!selectedDate || !availableDates.includes(selectedDate)) {
      setSelectedDate('');
      setSelectedSlotKey('');
    }
  }, [availableDates, selectedDate]);

  useEffect(() => {
    if (!selectedDate) {
      setSelectedSlotKey('');
      return;
    }

    const isCurrentSlotValid = slots.some(
      (slot) => slot.date === selectedDate && slot.slot_key === selectedSlotKey
    );
    if (!isCurrentSlotValid) {
      setSelectedSlotKey('');
    }
  }, [selectedDate, selectedSlotKey, slots]);

  const calendarDays = useMemo(() => {
    const monthStart = getMonthStart(calendarMonth);
    const firstDayIndex = (monthStart.getDay() + 6) % 7;
    const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();

    const dayNumbers = Array.from({ length: daysInMonth }, (_, index) => index + 1);

    const cells: Array<{
      key: string;
      dateKey: string;
      day: number | null;
      isCurrentMonth: boolean;
      isAvailable: boolean;
      isSelected: boolean;
      isDisabled: boolean;
    }> = [];

    for (let i = 0; i < firstDayIndex; i += 1) {
      cells.push({
        key: `empty-${i}`,
        dateKey: '',
        day: null,
        isCurrentMonth: false,
        isAvailable: false,
        isSelected: false,
        isDisabled: true,
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
      const dateKey = formatDateKey(date);
      const isAvailable = availableDates.includes(dateKey);
      cells.push({
        key: dateKey,
        dateKey,
        day,
        isCurrentMonth: true,
        isAvailable,
        isSelected: selectedDate === dateKey,
        isDisabled: !isAvailable,
      });
    }

    while (cells.length % 7 !== 0) {
      cells.push({
        key: `tail-${cells.length}`,
        dateKey: '',
        day: null,
        isCurrentMonth: false,
        isAvailable: false,
        isSelected: false,
        isDisabled: true,
      });
    }

    return cells;
  }, [availableDates, calendarMonth, selectedDate]);

  const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleDateSelection = (dateKey: string) => {
    if (!availableDates.includes(dateKey)) {
      return;
    }
    setSelectedDate(dateKey);
    setSelectedSlotKey('');
  };

  const handleResetToCalendar = () => {
    setSelectedDate('');
    setSelectedSlotKey('');
  };

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
      reportFrontendError(error, { source: 'booking_submission', session_type: selectedSessionType });
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="book-session-page book-session-page--success">
        <div className="book-session-panel book-session-panel--success">
          <span className="book-session-kicker">{bookContent.book_success_kicker}</span>
          <h1 className="book-session-title">{bookContent.book_success_title}</h1>
          <p className="book-session-copy">
            {bookContent.book_success_intro}, <strong>{formData.name}</strong>. Your <strong>{selectedSession.title.toLowerCase()}</strong>{' '}
            request for <strong>{selectedSlot?.day_label}</strong> at <strong>{selectedSlot?.label}</strong> {bookContent.book_success_outro}
          </p>
          <button className="book-session-primary-button" onClick={() => setIsSubmitted(false)}>
            {bookContent.book_success_button_label}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="book-session-page">
      <div className="book-session-intro">
        <span className="book-session-kicker">{bookContent.book_kicker}</span>
        <h1 className="book-session-title">{bookContent.book_title}</h1>
        <p className="book-session-copy">
          {bookContent.book_subtitle}
        </p>
      </div>

      <div className="book-session-layout">
        <div className="book-session-main-column">
          <section className="book-session-panel">
            <div>
              <span className="book-session-kicker">{bookContent.book_step_1_kicker}</span>
              <h2 className="book-session-section-title">{bookContent.book_step_1_title}</h2>
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
              <span className="book-session-kicker">{bookContent.book_step_2_kicker}</span>
              <h2 className="book-session-section-title">{bookContent.book_step_2_title}</h2>
            </div>

            {loadingSlots ? (
              <div className="book-session-status">{bookContent.book_loading_slots_text}</div>
            ) : slotError ? (
              <div className="book-session-status book-session-status--error">{slotError}</div>
            ) : selectedDate ? (
              <div className="slot-day-list">
                <div className="slot-day-card">
                  <div className="slot-day-card__header">
                    <div>
                      <div className="book-session-kicker">
                        {new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="slot-day-card__title">
                        {new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>

                    <button type="button" className="calendar-back-button" onClick={handleResetToCalendar}>
                      Back to calendar
                    </button>
                  </div>

                  <div className="slot-grid">
                    {selectedDateSlots.map((slot) => {
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
              </div>
            ) : Object.keys(groupedSlots).length === 0 ? (
              <div className="book-session-status">
                {bookContent.book_no_slots_text}
              </div>
            ) : (
              <div className="calendar-shell">
                <div className="calendar-header">
                  <button
                    type="button"
                    className="calendar-nav-button"
                    onClick={() => setCalendarMonth((current) => addMonths(current, -1))}
                  >
                    ←
                  </button>
                  <div className="calendar-month-label">
                    {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                  <button
                    type="button"
                    className="calendar-nav-button"
                    onClick={() => setCalendarMonth((current) => addMonths(current, 1))}
                  >
                    →
                  </button>
                </div>

                <div className="calendar-weekdays">
                  {weekdayLabels.map((weekday) => (
                    <div key={weekday} className="calendar-weekday">
                      {weekday}
                    </div>
                  ))}
                </div>

                <div className="calendar-grid">
                  {calendarDays.map((cell) => {
                    if (!cell.dateKey) {
                      return <div key={cell.key} className="calendar-day calendar-day--empty" />;
                    }

                    const cellDate = new Date(`${cell.dateKey}T12:00:00`);
                    const isPast = cellDate < new Date(new Date().setHours(0, 0, 0, 0));

                    return (
                      <button
                        key={cell.key}
                        type="button"
                        className={[
                          'calendar-day',
                          cell.isAvailable ? 'calendar-day--available' : 'calendar-day--disabled',
                          cell.isSelected ? 'calendar-day--selected' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => handleDateSelection(cell.dateKey)}
                        disabled={cell.isDisabled || isPast}
                      >
                        <span>{cell.day}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="book-session-panel book-session-sidebar">
          <div>
            <span className="book-session-kicker">{bookContent.book_step_3_kicker}</span>
            <h2 className="book-session-section-title">{bookContent.book_step_3_title}</h2>
          </div>

          <div className="booking-summary">
            {bookContent.book_summary_prefix} <strong>{selectedSession.title}</strong>
            {selectedSlot ? (
              <>
                {' '}{bookContent.book_summary_joiner} <strong>{selectedSlot.weekday_label}, {selectedSlot.day_label}</strong> {bookContent.book_summary_at}{' '}
                <strong>{selectedSlot.label}</strong>
              </>
            ) : (
              <span className="booking-summary__warning"> {bookContent.book_summary_no_time}</span>
            )}
          </div>

          {submitError && <div className="book-session-status book-session-status--error">{submitError}</div>}

          <form className="book-session-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="book-session-label">
                {bookContent.book_label_name}
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
                {bookContent.book_label_email}
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
                {bookContent.book_label_phone}
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
                {bookContent.book_label_notes}
              </label>
              <textarea
                id="notes"
                rows={4}
                className="styled-input"
                placeholder={bookContent.book_notes_placeholder}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <button type="submit" className="book-session-primary-button book-session-primary-button--full" disabled={isSubmitting || !selectedSlot}>
              {isSubmitting ? bookContent.book_submit_loading : bookContent.book_submit_label}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
