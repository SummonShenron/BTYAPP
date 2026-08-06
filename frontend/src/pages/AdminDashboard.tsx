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

export default function AdminDashboard() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'contacted' | 'confirmed'>('all');

  useEffect(() => {
    if (isLoaded) {
      fetchLeads();
    }
  }, [isLoaded]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getToken();

      const res = await fetch(`${API_URL}/api/admin/leads`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });

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

  const handleStatusUpdate = async (leadId: string, newStatus: string) => {
    setLeads((prev) =>
      prev.map((lead) => (lead._id === leadId ? { ...lead, status: newStatus } : lead))
    );

    try {
      const token = await getToken();
      await fetch(`${API_URL}/api/admin/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
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