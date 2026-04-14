const TOKEN_KEY = 'mindbridge_access_token';
const REFRESH_KEY = 'mindbridge_refresh_token';

type StoredTokens = {
  accessToken: string | null;
  refreshToken: string | null;
};

export function readStoredTokens(): StoredTokens {
  return {
    accessToken: localStorage.getItem(TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_KEY),
  };
}

export function storeAuthTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function storeAccessToken(accessToken: string) {
  localStorage.setItem(TOKEN_KEY, accessToken);
}

export function clearAuthTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}
