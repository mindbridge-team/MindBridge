import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Login } from './components/Login';
import { SignUp } from './components/SignUp';
import { MoodDashboard } from './components/MoodDashboard';
import { MainLayout } from './components/MainLayout';
import { Resources } from './components/Resources';
import { useAuth } from './contexts/AuthContext';
import './App.css';

function App() {
  const { isLoggedIn, login } = useAuth();
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

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<MoodDashboard />} />
        <Route path="/resources" element={<Resources />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
