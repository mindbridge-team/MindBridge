const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export async function register(username: string, email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg =
      err.username?.[0] || err.email?.[0] || err.password?.[0] || 'Registration failed';
    throw new Error(msg);
  }
  return res.json();
}

export async function login(username: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err.detail || 'Invalid username or password';
    throw new Error(typeof msg === 'string' ? msg : msg[0] || 'Invalid username or password');
  }
  const data = await res.json();
  return { access: data.access, refresh: data.refresh };
}

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
  const res = await fetch(`${API_BASE}/api/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) {
    throw new Error('Session expired. Please log in again.');
  }
  const data = await res.json();
  return { access: data.access };
}

type MoodAuthOptions = {
  refreshToken?: string | null;
  onAccessToken?: (token: string) => void;
};

type AuthOptions = {
  refreshToken?: string | null;
  onAccessToken?: (token: string) => void;
};

async function fetchMoodsOnce(accessToken: string): Promise<Response> {
  return fetch(`${API_BASE}/api/moods/`, {
    headers: authHeaders(accessToken),
  });
}

export async function getMoods(
  accessToken: string,
  auth?: MoodAuthOptions
): Promise<MoodEntry[]> {
  let token = accessToken;
  let res = await fetchMoodsOnce(token);
  if (res.status === 401 && auth?.refreshToken) {
    const { access } = await refreshAccessToken(auth.refreshToken);
    auth.onAccessToken?.(access);
    token = access;
    res = await fetchMoodsOnce(token);
  }
  if (!res.ok) throw new Error('Failed to fetch moods');
  return res.json();
}

export async function createMood(
  accessToken: string,
  mood_value: number,
  note: string,
  auth?: MoodAuthOptions
): Promise<MoodEntry> {
  let token = accessToken;
  let res = await fetch(`${API_BASE}/api/moods/`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ mood_value, note }),
  });
  if (res.status === 401 && auth?.refreshToken) {
    const { access } = await refreshAccessToken(auth.refreshToken);
    auth.onAccessToken?.(access);
    token = access;
    res = await fetch(`${API_BASE}/api/moods/`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ mood_value, note }),
    });
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as Record<string, unknown>;
    const detail = err.detail;
    const detailStr = Array.isArray(detail)
      ? String(detail[0])
      : typeof detail === 'string'
        ? detail
        : '';
    const msg =
      detailStr ||
      (err.mood_value as string[] | undefined)?.[0] ||
      (err.note as string[] | undefined)?.[0] ||
      (res.status === 401 ? 'Not authenticated. Please log in again.' : 'Failed to save mood');
    throw new Error(msg);
  }
  return res.json();
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

async function fetchCounsellorsOnce(accessToken: string): Promise<Response> {
  return fetch(`${API_BASE}/api/auth/counsellors/`, {
    headers: authHeaders(accessToken),
  });
}

export async function getCounsellors(
  accessToken: string,
  auth?: AuthOptions
): Promise<Counsellor[]> {
  let token = accessToken;
  let res = await fetchCounsellorsOnce(token);
  if (res.status === 401 && auth?.refreshToken) {
    const { access } = await refreshAccessToken(auth.refreshToken);
    auth.onAccessToken?.(access);
    token = access;
    res = await fetchCounsellorsOnce(token);
  }
  if (!res.ok) throw new Error('Failed to load counsellors');
  return res.json();
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

type CreateAppointmentInput = {
  counsellor: number;
  scheduled_time: string;
};

async function fetchMyAppointmentsOnce(accessToken: string): Promise<Response> {
  return fetch(`${API_BASE}/api/appointments/my/`, {
    headers: authHeaders(accessToken),
  });
}

export async function getMyAppointments(
  accessToken: string,
  auth?: AuthOptions
): Promise<Appointment[]> {
  let token = accessToken;
  let res = await fetchMyAppointmentsOnce(token);
  if (res.status === 401 && auth?.refreshToken) {
    const { access } = await refreshAccessToken(auth.refreshToken);
    auth.onAccessToken?.(access);
    token = access;
    res = await fetchMyAppointmentsOnce(token);
  }
  if (!res.ok) throw new Error('Failed to load appointments');
  return res.json();
}

async function createAppointmentOnce(
  accessToken: string,
  input: CreateAppointmentInput
): Promise<Response> {
  return fetch(`${API_BASE}/api/appointments/create/`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(input),
  });
}

export async function createAppointment(
  accessToken: string,
  input: CreateAppointmentInput,
  auth?: AuthOptions
): Promise<Appointment> {
  let token = accessToken;
  let res = await createAppointmentOnce(token, input);
  if (res.status === 401 && auth?.refreshToken) {
    const { access } = await refreshAccessToken(auth.refreshToken);
    auth.onAccessToken?.(access);
    token = access;
    res = await createAppointmentOnce(token, input);
  }
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    const detail = err.detail;
    const detailStr = Array.isArray(detail)
      ? String(detail[0])
      : typeof detail === 'string'
        ? detail
        : '';
    const fieldMsg =
      (err.scheduled_time as string[] | undefined)?.[0] ||
      (err.counsellor as string[] | undefined)?.[0];
    const msg =
      detailStr ||
      fieldMsg ||
      (res.status === 401 ? 'Not authenticated. Please log in again.' : 'Failed to create appointment');
    throw new Error(msg);
  }
  return res.json();
}
