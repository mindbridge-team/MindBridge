const PRODUCTION_API_DEFAULT = 'https://mindbridge-cpva.onrender.com';
const DEVELOPMENT_API_DEFAULT = 'http://127.0.0.1:8000';

/** Vite only inlines `VITE_*` env vars present at `vite build` time (set them in Vercel project env). */
function resolveApiBase(): string {
  const raw =
    (import.meta.env.VITE_API_URL as string | undefined)?.trim().replace(/\/$/, '') ?? '';
  if (!raw) {
    return import.meta.env.DEV ? DEVELOPMENT_API_DEFAULT : PRODUCTION_API_DEFAULT;
  }
  try {
    const { hostname } = new URL(raw);
    // Avoid treating the Vercel frontend URL as the API if misconfigured in the dashboard.
    if (hostname.endsWith('.vercel.app')) {
      return import.meta.env.DEV ? DEVELOPMENT_API_DEFAULT : PRODUCTION_API_DEFAULT;
    }
  } catch {
    return import.meta.env.DEV ? DEVELOPMENT_API_DEFAULT : PRODUCTION_API_DEFAULT;
  }
  return raw;
}

const API_BASE = resolveApiBase();

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

export type AuthOptions = {
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

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH';
  body?: unknown;
  auth?: AuthOptions;
  errorMessage: string;
  errorKeys?: string[];
};

async function requestJson<T>(
  path: string,
  accessToken: string,
  { method = 'GET', body, auth, errorMessage, errorKeys = [] }: RequestOptions
): Promise<T> {
  const send = (token: string) =>
    fetch(`${API_BASE}${path}`, {
      method,
      headers: authHeaders(token),
      body: body == null ? undefined : JSON.stringify(body),
    });

  let token = accessToken;
  let response = await send(token);
  if (response.status === 401 && auth?.refreshToken) {
    const refreshed = await refreshAccessToken(auth.refreshToken);
    token = refreshed.access;
    auth.onAccessToken?.(token);
    response = await send(token);
  }

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
  return requestJson<Me>('/api/auth/me/', accessToken, {
    auth,
    errorMessage: 'Failed to load user profile',
  });
}

export async function getMoods(
  accessToken: string,
  auth?: AuthOptions
): Promise<MoodEntry[]> {
  return requestJson<MoodEntry[]>('/api/moods/', accessToken, {
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
  return requestJson<MoodEntry>('/api/moods/', accessToken, {
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
  return requestJson<Counsellor[]>('/api/auth/counsellors/', accessToken, {
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
  return requestJson<Appointment[]>('/api/appointments/my/', accessToken, {
    auth,
    errorMessage: 'Failed to load appointments',
  });
}

export async function getCounsellorAppointments(
  accessToken: string,
  auth?: AuthOptions
): Promise<Appointment[]> {
  return requestJson<Appointment[]>('/api/appointments/counsellor/', accessToken, {
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
  const availableSlotsResponse = await requestJson<AvailableSlotsResponse>(
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
  return requestJson<Appointment>(`/api/appointments/${appointmentId}/`, accessToken, {
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
  return requestJson<Appointment>('/api/appointments/create/', accessToken, {
    method: 'POST',
    body: input,
    auth,
    errorMessage: 'Failed to create appointment',
    errorKeys: ['non_field_errors', 'detail', 'scheduled_time', 'counsellor'],
  });
}

export type Room = {
  id: number;
  name: string;
  description: string;
  created_by: string;
  participants: number[];
  created_at: string;
  is_active: boolean;
};

export type ChatMessage = {
  id: number;
  room: number;
  user: string;
  message_text: string;
  created_at: string;
};

export type Notification = {
  id: number;
  user: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export async function getRooms(
  accessToken: string,
  auth?: AuthOptions
): Promise<Room[]> {
  return requestJson<Room[]>('/api/communication/rooms/', accessToken, {
    auth,
    errorMessage: 'Failed to load rooms',
  });
}

export async function createRoom(
  accessToken: string,
  name: string,
  description: string,
  auth?: AuthOptions
): Promise<Room> {
  return requestJson<Room>('/api/communication/rooms/create/', accessToken, {
    method: 'POST',
    body: { name, description },
    auth,
    errorMessage: 'Failed to create room',
    errorKeys: ['detail', 'name', 'description'],
  });
}

export async function joinRoom(
  accessToken: string,
  roomId: number,
  auth?: AuthOptions
): Promise<{ message: string }> {
  return requestJson<{ message: string }>(`/api/communication/rooms/${roomId}/join/`, accessToken, {
    method: 'POST',
    auth,
    errorMessage: 'Failed to join room',
  });
}

export async function leaveRoom(
  accessToken: string,
  roomId: number,
  auth?: AuthOptions
): Promise<{ message: string }> {
  return requestJson<{ message: string }>(`/api/communication/rooms/${roomId}/leave/`, accessToken, {
    method: 'POST',
    auth,
    errorMessage: 'Failed to leave room',
  });
}

export async function getRoomMessages(
  accessToken: string,
  roomId: number,
  auth?: AuthOptions
): Promise<ChatMessage[]> {
  return requestJson<ChatMessage[]>(`/api/communication/rooms/${roomId}/messages/`, accessToken, {
    auth,
    errorMessage: 'Failed to load room messages',
  });
}

export async function sendRoomMessage(
  accessToken: string,
  room: number,
  message_text: string,
  auth?: AuthOptions
): Promise<ChatMessage> {
  return requestJson<ChatMessage>('/api/communication/messages/send/', accessToken, {
    method: 'POST',
    body: { room, message_text },
    auth,
    errorMessage: 'Failed to send message',
    errorKeys: ['detail', 'room', 'message_text'],
  });
}

export async function getNotifications(
  accessToken: string,
  auth?: AuthOptions
): Promise<Notification[]> {
  return requestJson<Notification[]>('/api/communication/notifications/', accessToken, {
    auth,
    errorMessage: 'Failed to load notifications',
  });
}

type ChatbotReply = {
  success: boolean;
  sender: string;
  messages: string[];
};

export async function sendChatbotMessage(message: string, sender?: string): Promise<ChatbotReply> {
  const response = await fetch(`${API_BASE}/api/chatbot/message/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sender }),
  });
  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const errorMessage = pickErrorText(errorPayload, ['error', 'detail']) || 'Failed to contact chatbot';
    throw new Error(errorMessage);
  }
  const payload = await response.json();
  return {
    success: Boolean(payload.success),
    sender: String(payload.sender ?? 'anonymous_user'),
    messages: Array.isArray(payload.messages) ? payload.messages.map(String) : [],
  };
}
