/**
 * Local-midnight today as a Unix timestamp (ms).
 * Using local time so "today" matches the user's wall clock; Supabase
 * stores `created_at` in UTC so we convert via `new Date(...).toISOString()`
 * when sending it as a filter.
 */
export function startOfTodayMs(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function startOfTodayIso(): string {
  return new Date(startOfTodayMs()).toISOString();
}
