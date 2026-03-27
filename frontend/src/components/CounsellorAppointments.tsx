import { useCallback, useEffect, useMemo, useState } from 'react';
import { Clock, RefreshCcw } from 'lucide-react';

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useAuth } from '../contexts/AuthContext';
import {
  getCounsellorAppointments,
  updateAppointmentStatus,
  type Appointment,
  type AppointmentStatus,
} from '../lib/api';

function parseApiDate(value: string): Date | null {
  const raw = value?.trim?.() ?? '';
  if (!raw) return null;
  const hasTz = /([zZ]|[+-]\d{2}:\d{2})$/.test(raw);
  const d = new Date(hasTz ? raw : `${raw}Z`);
  return Number.isFinite(d.getTime()) ? d : null;
}

function formatUtcDateTime(value: string): string {
  const d = parseApiDate(value);
  if (!d) return value;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  });
}

function statusClass(status: Appointment['status']): string {
  switch (status) {
    case 'accepted':
      return 'bg-emerald-100 text-emerald-800 border-transparent';
    case 'completed':
      return 'bg-slate-200 text-slate-800 border-transparent';
    case 'cancelled':
      return 'bg-red-100 text-red-700 border-transparent';
    case 'pending':
    default:
      return 'bg-amber-100 text-amber-800 border-transparent';
  }
}

const statusOptions: AppointmentStatus[] = ['pending', 'accepted', 'completed', 'cancelled'];

export function CounsellorAppointments() {
  const { accessToken, refreshToken, persistAccessToken } = useAuth();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [updateError, setUpdateError] = useState('');

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError('');
    try {
      const apps = await getCounsellorAppointments(accessToken, {
        refreshToken,
        onAccessToken: persistAccessToken,
      });
      setAppointments(apps);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [accessToken, refreshToken, persistAccessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const sorted = useMemo(() => {
    return [...appointments].sort((a, b) => {
      const at = parseApiDate(a.scheduled_time)?.getTime() ?? -Infinity;
      const bt = parseApiDate(b.scheduled_time)?.getTime() ?? -Infinity;
      return bt - at;
    });
  }, [appointments]);

  const now = Date.now();
  const upcoming = sorted.filter((a) => {
    const t = parseApiDate(a.scheduled_time)?.getTime();
    return t == null ? true : t >= now;
  });
  const past = sorted.filter((a) => {
    const t = parseApiDate(a.scheduled_time)?.getTime();
    return t == null ? false : t < now;
  });

  const handleStatusChange = async (appointmentId: number, next: AppointmentStatus) => {
    if (!accessToken) return;
    setUpdatingId(appointmentId);
    setUpdateError('');
    try {
      const updated = await updateAppointmentStatus(
        accessToken,
        appointmentId,
        next,
        { refreshToken, onAccessToken: persistAccessToken }
      );
      setAppointments((prev) => prev.map((a) => (a.id === appointmentId ? updated : a)));
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
          <h2 className="text-2xl mb-1 text-foreground">Counsellor Appointments</h2>
          <p className="text-sm text-muted-foreground">
            Review sessions assigned to you and update their status.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}
      {updateError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
          {updateError}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading appointments…</p>
      ) : (
        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Upcoming</h3>
            {upcoming.length === 0 ? (
              <Card className="shadow-sm">
                <CardContent className="px-4 py-6 text-sm text-muted-foreground text-center">
                  No upcoming appointments assigned to you.
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {upcoming.map((a) => {
                  const isUpdating = updatingId === a.id;
                  return (
                    <Card key={a.id} className="gap-0 shadow-sm">
                      <CardHeader className="px-4 pt-4 pb-2">
                        <CardTitle className="text-sm flex items-center justify-between gap-2">
                          <span className="truncate">{a.patient}</span>
                          <Badge className={`${statusClass(a.status)} text-xs py-0.5`}>
                            {a.status}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{formatUtcDateTime(a.scheduled_time)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-muted-foreground">Status</label>
                          <select
                            value={a.status}
                            onChange={(e) =>
                              handleStatusChange(a.id, e.target.value as AppointmentStatus)
                            }
                            disabled={isUpdating}
                            className="h-9 rounded-md border border-input bg-input-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                          >
                            {statusOptions.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Past</h3>
            {past.length === 0 ? (
              <p className="text-sm text-muted-foreground">No past appointments.</p>
            ) : (
              <div className="space-y-2">
                {past.map((a) => {
                  const isUpdating = updatingId === a.id;
                  return (
                    <Card key={a.id} className="gap-0 shadow-sm">
                      <CardContent className="px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{a.patient}</p>
                          <p className="text-xs text-muted-foreground">{formatUtcDateTime(a.scheduled_time)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${statusClass(a.status)} text-xs py-0.5`}>
                            {a.status}
                          </Badge>
                          <select
                            value={a.status}
                            onChange={(e) =>
                              handleStatusChange(a.id, e.target.value as AppointmentStatus)
                            }
                            disabled={isUpdating}
                            className="h-9 rounded-md border border-input bg-input-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                          >
                            {statusOptions.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </CardContent>
                    </Card>
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

