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

export async function getMoods(accessToken: string): Promise<MoodEntry[]> {
  const res = await fetch(`${API_BASE}/api/moods/`, {
    headers: authHeaders(accessToken),
  });
  if (!res.ok) throw new Error('Failed to fetch moods');
  return res.json();
}

export async function createMood(
  accessToken: string,
  mood_value: number,
  note: string
): Promise<MoodEntry> {
  const res = await fetch(`${API_BASE}/api/moods/`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify({ mood_value, note }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err.mood_value?.[0] || err.note?.[0] || 'Failed to save mood';
    throw new Error(msg);
  }
  return res.json();
}
