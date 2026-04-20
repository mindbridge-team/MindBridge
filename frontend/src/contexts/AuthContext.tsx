import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getMe, login as apiLogin, type Me } from '../lib/api';
import { loadCurrentProfile } from './authProfile';
import {
  clearAuthTokens,
  readStoredTokens,
  storeAccessToken,
  storeAuthTokens,
} from './authStorage';

// Shared auth state for demo:
// stores tokens, current user, and login/logout behavior.
type AuthContextType = {
  isLoggedIn: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  me: Me | null;
  persistAccessToken: (token: string) => void;
  login: (username: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() => readStoredTokens().accessToken);
  const [refreshToken, setRefreshToken] = useState<string | null>(() => readStoredTokens().refreshToken);
  const [storageType, setStorageType] = useState<'session' | 'local'>(() => readStoredTokens().storageType ?? 'session');
  const [me, setMe] = useState<Me | null>(null);

  function persistAccessToken(token: string) {
    storeAccessToken(token, storageType);
    setAccessToken(token);
  }

  async function login(username: string, password: string, rememberMe: boolean) {
    const { access, refresh } = await apiLogin(username, password);
    const nextStorageType = rememberMe ? 'local' : 'session';
    storeAuthTokens(access, refresh, nextStorageType);
    setStorageType(nextStorageType);
    setAccessToken(access);
    setRefreshToken(refresh);
    const profile = await getMe(access, { refreshToken: refresh });
    setMe(profile);
  }

  function logout() {
    clearAuthTokens();
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
      const profile = await loadCurrentProfile({
        accessToken,
        refreshToken,
        persistAccessToken,
      });
      if (cancelled) return;

      if (!profile) {
        // If profile loading fails (expired/invalid token), reset auth and show login screen.
        clearAuthTokens();
        setAccessToken(null);
        setRefreshToken(null);
        setMe(null);
        return;
      }

      setMe(profile);
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
