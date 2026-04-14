type SetBool = (value: boolean) => void;
type SetText = (value: string) => void;

function toMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export async function runWithLoading(
  setLoading: SetBool,
  setError: SetText,
  fallbackError: string,
  action: () => Promise<void>
): Promise<boolean> {
  setLoading(true);
  setError('');
  try {
    await action();
    return true;
  } catch (error) {
    setError(toMessage(error, fallbackError));
    return false;
  } finally {
    setLoading(false);
  }
}
