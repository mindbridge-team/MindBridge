const TOKEN_KEY = 'mindbridge_access_token';
const REFRESH_KEY = 'mindbridge_refresh_token';
type TokenStorageType = 'session' | 'local';

type StoredTokens = {
  accessToken: string | null;
  refreshToken: string | null;
  storageType: TokenStorageType | null;
};

export function readStoredTokens(): StoredTokens {
  const sessionAccessToken = sessionStorage.getItem(TOKEN_KEY);
  const sessionRefreshToken = sessionStorage.getItem(REFRESH_KEY);
  if (sessionAccessToken || sessionRefreshToken) {
    return {
      accessToken: sessionAccessToken,
      refreshToken: sessionRefreshToken,
      storageType: 'session',
    };
  }

  const localAccessToken = localStorage.getItem(TOKEN_KEY);
  const localRefreshToken = localStorage.getItem(REFRESH_KEY);
  return {
    accessToken: localAccessToken,
    refreshToken: localRefreshToken,
    storageType: localAccessToken || localRefreshToken ? 'local' : null,
  };
}

function getStorage(storageType: TokenStorageType): Storage {
  return storageType === 'local' ? localStorage : sessionStorage;
}

export function storeAuthTokens(accessToken: string, refreshToken: string, storageType: TokenStorageType) {
  // Keep tokens in one storage only to avoid confusion.
  clearAuthTokens();
  const storage = getStorage(storageType);
  storage.setItem(TOKEN_KEY, accessToken);
  storage.setItem(REFRESH_KEY, refreshToken);
}

export function storeAccessToken(accessToken: string, storageType: TokenStorageType) {
  const storage = getStorage(storageType);
  storage.setItem(TOKEN_KEY, accessToken);
}

export function clearAuthTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
}
