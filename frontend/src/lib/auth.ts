type OnAccessTokenFn = (token: string) => void;

// Keeps auth options setup in one simple helper.
export function createApiAuth(refreshToken: string | null, onAccessToken: OnAccessTokenFn) {
  return { refreshToken, onAccessToken };
}
