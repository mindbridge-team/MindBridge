import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { login as apiLogin } from '../lib/api';

const TOKEN_KEY = 'mindbridge_access_token';

type AuthContextType = {
  isLoggedIn: boolean;
  accessToken: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  );

  const login = useCallback(async (username: string, password: string) => {
    const { access } = await apiLogin(username, password);
    localStorage.setItem(TOKEN_KEY, access);
    setAccessToken(access);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setAccessToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!accessToken,
        accessToken,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
