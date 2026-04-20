import { useEffect, useState } from 'react';
import {
  getCounsellorAppointments,
  getCounsellors,
  getMoods,
  getMyAppointments,
  type Appointment,
  type Counsellor,
  type Me,
  type MoodEntry,
} from '../../lib/api';
import { createApiAuth } from '../../lib/auth';
import { runWithLoading } from '../../lib/loadState';

type UseDashboardDataArgs = {
  accessToken: string | null;
  refreshToken: string | null;
  persistAccessToken: (token: string) => void;
  me: Me | null;
};

type UseDashboardDataResult = {
  moods: MoodEntry[];
  appointments: Appointment[];
  counsellors: Counsellor[];
  loadError: string;
  appointmentsError: string;
  moodsLoading: boolean;
  appointmentsLoading: boolean;
};

export function useDashboardData({
  accessToken,
  refreshToken,
  persistAccessToken,
  me,
}: UseDashboardDataArgs): UseDashboardDataResult {
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [loadError, setLoadError] = useState('');
  const [appointmentsError, setAppointmentsError] = useState('');
  const [moodsLoading, setMoodsLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!accessToken) return;
      const auth = createApiAuth(refreshToken, persistAccessToken);

      await runWithLoading(setMoodsLoading, setLoadError, 'Failed to load mood history', async () => {
        const moodData = await getMoods(accessToken, auth);
        setMoods(moodData);
      });

      if (!me) return;

      const appointmentsLoaded = await runWithLoading(setAppointmentsLoading, setAppointmentsError, 'Failed to load appointments', async () => {
        if (me.role === 'patient') {
          const [patientAppointments, counsellorList] = await Promise.all([
            getMyAppointments(accessToken, auth),
            getCounsellors(accessToken, auth),
          ]);
          setAppointments(patientAppointments);
          setCounsellors(counsellorList);
        } else {
          const assignedAppointments = await getCounsellorAppointments(accessToken, auth);
          setAppointments(assignedAppointments);
          setCounsellors([]);
        }
      });
      if (!appointmentsLoaded) {
        setAppointments([]);
        setCounsellors([]);
      }
    }

    void loadDashboardData();
  }, [accessToken, me, refreshToken, persistAccessToken]);

  return {
    moods,
    appointments,
    counsellors,
    loadError,
    appointmentsError,
    moodsLoading,
    appointmentsLoading,
  };
}
