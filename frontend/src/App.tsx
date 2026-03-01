import { useState } from 'react';
import { Login } from './components/Login';
import { SignUp } from './components/SignUp';
import { MoodDashboard } from './components/MoodDashboard';
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

  return <MoodDashboard />;
}

export default App;
