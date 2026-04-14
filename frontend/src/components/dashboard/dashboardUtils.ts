import {
  type Appointment,
  type Counsellor,
  type MoodEntry,
} from '../../lib/api';
import { parseApiDate } from '../../lib/dateTime';

function formatDayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getTodaysLatestMood(moods: MoodEntry[]): MoodEntry | null {
  const today = new Date();
  const moodsFromToday = moods.filter((moodEntry) => isSameDay(new Date(moodEntry.created_at), today));
  if (moodsFromToday.length === 0) return null;
  return [...moodsFromToday].sort(
    (firstMood, secondMood) => new Date(secondMood.created_at).getTime() - new Date(firstMood.created_at).getTime()
  )[0];
}

export function getNextAppointmentPersonLabel(
  role: 'patient' | 'counsellor' | 'admin' | undefined,
  appointment: Appointment | undefined,
  counsellorById: Map<number, Counsellor>
): string | null {
  if (!appointment) return null;
  if (role === 'patient') {
    return (
      counsellorById.get(appointment.counsellor)?.username ??
      `Counsellor #${appointment.counsellor}`
    );
  }
  return appointment.patient;
}

export function computeStreak(moods: MoodEntry[]): number {
  if (moods.length === 0) return 0;
  const daySet = new Set(
    moods.map((moodEntry) => formatDayKey(new Date(moodEntry.created_at)))
  );
  const today = new Date();
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayKey = formatDayKey(cursor);
  if (!daySet.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const key = formatDayKey(cursor);
    if (daySet.has(key)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function getUpcomingAppointments(appointments: Appointment[]): Appointment[] {
  const nowTimestamp = Date.now();
  return [...appointments]
    .map((appointment) => ({
      appointment,
      appointmentTime: parseApiDate(appointment.scheduled_time)?.getTime() ?? Number.POSITIVE_INFINITY,
    }))
    .filter(({ appointmentTime }) => appointmentTime >= nowTimestamp)
    .sort((firstAppointment, secondAppointment) => firstAppointment.appointmentTime - secondAppointment.appointmentTime)
    .map(({ appointment }) => appointment);
}
