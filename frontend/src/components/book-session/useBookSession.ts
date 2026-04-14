import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import {
  createAppointment,
  getAvailableSlots,
  getCounsellors,
  type Counsellor,
} from '../../lib/api';
import { createApiAuth } from '../../lib/auth';

function toUtcDateValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function toFriendlyBookingError(message: string): string {
  if (/already booked|slot is already|taken|unavailable/i.test(message)) {
    return `${message} Try refreshing available slots and picking another time.`;
  }
  return message;
}

export function useBookSession() {
  const navigate = useNavigate();
  const { accessToken, refreshToken, persistAccessToken } = useAuth();
  const auth = useMemo(
    () => createApiAuth(refreshToken, persistAccessToken),
    [refreshToken, persistAccessToken]
  );

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

  useEffect(() => {
    let cancelled = false;

    async function loadCounsellors() {
      if (!accessToken) {
        setLoadingCounsellors(false);
        return;
      }
      setLoadingCounsellors(true);
      setLoadError('');
      try {
        const counsellorList = await getCounsellors(accessToken, auth);
        if (cancelled) return;
        setCounsellors(counsellorList);
        setCounsellorId((prevId) => prevId ?? (counsellorList[0]?.id ?? null));
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load counsellors');
        }
      } finally {
        if (!cancelled) setLoadingCounsellors(false);
      }
    }

    void loadCounsellors();
    return () => {
      cancelled = true;
    };
  }, [accessToken, auth]);

  const loadAvailableSlots = useCallback(async () => {
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
  }, [accessToken, counsellorId, selectedDate, auth]);

  useEffect(() => {
    void loadAvailableSlots();
  }, [loadAvailableSlots]);

  const handleCounsellorChange = (value: string) => {
    setCounsellorId(value ? Number(value) : null);
    setSelectedSlotIso('');
  };

  const handleDateChange = (value: string) => {
    setSelectedDate(value);
    setSelectedSlotIso('');
  };

  const reloadSlots = async () => {
    setSubmitError('');
    await loadAvailableSlots();
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
      await createAppointment(
        accessToken,
        { counsellor: counsellorId, scheduled_time: selectedSlotIso },
        auth
      );
      navigate('/appointments/my');
    } catch (err) {
      const rawError = err instanceof Error ? err.message : 'Failed to book session';
      setSubmitError(toFriendlyBookingError(rawError));
    } finally {
      setSubmitting(false);
    }
  };

  const minSelectableDate = toUtcDateValue(new Date());
  const isSubmitDisabled =
    submitting ||
    loadingCounsellors ||
    loadingSlots ||
    counsellors.length === 0 ||
    availableSlots.length === 0 ||
    !selectedSlotIso;

  return {
    counsellors,
    loadingCounsellors,
    loadError,
    counsellorId,
    selectedDate,
    availableSlots,
    loadingSlots,
    slotsError,
    selectedSlotIso,
    submitting,
    submitError,
    minSelectableDate,
    isSubmitDisabled,
    setSelectedSlotIso,
    handleCounsellorChange,
    handleDateChange,
    reloadSlots,
    handleSubmit,
  };
}
