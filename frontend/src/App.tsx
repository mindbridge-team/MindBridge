import { useState } from 'react';
import { Login } from './components/Login';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return (
      <Login
        onLogin={() => setIsLoggedIn(true)}
        onSignUpClick={() => {
          // Sign up coming soon
        }}
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
