import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getMe, login as apiLogin, type Me } from '../lib/api';

// Shared auth state for demo:
// stores tokens, current user, and login/logout behavior.
const TOKEN_KEY = 'mindbridge_access_token';
const REFRESH_KEY = 'mindbridge_refresh_token';

function readStoredToken(key: string): string | null {
  return localStorage.getItem(key);
}

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
  const [accessToken, setAccessToken] = useState<string | null>(() => readStoredToken(TOKEN_KEY));
  const [refreshToken, setRefreshToken] = useState<string | null>(() => readStoredToken(REFRESH_KEY));
  const [me, setMe] = useState<Me | null>(null);

  function persistAccessToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
    setAccessToken(token);
  }

  async function login(username: string, password: string) {
    const { access, refresh } = await apiLogin(username, password);
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
    setAccessToken(access);
    setRefreshToken(refresh);
    const profile = await getMe(access, { refreshToken: refresh });
    setMe(profile);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setAccessToken(null);
    setRefreshToken(null);
    setMe(null);
  }

  useEffect(() => {
    let cancelled = false;
    async function loadCurrentUser() {
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
    void loadCurrentUser();
    return () => {
      cancelled = true;
    };
  }, [accessToken, refreshToken]);

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

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const authContextValue = useContext(AuthContext);
  if (!authContextValue) throw new Error('useAuth must be used within AuthProvider');
  return authContextValue;
}
