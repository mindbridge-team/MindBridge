import { getMe, type Me } from '../lib/api';

type LoadCurrentProfileInput = {
  accessToken: string | null;
  refreshToken: string | null;
  persistAccessToken: (token: string) => void;
};

export async function loadCurrentProfile({
  accessToken,
  refreshToken,
  persistAccessToken,
}: LoadCurrentProfileInput): Promise<Me | null> {
  if (!accessToken) return null;
  try {
    return await getMe(accessToken, {
      refreshToken,
      onAccessToken: persistAccessToken,
    });
  } catch {
    return null;
  }
}
