import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
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

function App() {
  const { isLoggedIn, login, me } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);

  if (!isLoggedIn) {
    if (showSignUp) {
      return (
        <SignUp
          onSignUp={() => setShowSignUp(false)}
          onBackToLogin={() => setShowSignUp(false)}
        />
      );
    }
    return (
      <Login
        onLogin={login}
        onSignUpClick={() => setShowSignUp(true)}
      />
    );
  }

  if (!me) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-[#e8f4f7] via-[#f8fafb] to-[#d4e9f0]">
        <p className="text-sm text-muted-foreground">Loading your account…</p>
      </div>
    );
  }

  const isCounsellor = me.role === 'counsellor';
  const isAdmin = me.role === 'admin';

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route
          path="/"
          element={
            isCounsellor ? <Navigate to="/appointments/counsellor" replace /> : <MoodDashboard />
          }
        />
        <Route path="/resources" element={<Resources />} />
        <Route
          path="/mood"
          element={
            me.role === 'patient' ? <MoodTracker /> : <Navigate to="/" replace />
          }
        />

        <Route
          path="/appointments/book"
          element={isCounsellor || isAdmin ? <Navigate to="/" replace /> : <BookSession />}
        />
        <Route
          path="/appointments/my"
          element={isCounsellor || isAdmin ? <Navigate to="/" replace /> : <MyAppointments />}
        />
        <Route
          path="/appointments/counsellor"
          element={isCounsellor || isAdmin ? <CounsellorAppointments /> : <Navigate to="/" replace />}
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
