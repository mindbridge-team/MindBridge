import { useCallback, useEffect, useState } from 'react';
import { RefreshCcw } from 'lucide-react';

import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ErrorMessage, LoadingMessage } from './ui/feedback';
import {
  AppointmentPastCard,
  AppointmentUpcomingCard,
} from './appointments/AppointmentSections';
import { useAuth } from '../contexts/AuthContext';
import {
  getCounsellorAppointments,
  updateAppointmentStatus,
  type Appointment,
  type AppointmentStatus,
  type AuthOptions,
} from '../lib/api';
import { splitAppointmentsByTime } from '../lib/appointments';
import { createApiAuth } from '../lib/auth';

// Demo page for counsellors:
// review assigned sessions and update each session status.
const STATUS_SELECT_CLASSES = 'h-9 rounded-md border border-input bg-input-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50';

const APPOINTMENT_STATUS_OPTIONS: AppointmentStatus[] = ['pending', 'accepted', 'completed', 'cancelled'];

function updateAppointmentInList(
  appointments: Appointment[],
  updatedAppointment: Appointment
): Appointment[] {
  return appointments.map((appointment) =>
    appointment.id === updatedAppointment.id ? updatedAppointment : appointment
  );
}

type AppointmentStatusSelectProps = {
  value: AppointmentStatus;
  disabled?: boolean;
  labelled?: boolean;
  onChange: (next: AppointmentStatus) => void;
};

function AppointmentStatusSelect({
  value,
  disabled = false,
  labelled = false,
  onChange,
}: AppointmentStatusSelectProps) {
  return (
    <div className="flex items-center gap-2">
      {labelled ? <label className="text-xs text-muted-foreground">Status</label> : null}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as AppointmentStatus)}
        disabled={disabled}
        className={STATUS_SELECT_CLASSES}
      >
        {APPOINTMENT_STATUS_OPTIONS.map((statusOption) => (
          <option key={statusOption} value={statusOption}>
            {statusOption}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CounsellorAppointments() {
  const { accessToken, refreshToken, persistAccessToken } = useAuth();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [updateError, setUpdateError] = useState('');

  const loadAppointments = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const auth = createApiAuth(refreshToken, persistAccessToken);
      const counsellorAppointments = await getCounsellorAppointments(accessToken, auth);
      setAppointments(counsellorAppointments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [accessToken, refreshToken, persistAccessToken]);

  useEffect(() => {
    void loadAppointments();
  }, [loadAppointments]);

  const { upcoming, past } = splitAppointmentsByTime(appointments);

  const buildAuth = (): AuthOptions => createApiAuth(refreshToken, persistAccessToken);

  const handleStatusChange = async (appointmentId: number, next: AppointmentStatus) => {
    if (!accessToken) return;
    setUpdatingId(appointmentId);
    setUpdateError('');
    try {
      const updated = await updateAppointmentStatus(accessToken, appointmentId, next, buildAuth());
      setAppointments((prev) => updateAppointmentInList(prev, updated));
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl mb-1 text-foreground">Assigned Sessions</h2>
          <p className="text-sm text-muted-foreground">
            Check your assigned sessions and keep their status up to date.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadAppointments} disabled={loading}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {error && <ErrorMessage className="mb-4">{error}</ErrorMessage>}
      {updateError && <ErrorMessage className="mb-4">{updateError}</ErrorMessage>}

      {loading ? (
        <LoadingMessage>Loading appointments…</LoadingMessage>
      ) : (
        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Coming up</h3>
            {upcoming.length === 0 ? (
              <Card className="shadow-sm">
                <CardContent className="px-4 py-6 text-sm text-muted-foreground text-center">
                  No upcoming appointments assigned to you.
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {upcoming.map((appointment) => {
                  const isUpdating = updatingId === appointment.id;
                  return (
                    <AppointmentUpcomingCard
                      key={appointment.id}
                      appointment={appointment}
                      title={appointment.patient}
                      controls={(
                        <AppointmentStatusSelect
                          value={appointment.status}
                          disabled={isUpdating}
                          labelled
                          onChange={(next) => handleStatusChange(appointment.id, next)}
                        />
                      )}
                    />
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Past sessions</h3>
            {past.length === 0 ? (
              <p className="text-sm text-muted-foreground">No past appointments.</p>
            ) : (
              <div className="space-y-2">
                {past.map((appointment) => {
                  const isUpdating = updatingId === appointment.id;
                  return (
                    <AppointmentPastCard
                      key={appointment.id}
                      appointment={appointment}
                      title={appointment.patient}
                      controls={(
                        <AppointmentStatusSelect
                          value={appointment.status}
                          disabled={isUpdating}
                          onChange={(next) => handleStatusChange(appointment.id, next)}
                        />
                      )}
                    />
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

