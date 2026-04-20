import { parseApiDate } from './dateTime';
import type { Appointment, Counsellor } from './api';

// Session helpers for demo pages:
// sort sessions and split them into coming-up vs past groups.
type AppointmentGroups = {
  upcoming: Appointment[];
  past: Appointment[];
};

export function splitAppointmentsByTime(appointments: Appointment[]): AppointmentGroups {
  const withTime = appointments.map((appointment) => ({
    appointment,
    time: parseApiDate(appointment.scheduled_time)?.getTime() ?? -Infinity,
  }));
  const sorted = withTime.sort((a, b) => b.time - a.time);

  const now = Date.now();
  const upcoming: Appointment[] = [];
  const past: Appointment[] = [];

  for (const { appointment, time } of sorted) {
    if (time == null || time >= now) {
      upcoming.push(appointment);
    } else {
      past.push(appointment);
    }
  }

  return { upcoming, past };
}

export const APPOINTMENT_STATUS_CLASS: Record<Appointment['status'], string> = {
  pending: 'bg-amber-100 text-amber-800 border-transparent',
  accepted: 'bg-emerald-100 text-emerald-800 border-transparent',
  completed: 'bg-slate-200 text-slate-800 border-transparent',
  cancelled: 'bg-red-100 text-red-700 border-transparent',
};

export function mapCounsellorsById(counsellors: Counsellor[]): Map<number, Counsellor> {
  return new Map(counsellors.map((counsellor) => [counsellor.id, counsellor]));
}

export function getCounsellorLabel(
  counsellorId: number,
  counsellorById: Map<number, Counsellor>
): string {
  return counsellorById.get(counsellorId)?.username ?? `Counsellor #${counsellorId}`;
}
