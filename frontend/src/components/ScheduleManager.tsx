import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import './__styles__/ScheduleManager.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8005';

interface WeeklyBlock {
  day_of_week: number;
  start_time: string;
  end_time: string;
  enabled: boolean;
  client_name?: string;
}

interface ScheduleSettings {
  timezone: string;
  booking_window_days: number;
  slot_minutes: number;
  weekly_blocks: WeeklyBlock[];
}

const LATEST_SLOT_START_TIME = '17:00';
const WEEKDAY_OPTIONS = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' },
];

const DEFAULT_SETTINGS: ScheduleSettings = {
  timezone: 'America/Chicago',
  booking_window_days: 14,
  slot_minutes: 30,
  weekly_blocks: [
    { day_of_week: 0, start_time: '09:00', end_time: '12:00', enabled: true, client_name: '' },
    { day_of_week: 2, start_time: '09:00', end_time: '12:00', enabled: true, client_name: '' },
    { day_of_week: 4, start_time: '09:00', end_time: '12:00', enabled: true, client_name: '' },
  ],
};

function createEmptyBlock(): WeeklyBlock {
  return {
    day_of_week: 0,
    start_time: '09:00',
    end_time: '12:00',
    enabled: true,
    client_name: '',
  };
}

function createEmptyBlockForDay(dayOfWeek: number): WeeklyBlock {
  return {
    ...createEmptyBlock(),
    day_of_week: dayOfWeek,
  };
}

function formatTimeLabel(value: string) {
  const [hourString, minuteString] = value.split(':');
  const hour = Number(hourString);
  const period = hour >= 12 ? 'PM' : 'AM';
  const normalizedHour = hour % 12 || 12;
  return `${normalizedHour}:${minuteString} ${period}`;
}

function formatBlockRange(block: WeeklyBlock) {
  return `${formatTimeLabel(block.start_time)} - ${formatTimeLabel(block.end_time)}`;
}

function formatBlockLabel(block: WeeklyBlock) {
  const clientName = block.client_name?.trim();
  if (!clientName) {
    return 'No client label';
  }
  return clientName;
}

export default function ScheduleManager() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [settings, setSettings] = useState<ScheduleSettings>(DEFAULT_SETTINGS);
  const [selectedDay, setSelectedDay] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    void fetchSettings();
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
    const headers = {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
      Authorization: `Bearer ${token}`,
    };

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

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authedFetch('/api/admin/schedule/settings');

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Unauthorized (401/403). Confirm admin access and Clerk API keys/JWKS alignment.');
        }
        throw new Error(`Could not load schedule settings (${response.status})`);
      }

      const data = await response.json();
      setSettings({
        timezone: data.timezone || DEFAULT_SETTINGS.timezone,
        booking_window_days: data.booking_window_days || DEFAULT_SETTINGS.booking_window_days,
        slot_minutes: data.slot_minutes || DEFAULT_SETTINGS.slot_minutes,
        weekly_blocks: Array.isArray(data.weekly_blocks) && data.weekly_blocks.length > 0
          ? data.weekly_blocks
          : DEFAULT_SETTINGS.weekly_blocks,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schedule settings');
    } finally {
      setLoading(false);
    }
  };

  const updateBlock = (index: number, patch: Partial<WeeklyBlock>) => {
    setSettings((prev) => ({
      ...prev,
      weekly_blocks: prev.weekly_blocks.map((block, blockIndex) =>
        blockIndex === index ? { ...block, ...patch } : block
      ),
    }));
  };

  const addBlock = () => {
    setSettings((prev) => ({
      ...prev,
      weekly_blocks: [...prev.weekly_blocks, createEmptyBlockForDay(selectedDay)],
    }));
  };

  const removeBlock = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      weekly_blocks: prev.weekly_blocks.filter((_, blockIndex) => blockIndex !== index),
    }));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await authedFetch('/api/admin/schedule/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Unauthorized (401/403). Confirm admin access and Clerk API keys/JWKS alignment.');
        }
        const errorText = await response.text();
        throw new Error(errorText || `Failed to save schedule settings (${response.status})`);
      }

      setSuccess('Schedule saved successfully.');
      await fetchSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save schedule settings');
    } finally {
      setSaving(false);
    }
  };

  const weeklySummary = useMemo(() => {
    const activeBlocks = settings.weekly_blocks.filter((block) => block.enabled);
    return `${activeBlocks.length} active recurring blocks`;
  }, [settings.weekly_blocks]);

  const weeklyOverview = useMemo(
    () =>
      WEEKDAY_OPTIONS.map((day) => {
        const blocks = settings.weekly_blocks
          .filter((block) => block.day_of_week === day.value)
          .sort((left, right) => left.start_time.localeCompare(right.start_time));

        return {
          ...day,
          count: blocks.length,
          preview: blocks.length > 0 ? formatBlockRange(blocks[0]) : 'No recurring slots yet',
          clientLabel: blocks.length > 0 ? formatBlockLabel(blocks[0]) : '',
        };
      }),
    [settings.weekly_blocks]
  );

  const selectedDayBlocks = useMemo(
    () =>
      settings.weekly_blocks
        .map((block, index) => ({ block, index }))
        .filter(({ block }) => block.day_of_week === selectedDay)
        .sort((left, right) => left.block.start_time.localeCompare(right.block.start_time)),
    [settings.weekly_blocks, selectedDay]
  );

  const selectedDayLabel = WEEKDAY_OPTIONS.find((day) => day.value === selectedDay)?.label || 'Day';

  return (
    <section className="schedule-manager-shell">
      <div className="schedule-manager-header">
        <div>
          <span className="schedule-manager-kicker">Recurring Schedule</span>
          <h2 className="schedule-manager-title">Set Madison's weekly availability</h2>
          <p className="schedule-manager-copy">
            Click a weekday on the calendar below, then set the recurring time blocks for that day. Every change applies to all future Mondays, Tuesdays, and so on.
          </p>
        </div>
        <div className="schedule-manager-summary">
          <strong>{weeklySummary}</strong>
          <span>Recurring rules drive the public booking page.</span>
        </div>
      </div>

      {loading ? (
        <div className="schedule-manager-empty">Loading current schedule...</div>
      ) : (
        <div className="schedule-manager-grid">
          <div className="schedule-manager-controls">
            <div className="schedule-field">
              <label className="schedule-field__label">Timezone</label>
              <input
                className="styled-input"
                value={settings.timezone}
                onChange={(e) => setSettings((prev) => ({ ...prev, timezone: e.target.value }))}
              />
            </div>
            <div className="schedule-field">
              <label className="schedule-field__label">Booking Window (days)</label>
              <input
                type="number"
                min={1}
                max={365}
                className="styled-input"
                value={settings.booking_window_days}
                onChange={(e) => setSettings((prev) => ({ ...prev, booking_window_days: Number(e.target.value) }))}
              />
            </div>
            <div className="schedule-field">
              <label className="schedule-field__label">Slot Length (minutes)</label>
              <input
                type="number"
                min={15}
                step={15}
                className="styled-input"
                value={settings.slot_minutes}
                onChange={(e) => setSettings((prev) => ({ ...prev, slot_minutes: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="schedule-calendar-panel">
            <div className="schedule-panel-header">
              <div>
                <span className="schedule-panel-kicker">Week view</span>
                <h3 className="schedule-panel-title">Pick a weekday</h3>
              </div>
              <p className="schedule-panel-note">Selecting a day edits the recurring template for that weekday, not a one-off date.</p>
            </div>

            <div className="schedule-calendar-grid">
              {weeklyOverview.map((day) => {
                const isSelected = selectedDay === day.value;
                return (
                  <button
                    key={day.value}
                    type="button"
                    className={`schedule-day-card ${isSelected ? 'schedule-day-card--active' : ''}`}
                    onClick={() => setSelectedDay(day.value)}
                  >
                    <span className="schedule-day-card__label">{day.label}</span>
                    <span className="schedule-day-card__count">{day.count} slots</span>
                    <span className="schedule-day-card__preview">{day.preview}</span>
                    {day.clientLabel && <span className="schedule-day-card__client">Client: {day.clientLabel}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="schedule-editor-panel">
            <div className="schedule-panel-header schedule-panel-header--editor">
              <div>
                <span className="schedule-panel-kicker">Edit recurring blocks</span>
                <h3 className="schedule-panel-title">{selectedDayLabel}</h3>
                <p className="schedule-panel-note">Any edits here affect every {selectedDayLabel} on the booking page.</p>
              </div>
              <button type="button" className="btn-neon-outline" onClick={addBlock}>
                Add time block
              </button>
            </div>

            {selectedDayBlocks.length === 0 ? (
              <div className="schedule-manager-empty schedule-manager-empty--compact">
                No recurring slots yet for {selectedDayLabel}. Add one to open that weekday on the public calendar.
              </div>
            ) : (
              <div className="schedule-slot-list">
                {selectedDayBlocks.map(({ block, index }) => (
                  <div key={`${block.day_of_week}-${index}`} className="schedule-slot-card">
                    <div className="schedule-slot-card__header">
                      <div>
                        <span className="schedule-slot-card__label">Recurring slot</span>
                        <h4>{formatBlockRange(block)}</h4>
                      </div>
                      <button
                        type="button"
                        className="schedule-remove-btn"
                        onClick={() => removeBlock(index)}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="schedule-slot-grid">
                      <div className="schedule-field">
                        <label className="schedule-field__label">Day</label>
                        <select
                          className="styled-input"
                          value={block.day_of_week}
                          onChange={(e) => updateBlock(index, { day_of_week: Number(e.target.value) })}
                        >
                          {WEEKDAY_OPTIONS.map((day) => (
                            <option key={day.value} value={day.value}>
                              {day.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="schedule-field">
                        <label className="schedule-field__label">Start</label>
                        <input
                          type="time"
                          className="styled-input"
                          value={block.start_time}
                          max={LATEST_SLOT_START_TIME}
                          onChange={(e) => updateBlock(index, { start_time: e.target.value })}
                        />
                      </div>

                      <div className="schedule-field">
                        <label className="schedule-field__label">End</label>
                        <input
                          type="time"
                          className="styled-input"
                          value={block.end_time}
                          max={LATEST_SLOT_START_TIME}
                          onChange={(e) => updateBlock(index, { end_time: e.target.value })}
                        />
                      </div>

                      <div className="schedule-field schedule-field--wide">
                        <label className="schedule-field__label">Client name / label</label>
                        <input
                          type="text"
                          className="styled-input"
                          placeholder="Example: Sarah"
                          value={block.client_name || ''}
                          onChange={(e) => updateBlock(index, { client_name: e.target.value })}
                        />
                      </div>

                      <label className="schedule-toggle">
                        <input
                          type="checkbox"
                          checked={block.enabled}
                          onChange={(e) => updateBlock(index, { enabled: e.target.checked })}
                        />
                        <span>Active</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="schedule-manager-actions">
            <button type="button" className="btn-neon-primary" onClick={saveSettings} disabled={saving}>
              {saving ? 'Saving...' : 'Save schedule'}
            </button>
          </div>
        </div>
      )}

      {error && <div className="schedule-status schedule-status--error">{error}</div>}
      {success && <div className="schedule-status schedule-status--success">{success}</div>}
    </section>
  );
}
