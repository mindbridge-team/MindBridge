// Date formatting helpers:
// safely parse API timestamps and display a consistent time format.
export function parseApiDate(value: string): Date | null {
  const raw = value?.trim?.() ?? '';
  if (!raw) return null;
  const hasTz = /([zZ]|[+-]\d{2}:\d{2})$/.test(raw);
  const d = new Date(hasTz ? raw : `${raw}Z`);
  return Number.isFinite(d.getTime()) ? d : null;
}

export function formatUtcDateTime(value: string): string {
  const d = parseApiDate(value);
  if (!d) return value;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  });
}
