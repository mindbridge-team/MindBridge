import {
  useEffect,
  useState,
  type FormEvent,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, RefreshCcw, Users } from 'lucide-react';

import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ErrorMessage } from './ui/feedback';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../contexts/AuthContext';
import {
  createAppointment,
  getAvailableSlots,
  getCounsellors,
  type Counsellor,
} from '../lib/api';
import { createApiAuth } from '../lib/auth';
import { mapCounsellorsById } from '../lib/appointments';
import { PRIMARY_BUTTON_COLORS } from '../lib/ui';

// Demo booking flow:
// pick a counsellor, choose an open time, then confirm the session.
const PRIMARY_BUTTON_CLASSES = PRIMARY_BUTTON_COLORS;
const SELECT_CLASSES = 'w-full h-9 rounded-md border border-input bg-input-background pl-9 pr-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50';

function toUtcDateValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function formatApiSlotTime(slotIso: string): string {
  const slotDate = new Date(slotIso);
  if (!Number.isFinite(slotDate.getTime())) return slotIso;
  return slotDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  });
}

function toFriendlyBookingError(message: string): string {
  if (/already booked|slot is already|taken|unavailable/i.test(message)) {
    return `${message} Try refreshing available slots and picking another time.`;
  }
  return message;
}

type CounsellorFieldProps = {
  counsellors: Counsellor[];
  counsellorId: number | null;
  loadingCounsellors: boolean;
  selectedCounsellor?: Counsellor;
  onCounsellorChange: (value: string) => void;
};

function CounsellorField({
  counsellors,
  counsellorId,
  loadingCounsellors,
  selectedCounsellor,
  onCounsellorChange,
}: CounsellorFieldProps) {
  const placeholder = loadingCounsellors ? 'Loading counsellors…' : 'No counsellors available';

  return (
    <div className="space-y-1.5">
      <Label htmlFor="counsellor" className="text-xs text-muted-foreground">
        Counsellor
      </Label>
      <div className="relative">
        <Users className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <select
          id="counsellor"
          value={counsellorId ?? ''}
          onChange={(e) => onCounsellorChange(e.target.value)}
          disabled={loadingCounsellors || counsellors.length === 0}
          className={SELECT_CLASSES}
        >
          {counsellors.length === 0 ? (
            <option value="">{placeholder}</option>
          ) : (
            counsellors.map((counsellor) => (
              <option key={counsellor.id} value={counsellor.id}>
                {counsellor.username} — {counsellor.specialization} ({counsellor.experience_years} yrs)
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
  );
}

type SlotFieldProps = {
  counsellorId: number | null;
  selectedSlotIso: string;
  availableSlots: string[];
  loadingSlots: boolean;
  slotsError: string;
  onSlotChange: (value: string) => void;
  onRefreshSlots: () => Promise<void>;
};

function SlotField({
  counsellorId,
  selectedSlotIso,
  availableSlots,
  loadingSlots,
  slotsError,
  onSlotChange,
  onRefreshSlots,
}: SlotFieldProps) {
  const placeholder = loadingSlots ? 'Loading slots…' : 'No slots available for this date';

  return (
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
          onClick={() => void onRefreshSlots()}
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
          onChange={(e) => onSlotChange(e.target.value)}
          disabled={loadingSlots || !counsellorId || availableSlots.length === 0}
          className={SELECT_CLASSES}
        >
          {availableSlots.length === 0 ? (
            <option value="">{placeholder}</option>
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
      {slotsError && <ErrorMessage>{slotsError}</ErrorMessage>}
      <p className="text-xs text-muted-foreground">
        Slots exclude already-booked hours. If booking fails, refresh and try again.
      </p>
    </div>
  );
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
  const auth = createApiAuth(refreshToken, persistAccessToken);
  const minSelectableDate = toUtcDateValue(new Date());

  async function loadAvailableSlots() {
    if (!accessToken || !counsellorId || !selectedDate) return;
    setLoadingSlots(true);
    setSlotsError('');
    try {
      const slots = await getAvailableSlots(accessToken, counsellorId, selectedDate, auth);
      setAvailableSlots(slots);
      setSelectedSlotIso(slots[0] || '');
    } catch (err) {
      setSlotsError(err instanceof Error ? err.message : 'Failed to load available slots');
      setAvailableSlots([]);
      setSelectedSlotIso('');
    } finally {
      setLoadingSlots(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function loadCounsellors() {
      if (!accessToken) return;
      setLoadingCounsellors(true);
      setLoadError('');
      try {
        // Populate the counsellor dropdown for the booking form.
        const counsellorList = await getCounsellors(accessToken, auth);
        if (cancelled) return;
        setCounsellors(counsellorList);
        setCounsellorId((previousCounsellorId) => previousCounsellorId ?? (counsellorList[0]?.id ?? null));
      } catch (err) {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : 'Failed to load counsellors');
      } finally {
        if (!cancelled) setLoadingCounsellors(false);
      }
    }
    void loadCounsellors();
    return () => {
      cancelled = true;
    };
  }, [accessToken, refreshToken]);

  useEffect(() => {
    void loadAvailableSlots();
  }, [accessToken, counsellorId, selectedDate, refreshToken]);

  async function reloadSlots() {
    setSubmitError('');
    await loadAvailableSlots();
  }

  const counsellorById = mapCounsellorsById(counsellors);

  const selectedCounsellor = counsellorId ? counsellorById.get(counsellorId) : undefined;
  const isSubmitDisabled =
    submitting ||
    loadingCounsellors ||
    loadingSlots ||
    counsellors.length === 0 ||
    availableSlots.length === 0 ||
    !selectedSlotIso;

  const handleCounsellorChange = (value: string) => {
    setCounsellorId(value ? Number(value) : null);
    setSelectedSlotIso('');
  };

  const handleDateChange = (value: string) => {
    setSelectedDate(value);
    setSelectedSlotIso('');
  };
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
    setSubmitting(true);
    setSubmitError('');
    try {
      await createAppointment(accessToken, { counsellor: counsellorId, scheduled_time: selectedSlotIso }, auth);
      navigate('/appointments/my');
    } catch (err) {
      const rawError = err instanceof Error ? err.message : 'Failed to book session';
      setSubmitError(toFriendlyBookingError(rawError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl mb-1 text-foreground">Book a New Session</h2>
        <p className="text-sm text-muted-foreground">
          Pick a counsellor and choose a time that fits your schedule.
        </p>
      </div>

      {loadError && <ErrorMessage>{loadError}</ErrorMessage>}

      <Card className="gap-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2 md:px-6 md:pt-6">
          <CardTitle className="text-sm md:text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#2d7a8f]" />
            Booking details
          </CardTitle>
          <CardDescription className="text-xs">
            Sessions are created as <span className="font-medium">pending</span> until accepted.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <CounsellorField
              counsellors={counsellors}
              counsellorId={counsellorId}
              loadingCounsellors={loadingCounsellors}
              selectedCounsellor={selectedCounsellor}
              onCounsellorChange={handleCounsellorChange}
            />

            <div className="space-y-1.5">
              <Label htmlFor="session-date" className="text-xs text-muted-foreground">
                Date
              </Label>
              <Input
                id="session-date"
                type="date"
                min={minSelectableDate}
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Calendar dates use UTC to match server availability (same as slot times).
              </p>
            </div>

            <SlotField
              counsellorId={counsellorId}
              selectedSlotIso={selectedSlotIso}
              availableSlots={availableSlots}
              loadingSlots={loadingSlots}
              slotsError={slotsError}
              onSlotChange={setSelectedSlotIso}
              onRefreshSlots={reloadSlots}
            />

            {submitError && <ErrorMessage>{submitError}</ErrorMessage>}

            <div className="flex flex-wrap gap-2">
              <Button
                type="submit"
                disabled={isSubmitDisabled}
                className={PRIMARY_BUTTON_CLASSES}
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

