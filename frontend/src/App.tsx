import { Navigate, Route, Routes } from 'react-router-dom';
import { Login } from './components/Login';
import { SignUp } from './components/SignUp';
import { MoodDashboard } from './components/MoodDashboard';
import { MoodTracker } from './components/MoodTracker';
import { MainLayout } from './components/MainLayout';
import { Resources } from './components/Resources';
import { Community } from './components/Community';
import { Profile } from './components/Profile';
import { BookSession } from './components/BookSession';
import { MyAppointments } from './components/MyAppointments';
import { CounsellorAppointments } from './components/CounsellorAppointments';
import { GuardedRoute, HomeRoute } from './components/routes/RouteGuards';
import { useAuth } from './contexts/AuthContext';
import './App.css';

// App flow for demo:
// show login first, then send each user role to the right pages.
function AuthLoadingScreen() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-[#e8f4f7] via-[#f8fafb] to-[#d4e9f0]">
      <p className="text-sm text-muted-foreground">Getting your account ready…</p>
    </div>
  );
}

function App() {
  const { isLoggedIn, login, me } = useAuth();

  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="*" element={<Login onLogin={login} />} />
      </Routes>
    );
  }

  if (!me) {
    return <AuthLoadingScreen />;
  }

  const isPatient = me.role === 'patient';
  const isCounsellorOrAdmin = me.role === 'counsellor' || me.role === 'admin';
  const canAccessPatientAppointments = !isCounsellorOrAdmin;

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route
          path="/"
          element={<HomeRoute isCounsellorOrAdmin={isCounsellorOrAdmin} patientHome={<MoodDashboard />} />}
        />
        <Route path="/resources" element={<Resources />} />
        <Route path="/community" element={<Community />} />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/mood"
          element={<GuardedRoute allowed={isPatient} element={<MoodTracker />} />}
        />

        <Route
          path="/appointments/book"
          element={<GuardedRoute allowed={canAccessPatientAppointments} element={<BookSession />} />}
        />
        <Route
          path="/appointments/my"
          element={<GuardedRoute allowed={canAccessPatientAppointments} element={<MyAppointments />} />}
        />
        <Route
          path="/appointments/counsellor"
          element={<GuardedRoute allowed={isCounsellorOrAdmin} element={<CounsellorAppointments />} />}
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/signup" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
