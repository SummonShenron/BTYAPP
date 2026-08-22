// src/utils/apiClient.ts
// Thin fetch wrapper that reports 4xx/5xx responses and network failures to errAgent.
import { reportFrontendError } from './errorReporter';

interface ApiFetchOptions extends RequestInit {
  // tag used as metadata.source when reporting a failure
  source: string;
}

export async function apiFetch(url: string, { source, ...init }: ApiFetchOptions): Promise<Response> {
  let response: Response;

  try {
    response = await fetch(url, init);
  } catch (error) {
    reportFrontendError(error, { source, url, method: init.method || 'GET' });
    throw error;
  }

  if (!response.ok) {
    reportFrontendError(`Request failed with status ${response.status}`, {
      source,
      url,
      method: init.method || 'GET',
      status: response.status,
    });
  }

  return response;
}
