import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoFallback from '../assets/logo.png';
import './__styles__/Landing.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8005';
const SERVER_POLL_INTERVAL_MS = 1500;
const REQUEST_TIMEOUT_MS = 8000;
const CONTINUE_ANYWAY_AFTER_SECONDS = 5;
const AUTO_CONTINUE_AFTER_SECONDS = 22;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getHostFromUrl = (url: string): string => {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
};

export default function Landing() {
  const navigate = useNavigate();
  const apiHost = getHostFromUrl(API_URL);
  const isApiLocalhost = apiHost === 'localhost' || apiHost === '127.0.0.1';
  const isBrowserLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const [landingLogoSrc, setLandingLogoSrc] = useState<string>(`${API_URL}/api/media/landing_logo?v=${Date.now()}`);
  const [isStarting, setIsStarting] = useState(false);
  const [showNotice, setShowNotice] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [canContinueAnyway, setCanContinueAnyway] = useState(false);
  const cancelRef = useRef(false);

  useEffect(() => {
    const hideNotice = localStorage.getItem('hideNotice') === '1';
    setShowNotice(!hideNotice);

    return () => {
      cancelRef.current = true;
    };
  }, []);

  useEffect(() => {
    if (!isStarting) {
      return;
    }

    const id = window.setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (next >= CONTINUE_ANYWAY_AFTER_SECONDS) {
          setCanContinueAnyway(true);
        }
        return next;
      });
    }, 1000);

    return () => {
      window.clearInterval(id);
    };
  }, [isStarting]);

  const probeServer = async (): Promise<boolean> => {
    const healthUrl = `${API_URL}/health?ts=${Date.now()}`;

    const runProbe = async (mode: RequestMode): Promise<boolean> => {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      try {
        const response = await fetch(healthUrl, {
          method: 'GET',
          cache: 'no-store',
          mode,
          signal: controller.signal,
        });

        // In no-cors mode, an opaque response still means the server responded.
        if (mode === 'no-cors') {
          return true;
        }

        return response.ok;
      } catch {
        return false;
      } finally {
        window.clearTimeout(timer);
      }
    };

    const corsReady = await runProbe('cors');
    if (corsReady) {
      return true;
    }

    return runProbe('no-cors');
  };

  const handleEnter = async () => {
    if (isStarting) {
      return;
    }

    // Prevent permanent blocking in deployed environments with missing/misconfigured API URL.
    if (!isBrowserLocalhost && isApiLocalhost) {
      navigate('/home');
      return;
    }

    cancelRef.current = false;
    setIsStarting(true);
    setElapsedSeconds(0);
    setCanContinueAnyway(false);
    const startedAt = Date.now();

    while (!cancelRef.current) {
      const elapsed = (Date.now() - startedAt) / 1000;
      if (elapsed >= AUTO_CONTINUE_AFTER_SECONDS) {
        navigate('/home');
        return;
      }

      const isReady = await probeServer();
      if (isReady) {
        navigate('/home');
        return;
      }

      await wait(SERVER_POLL_INTERVAL_MS);
    }
  };

  return (
    <div className="landing-shell">
      {showNotice && (
        <aside className="landing-notice" role="status" aria-live="polite">
          <div className="landing-notice-copy">
            <strong>Notice</strong>
            <div className="landing-notice-text">
              Services may take a moment to start. First request after inactivity can be slow while the server spins up.
            </div>

            <details className="landing-notice-details">
              <summary>Learn more</summary>
              <div>
                We run on cost-sensitive infrastructure and use third-party LLMs on free tiers. This can cause longer
                response times or temporary unavailability during peak demand. If the app appears to hang after signing
                in, wait 30-60 seconds and try again.
              </div>
            </details>
          </div>

          <div className="landing-notice-actions">
            <button
              type="button"
              onClick={() => {
                setShowNotice(false);
                localStorage.setItem('hideNotice', '1');
              }}
              aria-label="Dismiss notice"
              className="landing-notice-dismiss"
            >
              Dismiss
            </button>

            {isStarting && (
              <div className="landing-notice-starting">
                <span className="landing-notice-spinner" aria-hidden="true" />
                <span>Starting server...</span>
              </div>
            )}
          </div>
        </aside>
      )}

      <section className="landing-center">
        <h1
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            margin: '-1px',
            padding: 0,
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        >
          BTY Fitness Personal Training by Madison Spear
        </h1>

        <img
          src={landingLogoSrc}
          onError={() => {
            if (landingLogoSrc !== logoFallback) {
              setLandingLogoSrc(logoFallback);
            }
          }}
          alt="BTY Fitness"
          className="landing-logo"
        />

        <button type="button" onClick={handleEnter} className="landing-enter-btn" disabled={isStarting}>
          Enter
        </button>
      </section>

      {isStarting && (
        <div className="landing-start-overlay" role="status" aria-live="polite">
          <div className="landing-start-card">
            <div className="landing-electric-loader" aria-hidden="true" />
            <h2>Warming up BTY...</h2>
            <p>The backend server is starting. This can take up to 30-60 seconds on free-tier hosting.</p>

            <div className="landing-start-progress" aria-hidden="true">
              <div className="landing-start-progress-bar" />
            </div>

            <div className="landing-start-elapsed">{elapsedSeconds}s elapsed</div>

            {canContinueAnyway && (
              <button type="button" className="landing-continue-anyway" onClick={() => navigate('/home')}>
                Continue anyway
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
