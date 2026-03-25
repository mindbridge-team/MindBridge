import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { login as apiLogin } from '../lib/api';

const TOKEN_KEY = 'mindbridge_access_token';
const REFRESH_KEY = 'mindbridge_refresh_token';

type AuthContextType = {
  isLoggedIn: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  persistAccessToken: (token: string) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(() =>
    localStorage.getItem(REFRESH_KEY)
  );

  const persistAccessToken = useCallback((token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    setAccessToken(token);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const { access, refresh } = await apiLogin(username, password);
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
    setAccessToken(access);
    setRefreshToken(refresh);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setAccessToken(null);
    setRefreshToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!accessToken,
        accessToken,
        refreshToken,
        persistAccessToken,
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
