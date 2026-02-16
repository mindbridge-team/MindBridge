import { useState } from 'react';
import { Login } from './components/Login';
import { SignUp } from './components/SignUp';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  if (!isLoggedIn) {
    if (showSignUp) {
      return (
        <SignUp
          onSignUp={() => {
            setShowSignUp(false);
            setIsLoggedIn(true);
          }}
          onBackToLogin={() => setShowSignUp(false)}
        />
      );
    }
    return (
      <Login
        onLogin={() => setIsLoggedIn(true)}
        onSignUpClick={() => setShowSignUp(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-semibold text-[#2d7a8f]">Welcome to MindBridge</h1>
      <p className="mt-2 text-muted-foreground">You are logged in.</p>
    </div>
  );
}

export default App;
