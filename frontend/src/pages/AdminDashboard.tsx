import React, { useState, useEffect } from 'react';
import { useAuth, UserButton } from '@clerk/clerk-react';
import ScheduleManager from '../components/ScheduleManager';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8005';

interface Lead {
  _id: string;
  name?: string;
  full_name?: string;
  email: string;
  phone?: string;
  program?: string;
  session_type?: string;
  coaching_preference?: string;
  goals?: string;
  message?: string;
  notes?: string;
  status?: string;
  created_at?: string;
}

interface ContentResponse {
  items: Record<string, string>;
  defaults?: Record<string, string>;
  updated_at?: string;
}

type ContentSectionId =
  | 'hero'
  | 'about'
  | 'home_programs'
  | 'book'
  | 'programs_page'
  | 'consultation'
  | 'about_page'
  | 'qualifications'
  | 'testimonials'
  | 'merch';

const contentFieldLabels: Record<string, string> = {
  hero_badge: 'Hero Badge',
  hero_title_line_1: 'Hero Title Line 1',
  hero_title_accent: 'Hero Title Accent',
  hero_subtitle_1: 'Hero Subtitle 1',
  hero_subtitle_2: 'Hero Subtitle 2',
  hero_subtitle_3: 'Hero Subtitle 3',
  hero_subtitle_4: 'Hero Subtitle 4',
  hero_primary_cta_label: 'Hero Primary CTA Label',
  hero_secondary_cta_label: 'Hero Secondary CTA Label',
  hero_sidebar_status: 'Hero Sidebar Status',
  hero_sidebar_title: 'Hero Sidebar Title',
  hero_sidebar_text: 'Hero Sidebar Text',
  about_title: 'About Title',
  about_paragraph_1: 'About Paragraph 1',
  about_paragraph_2: 'About Paragraph 2',
  about_paragraph_3: 'About Paragraph 3',
  about_cta_story_label: 'About CTA Story Label',
  about_cta_credentials_label: 'About CTA Credentials Label',
  programs_kicker: 'Programs Kicker',
  programs_title: 'Programs Title',
  programs_subtitle: 'Programs Subtitle',
  program_card_1_title: 'Program Card 1 Title',
  program_card_1_description: 'Program Card 1 Description',
  program_card_2_title: 'Program Card 2 Title',
  program_card_2_description: 'Program Card 2 Description',
  program_card_3_title: 'Program Card 3 Title',
  program_card_3_description: 'Program Card 3 Description',
  program_feature_badge: 'Program Feature Badge',
  program_feature_title_line_1: 'Program Feature Title Line 1',
  program_feature_title_line_2: 'Program Feature Title Line 2',
  program_feature_description: 'Program Feature Description',
  program_feature_cta_label: 'Program Feature CTA Label',
  book_kicker: 'Book Page Kicker',
  book_title: 'Book Page Title',
  book_subtitle: 'Book Page Subtitle',
  book_step_1_kicker: 'Book Step 1 Kicker',
  book_step_1_title: 'Book Step 1 Title',
  book_session_consultation_title: 'Book Consultation Card Title',
  book_session_consultation_duration: 'Book Consultation Card Duration',
  book_session_consultation_description: 'Book Consultation Card Description',
  book_session_1on1_title: 'Book 1-on-1 Card Title',
  book_session_1on1_duration: 'Book 1-on-1 Card Duration',
  book_session_1on1_description: 'Book 1-on-1 Card Description',
  book_session_online_title: 'Book Online Card Title',
  book_session_online_duration: 'Book Online Card Duration',
  book_session_online_description: 'Book Online Card Description',
  book_step_2_kicker: 'Book Step 2 Kicker',
  book_step_2_title: 'Book Step 2 Title',
  book_loading_slots_text: 'Book Loading Slots Text',
  book_no_slots_text: 'Book No Slots Text',
  book_open_slots_suffix: 'Book Open Slots Suffix',
  book_step_3_kicker: 'Book Step 3 Kicker',
  book_step_3_title: 'Book Step 3 Title',
  book_summary_prefix: 'Book Summary Prefix',
  book_summary_joiner: 'Book Summary Joiner',
  book_summary_at: 'Book Summary At',
  book_summary_no_time: 'Book Summary No Time Text',
  book_label_name: 'Book Name Label',
  book_label_email: 'Book Email Label',
  book_label_phone: 'Book Phone Label',
  book_label_notes: 'Book Notes Label',
  book_notes_placeholder: 'Book Notes Placeholder',
  book_submit_loading: 'Book Submit Loading Label',
  book_submit_label: 'Book Submit Label',
  book_success_kicker: 'Book Success Kicker',
  book_success_title: 'Book Success Title',
  book_success_intro: 'Book Success Intro',
  book_success_outro: 'Book Success Outro',
  book_success_button_label: 'Book Success Button Label',
  programs_page_kicker: 'Programs Page Kicker',
  programs_page_title: 'Programs Page Title',
  programs_page_subtitle: 'Programs Page Subtitle',
  programs_page_popular_badge: 'Programs Popular Badge',
  programs_page_card_1_badge: 'Programs Card 1 Badge',
  programs_page_card_1_title: 'Programs Card 1 Title',
  programs_page_card_1_tagline: 'Programs Card 1 Tagline',
  programs_page_card_1_description: 'Programs Card 1 Description',
  programs_page_card_1_features: 'Programs Card 1 Features (one per line)',
  programs_page_card_1_cta_label: 'Programs Card 1 CTA Label',
  programs_page_card_2_badge: 'Programs Card 2 Badge',
  programs_page_card_2_title: 'Programs Card 2 Title',
  programs_page_card_2_tagline: 'Programs Card 2 Tagline',
  programs_page_card_2_description: 'Programs Card 2 Description',
  programs_page_card_2_features: 'Programs Card 2 Features (one per line)',
  programs_page_card_2_cta_label: 'Programs Card 2 CTA Label',
  programs_page_card_3_badge: 'Programs Card 3 Badge',
  programs_page_card_3_title: 'Programs Card 3 Title',
  programs_page_card_3_tagline: 'Programs Card 3 Tagline',
  programs_page_card_3_description: 'Programs Card 3 Description',
  programs_page_card_3_features: 'Programs Card 3 Features (one per line)',
  programs_page_card_3_cta_label: 'Programs Card 3 CTA Label',
  consultation_kicker: 'Consultation Kicker',
  consultation_title: 'Consultation Title',
  consultation_subtitle: 'Consultation Subtitle',
  consultation_what_next_title: 'Consultation What Next Title',
  consultation_step_1_title: 'Consultation Step 1 Title',
  consultation_step_1_description: 'Consultation Step 1 Description',
  consultation_step_2_title: 'Consultation Step 2 Title',
  consultation_step_2_description: 'Consultation Step 2 Description',
  consultation_step_3_title: 'Consultation Step 3 Title',
  consultation_step_3_description: 'Consultation Step 3 Description',
  consultation_quote_text: 'Consultation Quote Text',
  consultation_quote_author: 'Consultation Quote Author',
  consultation_local_kicker: 'Consultation Local Kicker',
  consultation_local_intro: 'Consultation Local Intro',
  consultation_local_location_title: 'Consultation Local Location Title',
  consultation_local_location_name: 'Consultation Local Location Name',
  consultation_local_location_address: 'Consultation Local Location Address',
  consultation_local_service_title: 'Consultation Local Service Title',
  consultation_local_service_areas: 'Consultation Local Service Areas',
  consultation_form_title: 'Consultation Form Title',
  consultation_form_subtitle: 'Consultation Form Subtitle',
  consultation_form_label_name: 'Consultation Form Name Label',
  consultation_form_placeholder_name: 'Consultation Form Name Placeholder',
  consultation_form_label_email: 'Consultation Form Email Label',
  consultation_form_placeholder_email: 'Consultation Form Email Placeholder',
  consultation_form_label_program: 'Consultation Form Program Label',
  consultation_form_option_1: 'Consultation Form Option 1',
  consultation_form_option_2: 'Consultation Form Option 2',
  consultation_form_option_3: 'Consultation Form Option 3',
  consultation_form_default_program: 'Consultation Form Default Program',
  consultation_form_label_goals: 'Consultation Form Goals Label',
  consultation_form_placeholder_goals: 'Consultation Form Goals Placeholder',
  consultation_form_submit_label: 'Consultation Form Submit Label',
  consultation_form_success_alert: 'Consultation Form Success Message',
  consultation_form_error_alert: 'Consultation Form Error Message',
  consultation_form_network_alert: 'Consultation Form Network Message',
  about_page_kicker: 'About Page Kicker',
  about_page_title: 'About Page Title',
  about_page_subtitle: 'About Page Subtitle',
  about_page_section_title: 'About Page Section Title',
  about_page_paragraph_1: 'About Page Paragraph 1',
  about_page_paragraph_2: 'About Page Paragraph 2',
  about_page_cta_qualifications: 'About Page CTA Qualifications',
  about_page_cta_testimonials: 'About Page CTA Testimonials',
  about_page_pillar_1_title: 'About Page Pillar 1 Title',
  about_page_pillar_1_text: 'About Page Pillar 1 Text',
  about_page_pillar_2_title: 'About Page Pillar 2 Title',
  about_page_pillar_2_text: 'About Page Pillar 2 Text',
  about_page_pillar_3_title: 'About Page Pillar 3 Title',
  about_page_pillar_3_text: 'About Page Pillar 3 Text',
  qualifications_kicker: 'Qualifications Kicker',
  qualifications_title: 'Qualifications Title',
  qualifications_subtitle: 'Qualifications Subtitle',
  qualifications_item_1_title: 'Qualifications Item 1 Title',
  qualifications_item_1_detail: 'Qualifications Item 1 Detail',
  qualifications_item_1_year: 'Qualifications Item 1 Year',
  qualifications_item_2_title: 'Qualifications Item 2 Title',
  qualifications_item_2_detail: 'Qualifications Item 2 Detail',
  qualifications_item_2_year: 'Qualifications Item 2 Year',
  qualifications_item_3_title: 'Qualifications Item 3 Title',
  qualifications_item_3_detail: 'Qualifications Item 3 Detail',
  qualifications_item_3_year: 'Qualifications Item 3 Year',
  qualifications_item_4_title: 'Qualifications Item 4 Title',
  qualifications_item_4_detail: 'Qualifications Item 4 Detail',
  qualifications_item_4_year: 'Qualifications Item 4 Year',
  qualifications_item_5_title: 'Qualifications Item 5 Title',
  qualifications_item_5_detail: 'Qualifications Item 5 Detail',
  qualifications_item_5_year: 'Qualifications Item 5 Year',
  qualifications_method_title: 'Qualifications Method Title',
  qualifications_highlight_1: 'Qualifications Highlight 1',
  qualifications_highlight_2: 'Qualifications Highlight 2',
  qualifications_highlight_3: 'Qualifications Highlight 3',
  qualifications_cta_back: 'Qualifications CTA Back',
  qualifications_cta_book: 'Qualifications CTA Book',
  testimonials_kicker: 'Testimonials Kicker',
  testimonials_title: 'Testimonials Title',
  testimonials_subtitle: 'Testimonials Subtitle',
  testimonials_item_1_quote: 'Testimonial 1 Quote',
  testimonials_item_1_name: 'Testimonial 1 Name',
  testimonials_item_1_role: 'Testimonial 1 Role',
  testimonials_item_2_quote: 'Testimonial 2 Quote',
  testimonials_item_2_name: 'Testimonial 2 Name',
  testimonials_item_2_role: 'Testimonial 2 Role',
  testimonials_item_3_quote: 'Testimonial 3 Quote',
  testimonials_item_3_name: 'Testimonial 3 Name',
  testimonials_item_3_role: 'Testimonial 3 Role',
  testimonials_item_4_quote: 'Testimonial 4 Quote',
  testimonials_item_4_name: 'Testimonial 4 Name',
  testimonials_item_4_role: 'Testimonial 4 Role',
  testimonials_cta_title: 'Testimonials CTA Title',
  testimonials_cta_subtitle: 'Testimonials CTA Subtitle',
  testimonials_cta_button: 'Testimonials CTA Button',
  merch_coming_soon_text: 'Merch Coming Soon Text',
  merch_kicker: 'Merch Kicker',
  merch_title: 'Merch Title',
  merch_subtitle: 'Merch Subtitle',
  merch_size_label: 'Merch Size Label',
  merch_buy_button_label: 'Merch Buy Button Label',
  merch_product_1_name: 'Merch Product 1 Name',
  merch_product_1_category: 'Merch Product 1 Category',
  merch_product_1_price: 'Merch Product 1 Price',
  merch_product_1_description: 'Merch Product 1 Description',
  merch_product_2_name: 'Merch Product 2 Name',
  merch_product_2_category: 'Merch Product 2 Category',
  merch_product_2_price: 'Merch Product 2 Price',
  merch_product_2_description: 'Merch Product 2 Description',
};

const contentSections: Array<{ id: ContentSectionId; label: string; matches: (key: string) => boolean }> = [
  { id: 'hero', label: 'Hero', matches: (key) => key.startsWith('hero_') },
  { id: 'about', label: 'About', matches: (key) => key.startsWith('about_') },
  {
    id: 'home_programs',
    label: 'Home Programs',
    matches: (key) =>
      key.startsWith('programs_') ||
      key.startsWith('program_card_') ||
      key.startsWith('program_feature_'),
  },
  { id: 'book', label: 'Book', matches: (key) => key.startsWith('book_') },
  { id: 'programs_page', label: 'Programs Page', matches: (key) => key.startsWith('programs_page_') },
  { id: 'consultation', label: 'Consultation', matches: (key) => key.startsWith('consultation_') },
  { id: 'about_page', label: 'About Page', matches: (key) => key.startsWith('about_page_') },
  { id: 'qualifications', label: 'Qualifications', matches: (key) => key.startsWith('qualifications_') },
  { id: 'testimonials', label: 'Testimonials', matches: (key) => key.startsWith('testimonials_') },
  { id: 'merch', label: 'Merch', matches: (key) => key.startsWith('merch_') },
];

export default function AdminDashboard() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'contacted' | 'confirmed'>('all');
  const [isContentEditorOpen, setIsContentEditorOpen] = useState(false);
  const [activeContentSection, setActiveContentSection] = useState<ContentSectionId>('hero');
  const [contentItems, setContentItems] = useState<Record<string, string>>({});
  const [contentDefaults, setContentDefaults] = useState<Record<string, string>>({});
  const [contentLoading, setContentLoading] = useState(true);
  const [contentSaving, setContentSaving] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);
  const [contentSuccess, setContentSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      setLoading(false);
      setContentLoading(false);
      return;
    }

    fetchLeads();
    fetchContent();
  }, [isLoaded, isSignedIn]);

  const getAuthTokenOrThrow = async () => {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication token unavailable. Please refresh and sign in again.');
    }
    return token;
  };

  const authedFetch = async (path: string, init?: RequestInit) => {
    const token = await getAuthTokenOrThrow();
    const isFormData = init?.body instanceof FormData;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      ...((init?.headers as Record<string, string>) || {}),
    };

    if (!isFormData && !headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/json';
    }

    let response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
    });

    if (response.status === 401) {
      const refreshedToken = await getToken({ skipCache: true });
      if (refreshedToken) {
        response = await fetch(`${API_URL}${path}`, {
          ...init,
          headers: {
            ...headers,
            Authorization: `Bearer ${refreshedToken}`,
          },
        });
      }
    }

    return response;
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await authedFetch('/api/admin/leads');

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error('Unauthorized access. Ensure you are signed in with an admin account.');
        }
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      setLeads(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load leads from database.');
    } finally {
      setLoading(false);
    }
  };

  const fetchContent = async () => {
    try {
      setContentLoading(true);
      setContentError(null);
      setContentSuccess(null);

      const res = await authedFetch('/api/admin/content');

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error('Unauthorized access. Ensure you are signed in with an admin account.');
        }
        throw new Error(`Server returned status ${res.status}`);
      }

      const data: ContentResponse = await res.json();
      const nextItems = data.items || {};
      setContentItems(nextItems);
      setContentDefaults(data.defaults || {});
    } catch (err: any) {
      setContentError(err.message || 'Failed to load content settings.');
    } finally {
      setContentLoading(false);
    }
  };


  const handleContentChange = (key: string, value: string) => {
    setContentItems((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveContent = async () => {
    try {
      setContentSaving(true);
      setContentError(null);
      setContentSuccess(null);

      const res = await authedFetch('/api/admin/content', {
        method: 'PUT',
        body: JSON.stringify({
          items: contentItems,
        }),
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error('Unauthorized access. Ensure you are signed in with an admin account.');
        }
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.detail || `Server returned status ${res.status}`);
      }

      await res.json();
      setContentSuccess('Content updated successfully.');
    } catch (err: any) {
      setContentError(err.message || 'Failed to save content settings.');
    } finally {
      setContentSaving(false);
    }
  };

  const handleResetContent = () => {
    setContentItems((prev) => ({
      ...prev,
      ...contentDefaults,
    }));
    setContentSuccess('Reset to original defaults. Click Save All to apply.');
    setContentError(null);
  };

  const handleResetContentField = (key: string) => {
    const defaultValue = contentDefaults[key] ?? '';
    setContentItems((prev) => ({
      ...prev,
      [key]: defaultValue,
    }));
    setContentSuccess(null);
    setContentError(null);
  };


  const handleStatusUpdate = async (leadId: string, newStatus: string) => {
    setLeads((prev) =>
      prev.map((lead) => (lead._id === leadId ? { ...lead, status: newStatus } : lead))
    );

    try {
      await authedFetch(`/api/admin/leads/${leadId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error('Failed to update lead status:', err);
    }
  };

  const totalLeads = leads.length;
  const pendingCount = leads.filter((l) => !l.status || l.status === 'pending').length;
  const contactedCount = leads.filter((l) => l.status === 'contacted').length;
  const confirmedCount = leads.filter((l) => l.status === 'confirmed').length;

  const filteredLeads = leads.filter((lead) => {
    const status = lead.status || 'pending';
    if (filter === 'all') return true;
    return status === filter;
  });

  const activeSection = contentSections.find((section) => section.id === activeContentSection) || contentSections[0];
  const visibleContentEntries = Object.entries(contentFieldLabels).filter(([key]) => activeSection.matches(key));

  useEffect(() => {
    (window as any).__patchy_get_token = async () => await getToken();
  }, [getToken]);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem', color: '#fff' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          background: '#141519',
          padding: '1.5rem 2rem',
          borderRadius: '16px',
          border: '1px solid #262830',
          marginBottom: '2rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>
              MADISON'S DASHBOARD
            </h1>
            <UserButton afterSignOutUrl="/" />
          </div>
          <p style={{ margin: 0, color: '#8b8f9a', fontSize: '0.85rem' }}>
            Manage client inquiries, schedule requests, and lead statuses.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={statBoxStyle}>
            <span style={{ ...statNumStyle, color: '#38C2DE' }}>{totalLeads}</span>
            <span style={statLabelStyle}>Total</span>
          </div>
          <div style={statBoxStyle}>
            <span style={{ ...statNumStyle, color: '#ffc107' }}>{pendingCount}</span>
            <span style={statLabelStyle}>Pending</span>
          </div>
          <div style={statBoxStyle}>
            <span style={{ ...statNumStyle, color: '#00ffcc' }}>{confirmedCount}</span>
            <span style={statLabelStyle}>Confirmed</span>
          </div>
        </div>
      </div>

      <div
        style={{
          background: '#141519',
          padding: '1.5rem 2rem',
          borderRadius: '16px',
          border: '1px solid #262830',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
              SITE CONTENT
            </h2>
            <p style={{ margin: '0.35rem 0 0 0', color: '#8b8f9a', fontSize: '0.85rem' }}>
              Update homepage text content without editing code.
            </p>
          </div>

          <button
            onClick={() => setIsContentEditorOpen((prev) => !prev)}
            aria-expanded={isContentEditorOpen}
            style={{
              padding: '0.6rem 1rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              borderRadius: '8px',
              background: '#0d0e11',
              border: '1px solid #38C2DE',
              color: '#38C2DE',
              cursor: 'pointer',
            }}
          >
            {isContentEditorOpen ? 'Close Editor' : 'Edit Content'}
          </button>
        </div>

        <div
          style={{
            maxHeight: isContentEditorOpen ? 'none' : '0',
            opacity: isContentEditorOpen ? 1 : 0,
            overflow: isContentEditorOpen ? 'visible' : 'hidden',
            transition: 'opacity 200ms ease',
            pointerEvents: isContentEditorOpen ? 'auto' : 'none',
          }}
        >
          <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {contentSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveContentSection(section.id)}
                style={{
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  borderRadius: '999px',
                  border:
                    activeContentSection === section.id
                      ? '1px solid #38C2DE'
                      : '1px solid #262830',
                  background: activeContentSection === section.id ? '#38C2DE' : '#0d0e11',
                  color: activeContentSection === section.id ? '#000' : '#8b8f9a',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {section.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <button
              onClick={handleResetContent}
              disabled={contentLoading || contentSaving}
              style={{
                padding: '0.6rem 1rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                borderRadius: '8px',
                background: '#0d0e11',
                border: '1px solid #262830',
                color: '#8b8f9a',
                cursor: 'pointer',
              }}
            >
              Reset
            </button>

            <button
              onClick={handleSaveContent}
              disabled={contentLoading || contentSaving}
              style={{
                padding: '0.6rem 1rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                borderRadius: '8px',
                background: '#38C2DE',
                border: '1px solid #38C2DE',
                color: '#000',
                cursor: 'pointer',
              }}
            >
              {contentSaving ? 'Saving...' : 'Save All'}
            </button>
          </div>

          {contentError && (
            <div
              style={{
                padding: '0.9rem 1rem',
                background: 'rgba(255, 77, 77, 0.1)',
                border: '1px solid #ff4d4d',
                color: '#ff4d4d',
                borderRadius: '12px',
                fontSize: '0.85rem',
                marginBottom: '1rem',
              }}
            >
              {contentError}
            </div>
          )}

          {contentSuccess && (
            <div
              style={{
                padding: '0.9rem 1rem',
                background: 'rgba(0, 255, 204, 0.08)',
                border: '1px solid #00ffcc',
                color: '#00ffcc',
                borderRadius: '12px',
                fontSize: '0.85rem',
                marginBottom: '1rem',
              }}
            >
              {contentSuccess}
            </div>
          )}

          {contentLoading ? (
            <div
              style={{
                textAlign: 'center',
                padding: '2rem',
                background: '#0d0e11',
                borderRadius: '12px',
                border: '1px solid #262830',
                color: '#8b8f9a',
              }}
            >
              Loading content fields...
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gap: '1rem',
                maxHeight: '72vh',
                overflowY: 'auto',
                paddingRight: '0.3rem',
                alignContent: 'start',
                overscrollBehavior: 'contain',
              }}
            >
              {visibleContentEntries.map(([key, label]) => {
                const currentValue = contentItems[key] || '';
                const defaultValue = contentDefaults[key] || '';
                const isDirty = currentValue !== defaultValue;
                const isLongField =
                  key.startsWith('hero_subtitle_') ||
                  key === 'hero_sidebar_text' ||
                  key.startsWith('about_paragraph_') ||
                  key === 'programs_subtitle' ||
                  key === 'consultation_subtitle' ||
                  key.startsWith('consultation_step_') ||
                  key === 'consultation_quote_text' ||
                  key.startsWith('about_page_paragraph_') ||
                  key.startsWith('qualifications_item_') ||
                  key.startsWith('qualifications_highlight_') ||
                  key.startsWith('testimonials_item_') ||
                  key.endsWith('_description') ||
                  key.endsWith('_features') ||
                  key.endsWith('_subtitle') ||
                  key.endsWith('_placeholder') ||
                  key.endsWith('_text');

                return (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.45rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                      <label
                        htmlFor={key}
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          color: '#8b8f9a',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {label}
                      </label>

                      {isDirty && (
                        <span
                          style={{
                            fontSize: '0.66rem',
                            fontWeight: 800,
                            color: '#ffc107',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          Changed
                        </span>
                      )}
                    </div>

                    {isLongField ? (
                      <textarea
                        id={key}
                        value={currentValue}
                        onChange={(event) => handleContentChange(key, event.target.value)}
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.75rem',
                          fontSize: '0.84rem',
                          color: '#fff',
                          background: '#0d0e11',
                          border: '1px solid #262830',
                          borderRadius: '10px',
                          resize: 'vertical',
                        }}
                      />
                    ) : (
                      <input
                        id={key}
                        type="text"
                        value={currentValue}
                        onChange={(event) => handleContentChange(key, event.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.75rem',
                          fontSize: '0.84rem',
                          color: '#fff',
                          background: '#0d0e11',
                          border: '1px solid #262830',
                          borderRadius: '10px',
                        }}
                      />
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => handleResetContentField(key)}
                        disabled={!isDirty}
                        style={{
                          padding: '0.25rem 0.65rem',
                          fontSize: '0.66rem',
                          fontWeight: 800,
                          borderRadius: '999px',
                          border: isDirty ? '1px solid #ffc107' : '1px solid #3a3d46',
                          background: isDirty ? 'rgba(255, 193, 7, 0.12)' : 'rgba(58, 61, 70, 0.2)',
                          color: isDirty ? '#ffc107' : '#6e7380',
                          cursor: isDirty ? 'pointer' : 'not-allowed',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        Revert Field
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <ScheduleManager />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {(['all', 'pending', 'contacted', 'confirmed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                borderRadius: '8px',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s',
                border: filter === tab ? '1px solid #38C2DE' : '1px solid #262830',
                background: filter === tab ? '#38C2DE' : '#141519',
                color: filter === tab ? '#000' : '#8b8f9a',
              }}
            >
              {tab} ({tab === 'all' ? totalLeads : tab === 'pending' ? pendingCount : tab === 'contacted' ? contactedCount : confirmedCount})
            </button>
          ))}
        </div>

        <button
          onClick={fetchLeads}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.8rem',
            fontWeight: 700,
            borderRadius: '8px',
            background: '#141519',
            border: '1px solid #38C2DE',
            color: '#38C2DE',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Refreshing...' : 'Refresh List'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(255, 77, 77, 0.1)', border: '1px solid #ff4d4d', color: '#ff4d4d', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#141519', borderRadius: '16px', border: '1px solid #262830', color: '#8b8f9a' }}>
          Fetching leads...
        </div>
      ) : filteredLeads.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#141519', borderRadius: '16px', border: '1px solid #262830', color: '#8b8f9a' }}>
          No lead submissions found in this tab.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredLeads.map((lead) => {
            const name = lead.full_name || lead.name || 'Anonymous Client';
            const service = lead.coaching_preference || lead.session_type || lead.program || 'Consultation Request';
            const notes = lead.notes || lead.goals || lead.message || 'No details provided.';
            const status = lead.status || 'pending';

            return (
              <div
                key={lead._id}
                style={{
                  background: '#141519',
                  border: '1px solid #262830',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                }}
              >
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>{name}</h3>
                    <span style={getPillStyle(status)}>{status}</span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#8b8f9a', marginBottom: '0.25rem' }}>
                    <strong>Email:</strong> <a href={`mailto:${lead.email}`} style={{ color: '#38C2DE', textDecoration: 'none' }}>{lead.email}</a> | 📱 <strong>Phone:</strong> {lead.phone || 'N/A'}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#8b8f9a', marginBottom: '0.75rem' }}>
                    <strong>Service / Program:</strong> {service}
                  </div>

                  <div style={{ background: '#0d0e11', border: '1px solid #262830', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', color: '#e2e8f0' }}>
                    <strong style={{ color: '#8b8f9a' }}>Client Notes / Goals:</strong>
                    <p style={{ margin: '0.25rem 0 0 0' }}>{notes}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#8b8f9a', fontWeight: 700 }}>Set Status:</span>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {['pending', 'contacted', 'confirmed'].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusUpdate(lead._id, st)}
                        style={{
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          textTransform: 'capitalize',
                          border: '1px solid #262830',
                          background: status === st ? '#38C2DE' : '#0d0e11',
                          color: status === st ? '#000' : '#fff',
                        }}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const statBoxStyle: React.CSSProperties = {
  background: '#0d0e11',
  border: '1px solid #262830',
  borderRadius: '12px',
  padding: '0.6rem 1rem',
  textAlign: 'center',
  minWidth: '85px',
};

const statNumStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '1.4rem',
  fontWeight: 800,
  lineHeight: 1.1,
};

const statLabelStyle: React.CSSProperties = {
  fontSize: '0.65rem',
  color: '#8b8f9a',
  textTransform: 'uppercase',
  fontWeight: 700,
};

function getPillStyle(status: string): React.CSSProperties {
  const isConfirmed = status === 'confirmed';
  const isContacted = status === 'contacted';
  return {
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.68rem',
    fontWeight: 800,
    textTransform: 'uppercase',
    background: isConfirmed ? 'rgba(0, 255, 204, 0.12)' : isContacted ? 'rgba(0, 170, 255, 0.12)' : 'rgba(255, 193, 7, 0.12)',
    color: isConfirmed ? '#00ffcc' : isContacted ? '#00aaff' : '#ffc107',
    border: `1px solid ${isConfirmed ? '#00ffcc' : isContacted ? '#00aaff' : '#ffc107'}`,
  };
}