const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// API helper layer for demo:
// keeps backend calls in one place with consistent auth and error handling.

// ------------------------
// Public auth endpoints
// ------------------------
export async function register(username: string, email: string, password: string) {
  const response = await fetch(`${API_BASE}/api/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const errorMessage =
      errorPayload.username?.[0] || errorPayload.email?.[0] || errorPayload.password?.[0] || 'Registration failed';
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function login(username: string, password: string) {
  const response = await fetch(`${API_BASE}/api/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const errorMessage = errorPayload.detail || 'Invalid username or password';
    throw new Error(typeof errorMessage === 'string' ? errorMessage : errorMessage[0] || 'Invalid username or password');
  }
  const authTokens = await response.json();
  return { access: authTokens.access, refresh: authTokens.refresh };
}

export type Me = {
  id: number;
  username: string;
  email: string;
  role: 'patient' | 'counsellor' | 'admin';
};

export type MoodEntry = {
  id: number;
  mood_value: number;
  note: string;
  created_at: string;
};

function authHeaders(accessToken: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function refreshAccessToken(refresh: string): Promise<{ access: string }> {
  const response = await fetch(`${API_BASE}/api/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  if (!response.ok) {
    throw new Error('Session expired. Please log in again.');
  }
  const refreshedTokens = await response.json();
  return { access: refreshedTokens.access };
}

type AuthOptions = {
  refreshToken?: string | null;
  onAccessToken?: (token: string) => void;
};

function pickErrorText(payload: unknown, keys: string[]): string {
  if (!payload || typeof payload !== 'object') return '';
  const record = payload as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string') return value;
    if (Array.isArray(value) && value.length > 0) return String(value[0]);
  }
  return '';
}

async function requestWithAuthRetry(
  accessToken: string,
  auth: AuthOptions | undefined,
  send: (token: string) => Promise<Response>
): Promise<Response> {
  // First try the request with the current access token.
  const firstResponse = await send(accessToken);
  if (firstResponse.status !== 401 || !auth?.refreshToken) return firstResponse;

  // If expired and refresh token exists, refresh once.
  const { access } = await refreshAccessToken(auth.refreshToken);
  auth.onAccessToken?.(access);

  // Retry with the refreshed access token.
  return send(access);
}

type AuthedRequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH';
  body?: unknown;
  auth?: AuthOptions;
  errorMessage: string;
  errorKeys?: string[];
};

async function authedJson<T>(
  path: string,
  accessToken: string,
  { method = 'GET', body, auth, errorMessage, errorKeys = [] }: AuthedRequestOptions
): Promise<T> {
  // Build one reusable request callback for retry logic.
  const send = (token: string) =>
    fetch(`${API_BASE}${path}`, {
      method,
      headers: authHeaders(token),
      body: body == null ? undefined : JSON.stringify(body),
    });

  const response = await requestWithAuthRetry(accessToken, auth, send);
  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const detailedError = pickErrorText(errorPayload, errorKeys);
    throw new Error(detailedError || errorMessage);
  }
  return response.json();
}

// ------------------------
// Authenticated endpoints
// ------------------------
export async function getMe(accessToken: string, auth?: AuthOptions): Promise<Me> {
  return authedJson<Me>('/api/auth/me/', accessToken, {
    auth,
    errorMessage: 'Failed to load user profile',
  });
}

export async function getMoods(
  accessToken: string,
  auth?: AuthOptions
): Promise<MoodEntry[]> {
  return authedJson<MoodEntry[]>('/api/moods/', accessToken, {
    auth,
    errorMessage: 'Failed to fetch moods',
  });
}

export async function createMood(
  accessToken: string,
  mood_value: number,
  note: string,
  auth?: AuthOptions
): Promise<MoodEntry> {
  return authedJson<MoodEntry>('/api/moods/', accessToken, {
    method: 'POST',
    body: { mood_value, note },
    auth,
    errorMessage: 'Failed to save mood',
    errorKeys: ['detail', 'mood_value', 'note'],
  });
}

export type Counsellor = {
  id: number;
  username: string;
  email: string;
  specialization: string;
  experience_years: number;
  availability_text: string;
  is_verified: boolean;
};

export async function getCounsellors(
  accessToken: string,
  auth?: AuthOptions
): Promise<Counsellor[]> {
  return authedJson<Counsellor[]>('/api/auth/counsellors/', accessToken, {
    auth,
    errorMessage: 'Failed to load counsellors',
  });
}

export type AppointmentStatus = 'pending' | 'accepted' | 'completed' | 'cancelled';

export type Appointment = {
  id: number;
  patient: string;
  counsellor: number;
  scheduled_time: string;
  status: AppointmentStatus;
  created_at: string;
};

export type AvailableSlotsResponse = {
  available_slots: string[];
};

type CreateAppointmentInput = {
  counsellor: number;
  scheduled_time: string;
};

export async function getMyAppointments(
  accessToken: string,
  auth?: AuthOptions
): Promise<Appointment[]> {
  return authedJson<Appointment[]>('/api/appointments/my/', accessToken, {
    auth,
    errorMessage: 'Failed to load appointments',
  });
}

export async function getCounsellorAppointments(
  accessToken: string,
  auth?: AuthOptions
): Promise<Appointment[]> {
  return authedJson<Appointment[]>('/api/appointments/counsellor/', accessToken, {
    auth,
    errorMessage: 'Failed to load counsellor appointments',
  });
}

export async function getAvailableSlots(
  accessToken: string,
  counsellorId: number,
  date: string,
  auth?: AuthOptions
): Promise<string[]> {
  const qs = new URLSearchParams({ date });
  const availableSlotsResponse = await authedJson<AvailableSlotsResponse>(
    `/api/appointments/available/${counsellorId}/?${qs.toString()}`,
    accessToken,
    { auth, errorMessage: 'Failed to load available slots' }
  );
  return Array.isArray(availableSlotsResponse.available_slots) ? availableSlotsResponse.available_slots : [];
}

export async function updateAppointmentStatus(
  accessToken: string,
  appointmentId: number,
  status: AppointmentStatus,
  auth?: AuthOptions
): Promise<Appointment> {
  return authedJson<Appointment>(`/api/appointments/${appointmentId}/`, accessToken, {
    method: 'PATCH',
    body: { status },
    auth,
    errorMessage: 'Failed to update appointment status',
    errorKeys: ['detail', 'status'],
  });
}

export async function createAppointment(
  accessToken: string,
  input: CreateAppointmentInput,
  auth?: AuthOptions
): Promise<Appointment> {
  return authedJson<Appointment>('/api/appointments/create/', accessToken, {
    method: 'POST',
    body: input,
    auth,
    errorMessage: 'Failed to create appointment',
    errorKeys: ['non_field_errors', 'detail', 'scheduled_time', 'counsellor'],
  });
}
