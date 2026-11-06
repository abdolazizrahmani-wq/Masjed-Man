/**
 * Privacy for minors: other students/parents see "محمد ک." instead of the full name.
 * Staff (admin/manager) and the person themselves always see the full name.
 */
export function publicName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return fullName.trim();
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}
