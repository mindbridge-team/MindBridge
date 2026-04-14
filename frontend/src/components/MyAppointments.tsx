import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, RefreshCcw } from 'lucide-react';

import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ErrorMessage, LoadingMessage } from './ui/feedback';
import {
  AppointmentPastCard,
  AppointmentUpcomingCard,
} from './appointments/AppointmentSections';
import { useAuth } from '../contexts/AuthContext';
import {
  getCounsellors,
  getMyAppointments,
  type Appointment,
  type Counsellor,
} from '../lib/api';
import {
  getCounsellorLabel,
  mapCounsellorsById,
  splitAppointmentsByTime,
} from '../lib/appointments';
import { createApiAuth } from '../lib/auth';
import { PRIMARY_BUTTON_COLORS } from '../lib/ui';

// Demo page:
// shows upcoming and past sessions in one easy view.
const PRIMARY_BUTTON_CLASSES = PRIMARY_BUTTON_COLORS;

export function MyAppointments() {
  const { accessToken, refreshToken, persistAccessToken } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const auth = createApiAuth(refreshToken, persistAccessToken);

  async function loadAppointments() {
    if (!accessToken) return;
    setLoading(true);
    setError('');
    try {
      const [myAppointments, counsellorList] = await Promise.all([
        getMyAppointments(accessToken, auth),
        getCounsellors(accessToken, auth),
      ]);
      setAppointments(myAppointments);
      setCounsellors(counsellorList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAppointments();
  }, [accessToken, refreshToken]);

  const counsellorById = mapCounsellorsById(counsellors);
  const { upcoming, past } = splitAppointmentsByTime(appointments);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl mb-1 text-foreground">My Sessions</h2>
          <p className="text-sm text-muted-foreground">
            See what is coming up and review past meetings.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadAppointments} disabled={loading}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button asChild className={PRIMARY_BUTTON_CLASSES}>
            <Link to="/appointments/book">
              <Calendar className="h-4 w-4" />
              Book a session
            </Link>
          </Button>
        </div>
      </div>

      {error && <ErrorMessage className="mb-4">{error}</ErrorMessage>}

      {loading ? (
        <LoadingMessage>Loading appointments…</LoadingMessage>
      ) : (
        <div className="space-y-5">
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Coming up</h3>
            {upcoming.length === 0 ? (
              <Card className="shadow-sm">
                <CardContent className="px-4 py-6 text-sm text-muted-foreground text-center">
                  No upcoming appointments yet.{' '}
                  <Link to="/appointments/book" className="text-[#2d7a8f] hover:underline">
                    Book your first session
                  </Link>
                  .
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {upcoming.map((appointment) => {
                  const counsellor = counsellorById.get(appointment.counsellor);
                  const counsellorLabel = getCounsellorLabel(appointment.counsellor, counsellorById);
                  return (
                    <AppointmentUpcomingCard
                      key={appointment.id}
                      appointment={appointment}
                      title={counsellorLabel}
                      subtitle={counsellor?.specialization}
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
                  const counsellorLabel = getCounsellorLabel(appointment.counsellor, counsellorById);
                  return (
                    <AppointmentPastCard
                      key={appointment.id}
                      appointment={appointment}
                      title={counsellorLabel}
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

