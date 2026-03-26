import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getMe, login as apiLogin, type Me } from '../lib/api';

const TOKEN_KEY = 'mindbridge_access_token';
const REFRESH_KEY = 'mindbridge_refresh_token';

type AuthContextType = {
  isLoggedIn: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  me: Me | null;
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
  const [me, setMe] = useState<Me | null>(null);

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
    const profile = await getMe(access, { refreshToken: refresh });
    setMe(profile);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setAccessToken(null);
    setRefreshToken(null);
    setMe(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!accessToken) {
        if (!cancelled) setMe(null);
        return;
      }
      try {
        const profile = await getMe(accessToken, {
          refreshToken,
          onAccessToken: persistAccessToken,
        });
        if (!cancelled) setMe(profile);
      } catch {
        if (!cancelled) setMe(null);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [accessToken, refreshToken, persistAccessToken]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!accessToken,
        accessToken,
        refreshToken,
        me,
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
