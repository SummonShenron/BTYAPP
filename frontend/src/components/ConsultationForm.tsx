import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8005';

interface ConsultationFormProps {
  initialProgram?: string;
}

export const ConsultationForm: React.FC<ConsultationFormProps> = ({ initialProgram }) => {
  const location = useLocation();

  const navSelectedProgram = (location.state as { selectedProgram?: string })?.selectedProgram;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    program: initialProgram || navSelectedProgram || '1-on-1 Private Coaching',
    goals: ''
  });

  useEffect(() => {
    if (navSelectedProgram) {
      setFormData((prev) => ({ ...prev, program: navSelectedProgram }));
    }
  }, [navSelectedProgram]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
        const response = await fetch(`${API_URL}/api/consultation`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        });

        if (response.ok) {
        alert('Thank you! Madison will be in touch shortly.');
        setFormData({
            name: '',
            email: '',
            program: '1-on-1 Private Coaching',
            goals: ''
        });
        } else {
        alert('Submission failed. Please try again.');
        }
    } catch (error) {
        console.error('Error submitting consultation:', error);
    }
    };

  return (
    <section id="consultation" className="form-section">
      <div className="form-container query-card">
        <h2 className="section-title text-center">Start Your Journey</h2>
        <p className="form-subtitle text-center">Book your free consultation today.</p>
        
        <form onSubmit={handleSubmit} className="consultation-form space-y-4">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input 
              type="text" 
              id="name" 
              className="styled-input"
              placeholder="Alex Johnson"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              className="styled-input"
              placeholder="alex@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="program">Selected Interest / Program</label>
            <select
              id="program"
              className="styled-input"
              value={formData.program}
              onChange={(e) => setFormData({ ...formData, program: e.target.value })}
            >
              <option value="1-on-1 Private Coaching">1-on-1 Private Coaching</option>
              <option value="Online Hybrid Fitness">Online Hybrid Fitness</option>
              <option value="Nutrition & Macro Strategy">Nutrition & Macro Strategy</option>
              <option value="General Consultation">General Consultation</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="goals">Primary Fitness Goals</label>
            <textarea 
              id="goals" 
              className="styled-input"
              rows={4}
              placeholder="Tell us about your fitness goals or injury history..."
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              required
            ></textarea>
          </div>

          <button type="submit" className="btn-neon-primary full-width-btn">
            Submit Request
          </button>
        </form>
      </div>
    </section>
  );
};

export default ConsultationForm;