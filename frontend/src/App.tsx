import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import type { ReactElement } from 'react';
import { Login } from './components/Login';
import { SignUp } from './components/SignUp';
import { MoodDashboard } from './components/MoodDashboard';
import { MoodTracker } from './components/MoodTracker';
import { MainLayout } from './components/MainLayout';
import { Resources } from './components/Resources';
import { BookSession } from './components/BookSession';
import { MyAppointments } from './components/MyAppointments';
import { CounsellorAppointments } from './components/CounsellorAppointments';
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

function roleRoute(allowed: boolean, element: ReactElement) {
  return allowed ? element : <Navigate to="/" replace />;
}

function App() {
  const { isLoggedIn, login, me } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);

  if (!isLoggedIn) {
    const handleBackToLogin = () => setShowSignUp(false);
    if (showSignUp) {
      return <SignUp onSignUp={handleBackToLogin} onBackToLogin={handleBackToLogin} />;
    }
    return (
      <Login
        onLogin={login}
        onSignUpClick={() => setShowSignUp(true)}
      />
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
          element={
            isCounsellorOrAdmin
              ? <Navigate to="/appointments/counsellor" replace />
              : <MoodDashboard />
          }
        />
        <Route path="/resources" element={<Resources />} />
        <Route
          path="/mood"
          element={roleRoute(isPatient, <MoodTracker />)}
        />

        <Route
          path="/appointments/book"
          element={roleRoute(canAccessPatientAppointments, <BookSession />)}
        />
        <Route
          path="/appointments/my"
          element={roleRoute(canAccessPatientAppointments, <MyAppointments />)}
        />
        <Route
          path="/appointments/counsellor"
          element={roleRoute(isCounsellorOrAdmin, <CounsellorAppointments />)}
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
