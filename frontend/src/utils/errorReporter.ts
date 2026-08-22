// src/utils/errorReporter.ts
// Reports frontend errors to the BTY backend, which forwards them to errAgent.
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8005';

export function reportFrontendError(
  error: unknown,
  metadata: Record<string, unknown> = {},
) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  void fetch(`${API_URL}/api/client-errors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service: 'btyapp',
      environment: import.meta.env.MODE,
      release: import.meta.env.VITE_APP_VERSION,
      route: window.location.pathname,
      source: metadata.source || 'frontend',
      message,
      stack,
      metadata,
    }),
    keepalive: true,
  }).catch(() => {
    // Error reporting must never break the app.
  });
}
