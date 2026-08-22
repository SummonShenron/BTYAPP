import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { reportFrontendError } from '../utils/errorReporter';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8005';

interface ConsultationFormProps {
  initialProgram?: string;
  contentOverrides?: Record<string, string>;
}

const defaults: Record<string, string> = {
  consultation_form_title: 'Start Your Journey',
  consultation_form_subtitle: 'Book your free consultation today.',
  consultation_form_label_name: 'Full Name',
  consultation_form_placeholder_name: 'Alex Johnson',
  consultation_form_label_email: 'Email Address',
  consultation_form_placeholder_email: 'alex@example.com',
  consultation_form_label_program: 'Selected Interest / Program',
  consultation_form_option_1: '1-on-1 Private Coaching',
  consultation_form_option_2: 'Online Hybrid Fitness',
  consultation_form_option_3: 'General Consultation',
  consultation_form_default_program: '1-on-1 Private Coaching',
  consultation_form_label_goals: 'Primary Fitness Goals',
  consultation_form_placeholder_goals: 'Tell us about your fitness goals or injury history...',
  consultation_form_submit_label: 'Submit Request',
  consultation_form_success_alert: 'Thank you! Madison will be in touch shortly.',
  consultation_form_error_alert: 'Submission failed. Please try again.',
  consultation_form_network_alert: 'Unable to reach the server. Please check your connection.',
};

export const ConsultationForm: React.FC<ConsultationFormProps> = ({ initialProgram, contentOverrides }) => {
  const location = useLocation();
  const content = {
    ...defaults,
    ...(contentOverrides || {}),
  };

  const navSelectedProgram = (location.state as { selectedProgram?: string })?.selectedProgram;

  const fallbackProgram = content.consultation_form_default_program || defaults.consultation_form_default_program;

  const programOptions = [
    content.consultation_form_option_1,
    content.consultation_form_option_2,
    content.consultation_form_option_3,
  ].filter(Boolean);

  const normalizedInitialProgram =
    initialProgram || navSelectedProgram || fallbackProgram;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    program: normalizedInitialProgram,
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
        alert(content.consultation_form_success_alert);
        setFormData({
            name: '',
            email: '',
          program: fallbackProgram,
            goals: ''
        });
        } else {
        reportFrontendError(`Consultation submission failed with status ${response.status}`, {
          source: 'contact_form',
          status: response.status,
        });
        alert(content.consultation_form_error_alert);
        }
    } catch (error) {
        console.error('Error submitting consultation:', error);
        reportFrontendError(error, { source: 'contact_form' });
        alert(content.consultation_form_network_alert);
    }
    };

  return (
    <section id="consultation" className="form-section">
      <div className="form-container query-card">
        <h2 className="section-title text-center">{content.consultation_form_title}</h2>
        <p className="form-subtitle text-center">{content.consultation_form_subtitle}</p>
        
        <form onSubmit={handleSubmit} className="consultation-form space-y-4">
          <div className="form-group">
            <label htmlFor="name">{content.consultation_form_label_name}</label>
            <input 
              type="text" 
              id="name" 
              className="styled-input"
              placeholder={content.consultation_form_placeholder_name}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">{content.consultation_form_label_email}</label>
            <input 
              type="email" 
              id="email" 
              className="styled-input"
              placeholder={content.consultation_form_placeholder_email}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="program">{content.consultation_form_label_program}</label>
            <select
              id="program"
              className="styled-input"
              value={formData.program}
              onChange={(e) => setFormData({ ...formData, program: e.target.value })}
            >
              {programOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="goals">{content.consultation_form_label_goals}</label>
            <textarea 
              id="goals" 
              className="styled-input"
              rows={4}
              placeholder={content.consultation_form_placeholder_goals}
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              required
            ></textarea>
          </div>

          <button type="submit" className="btn-neon-primary full-width-btn">
            {content.consultation_form_submit_label}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ConsultationForm;