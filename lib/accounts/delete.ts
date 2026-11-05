/** Phrase the administrator must type to confirm an account deletion. */
export const DELETE_PHRASE = "je supprime"

/** Name the administrator must retype: the full name, or the email when there is none. */
export function deletionName(profile: { full_name: string | null; email: string | null }) {
  return (profile.full_name ?? "").trim() || (profile.email ?? "").trim()
}
