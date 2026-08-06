import React, { useState } from 'react';
import btyLogo from '../assets/logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8005';

export const Book: React.FC = () => {
  const [sessionType, setSessionType] = useState('consultation');
  const [submitted, setSubmitted] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: 'morning',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
        session_type: sessionType,
        name: bookingData.name,
        email: bookingData.email,
        phone: bookingData.phone,
        preferred_date: bookingData.preferredDate,
        preferred_time: bookingData.preferredTime,
        notes: bookingData.notes,
    };

    try {
        const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        });

        if (response.ok) {
        setSubmitted(true);
        } else {
        alert('Something went wrong while submitting your request. Please try again.');
        }
    } catch (error) {
        console.error('Error submitting booking:', error);
        alert('Unable to reach the server. Please check your connection.');
    }
    };

  return (
    <div className="book-page">
      <div className="book-container">
        
        <div className="book-header text-center">
          <span className="hero-badge">SCHEDULING</span>
          <h1 className="hero-title">Book Your Session</h1>
          <p className="hero-subtitle">
            Take the first step toward being Better Than Yesterday. Select a session type below.
          </p>
        </div>

        <div className="session-selector-grid">
          <div 
            className={`query-card session-type-card ${sessionType === 'consultation' ? 'active-session' : ''}`}
            onClick={() => setSessionType('consultation')}
          >
            <h3>Free Fitness Consultation</h3>
            <p className="session-price">Free • 30 Mins</p>
            <p className="session-desc">Discuss your goals, assessment, and finding the right training program for you.</p>
          </div>

          <div 
            className={`query-card session-type-card ${sessionType === '1on1' ? 'active-session' : ''}`}
            onClick={() => setSessionType('1on1')}
          >
            <h3>1-on-1 Personal Training</h3>
            <p className="session-price">$150 • 60 Mins</p>
            <p className="session-desc">In-person private strength & biomechanics training with Madison.</p>
          </div>

          <div 
            className={`query-card session-type-card ${sessionType === 'online' ? 'active-session' : ''}`}
            onClick={() => setSessionType('online')}
          >
            <h3>Online Coaching Intake</h3>
            <p className="session-price">Custom • 45 Mins</p>
            <p className="session-desc">Virtual walkthrough of your custom workout protocols and coaching roadmap.</p>
          </div>
        </div>

        <div className="booking-form-wrapper query-card">
          {submitted ? (
            <div className="booking-success text-center">
              <div className="chat-input-wrapper success-logo-container">
                <img src={btyLogo} alt="BTY Fitness" className="success-logo" />
              </div>
              <h2>Request Received!</h2>
              <p>Thank you, <strong>{bookingData.name}</strong>. Madison will review your request for a <strong>{sessionType}</strong> session and confirm via email shortly.</p>
              <button 
                className="enter-btn" 
                onClick={() => { setSubmitted(false); }}
                style={{ marginTop: '1.5rem' }}
              >
                Book Another Session
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="booking-form">
              <h2 className="section-title">Session Details</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input 
                    type="text" 
                    id="name"
                    required
                    className="styled-input"
                    value={bookingData.name}
                    onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input 
                    type="email" 
                    id="email"
                    required
                    className="styled-input"
                    value={bookingData.email}
                    onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input 
                    type="tel" 
                    id="phone"
                    className="styled-input"
                    value={bookingData.phone}
                    onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="date">Preferred Date *</label>
                  <input 
                    type="date" 
                    id="date"
                    required
                    className="styled-input"
                    value={bookingData.preferredDate}
                    onChange={(e) => setBookingData({ ...bookingData, preferredDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="time">Preferred Time of Day</label>
                <select 
                  id="time"
                  className="styled-input"
                  value={bookingData.preferredTime}
                  onChange={(e) => setBookingData({ ...bookingData, preferredTime: e.target.value })}
                >
                  <option value="morning">Morning (8am - 12pm)</option>
                  <option value="afternoon">Afternoon (12pm - 4pm)</option>
                  <option value="evening">Evening (4pm - 8pm)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Current Fitness Experience / Special Requests</label>
                <textarea 
                  id="notes"
                  rows={3}
                  className="styled-input"
                  placeholder="Tell Madison briefly about your current routine or injuries..."
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                />
              </div>

              <button type="submit" className="enter-btn full-width-btn">
                Confirm Booking Request
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default Book;