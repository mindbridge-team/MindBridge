import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, RefreshCcw, Users } from 'lucide-react';

import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../contexts/AuthContext';
import {
  createAppointment,
  getAvailableSlots,
  getCounsellors,
  type Counsellor,
} from '../lib/api';

function toUtcDateValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function formatApiSlotTime(slotIso: string): string {
  // Display in a fixed timezone (UTC) to match backend scheduling.
  const dt = new Date(slotIso);
  if (!Number.isFinite(dt.getTime())) return slotIso;
  return dt.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  });
}

/** YYYY-MM-DD portion of the slot in UTC (matches calendar date used for availability). */
function slotUtcDateString(slotIso: string): string | null {
  const m = slotIso.trim().match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

function formatUtcSlotSummary(slotIso: string): string {
  const dt = new Date(slotIso);
  if (!Number.isFinite(dt.getTime())) return slotIso;
  return dt.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  });
}

export function BookSession() {
  const navigate = useNavigate();
  const { accessToken, refreshToken, persistAccessToken } = useAuth();

  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [loadingCounsellors, setLoadingCounsellors] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [counsellorId, setCounsellorId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => toUtcDateValue(new Date()));

  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState('');

  const [selectedSlotIso, setSelectedSlotIso] = useState<string>('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const minSelectableDate = useMemo(() => toUtcDateValue(new Date()), []);
  const slotFetchGeneration = useRef(0);

  const loadSlots = useCallback(async () => {
    if (!accessToken || !counsellorId || !selectedDate) return;
    const gen = ++slotFetchGeneration.current;
    setLoadingSlots(true);
    setSlotsError('');
    try {
      const slots = await getAvailableSlots(accessToken, counsellorId, selectedDate, {
        refreshToken,
        onAccessToken: persistAccessToken,
      });
      if (gen !== slotFetchGeneration.current) return;
      setAvailableSlots(slots);
      setSelectedSlotIso((prev) => (prev && slots.includes(prev) ? prev : slots[0] || ''));
    } catch (err) {
      if (gen !== slotFetchGeneration.current) return;
      setSlotsError(err instanceof Error ? err.message : 'Failed to load available slots');
      setAvailableSlots([]);
      setSelectedSlotIso('');
    } finally {
      if (gen === slotFetchGeneration.current) {
        setLoadingSlots(false);
      }
    }
  }, [accessToken, counsellorId, selectedDate, refreshToken, persistAccessToken]);

  useEffect(() => {
    return () => {
      slotFetchGeneration.current += 1;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!accessToken) return;
      setLoadingCounsellors(true);
      setLoadError('');
      try {
        const data = await getCounsellors(accessToken, {
          refreshToken,
          onAccessToken: persistAccessToken,
        });
        if (cancelled) return;
        setCounsellors(data);
        setCounsellorId((prev) => prev ?? (data[0]?.id ?? null));
      } catch (err) {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : 'Failed to load counsellors');
      } finally {
        if (!cancelled) setLoadingCounsellors(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [accessToken, refreshToken, persistAccessToken]);

  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  const reloadSlots = useCallback(async () => {
    setSubmitError('');
    await loadSlots();
  }, [loadSlots]);

  const slotMatchesDate = useMemo(() => {
    if (!selectedSlotIso || !selectedDate) return true;
    const d = slotUtcDateString(selectedSlotIso);
    return d == null || d === selectedDate;
  }, [selectedSlotIso, selectedDate]);

  const counsellorById = useMemo(() => {
    const m = new Map<number, Counsellor>();
    counsellors.forEach((c) => m.set(c.id, c));
    return m;
  }, [counsellors]);

  const selectedCounsellor = counsellorId ? counsellorById.get(counsellorId) : undefined;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    if (!counsellorId) {
      setSubmitError('Please select a counsellor.');
      return;
    }
    if (!selectedSlotIso) {
      setSubmitError('Please choose an available time slot.');
      return;
    }
    if (!slotMatchesDate) {
      setSubmitError('The selected time does not match the chosen date. Pick a slot again or refresh the list.');
      return;
    }
    if (!availableSlots.includes(selectedSlotIso)) {
      setSubmitError('That slot is no longer available. Refresh the list and choose again.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      await createAppointment(
        accessToken,
        { counsellor: counsellorId, scheduled_time: selectedSlotIso },
        { refreshToken, onAccessToken: persistAccessToken }
      );
      navigate('/appointments/my');
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Failed to book session';
      const friendly =
        /already booked|slot is already|taken|unavailable/i.test(raw)
          ? `${raw} Try refreshing available slots and picking another time.`
          : raw;
      setSubmitError(friendly);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl mb-1 text-foreground">Book a Session</h2>
        <p className="text-sm text-muted-foreground">
          Choose a counsellor and a time that works for you.
        </p>
      </div>

      {loadError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
          {loadError}
        </p>
      )}

      <Card className="gap-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2 md:px-6 md:pt-6">
          <CardTitle className="text-sm md:text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#2d7a8f]" />
            Session details
          </CardTitle>
          <CardDescription className="text-xs">
            Sessions are created as <span className="font-medium">pending</span> until accepted.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="counsellor" className="text-xs text-muted-foreground">
                Counsellor
              </Label>
              <div className="relative">
                <Users className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  id="counsellor"
                  value={counsellorId ?? ''}
                  onChange={(e) => {
                    setCounsellorId(e.target.value ? Number(e.target.value) : null);
                    setSelectedSlotIso('');
                  }}
                  disabled={loadingCounsellors || counsellors.length === 0}
                  className="w-full h-9 rounded-md border border-input bg-input-background pl-9 pr-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  {counsellors.length === 0 ? (
                    <option value="">
                      {loadingCounsellors ? 'Loading counsellors…' : 'No counsellors available'}
                    </option>
                  ) : (
                    counsellors.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.username} — {c.specialization} ({c.experience_years} yrs)
                      </option>
                    ))
                  )}
                </select>
              </div>
              {selectedCounsellor?.availability_text && (
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="font-medium text-foreground">Availability:</span>{' '}
                  {selectedCounsellor.availability_text}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="session-date" className="text-xs text-muted-foreground">
                Date
              </Label>
              <Input
                id="session-date"
                type="date"
                min={minSelectableDate}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlotIso('');
                }}
                required
              />
              <p className="text-xs text-muted-foreground">
                Calendar dates use UTC to match server availability (same as slot times).
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor="slot" className="text-xs text-muted-foreground">
                  Available time slots (UTC)
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => void reloadSlots()}
                  disabled={loadingSlots || !counsellorId}
                >
                  <RefreshCcw className="h-3.5 w-3.5" />
                  Refresh slots
                </Button>
              </div>
              <div className="relative">
                <Clock className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  id="slot"
                  value={selectedSlotIso}
                  onChange={(e) => setSelectedSlotIso(e.target.value)}
                  disabled={loadingSlots || !counsellorId || availableSlots.length === 0}
                  className="w-full h-9 rounded-md border border-input bg-input-background pl-9 pr-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  {availableSlots.length === 0 ? (
                    <option value="">
                      {loadingSlots ? 'Loading slots…' : 'No slots available for this date'}
                    </option>
                  ) : (
                    availableSlots.map((slotIso) => {
                      const label = formatApiSlotTime(slotIso);
                      return (
                        <option key={slotIso} value={slotIso}>
                          {label} UTC
                        </option>
                      );
                    })
                  )}
                </select>
              </div>
              {selectedSlotIso && slotMatchesDate && (
                <p className="text-xs text-muted-foreground">
                  Selected: <span className="font-medium text-foreground">{formatUtcSlotSummary(selectedSlotIso)}</span>{' '}
                  (UTC)
                </p>
              )}
              {!slotMatchesDate && selectedSlotIso && (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  This time does not match the date above. Choose another slot or change the date.
                </p>
              )}
              {slotsError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {slotsError}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Slots exclude already-booked hours. If booking fails, refresh and try again.
              </p>
            </div>

            {submitError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {submitError}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                type="submit"
                disabled={
                  submitting ||
                  loadingCounsellors ||
                  loadingSlots ||
                  counsellors.length === 0 ||
                  availableSlots.length === 0 ||
                  !selectedSlotIso ||
                  !slotMatchesDate ||
                  !availableSlots.includes(selectedSlotIso)
                }
                className="bg-[#2d7a8f] hover:bg-[#236272]"
              >
                {submitting ? 'Booking…' : 'Confirm booking'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/appointments/my">View my appointments</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

