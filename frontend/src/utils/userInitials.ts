/**
 * Safely extracts uppercase initials from a user's display name.
 *
 * Examples:
 *   "Sanved Sahu" -> "SS"
 *   "Anushka Pawar" -> "AP"
 *   "Admin" -> "A"
 *   "   John   Doe  " -> "JD"
 *   "" / null / undefined -> fallback (e.g., "U")
 */
export function getNameInitials(name?: string | null, fallback = 'U'): string {
  if (!name || typeof name !== 'string') return fallback;
  const trimmed = name.trim();
  if (!trimmed) return fallback;

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;

  if (parts.length === 1) {
    return parts[0].substring(0, 1).toUpperCase();
  }

  const first = parts[0][0];
  const last = parts[parts.length - 1][0];
  return (first + last).toUpperCase();
}
