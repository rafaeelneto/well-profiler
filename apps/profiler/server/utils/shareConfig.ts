/**
 * Shared well profiles are plain structured JSON (no embedded binaries —
 * attachments are referenced by `uri`, not inlined), so a generous cap here
 * still comfortably bounds worst-case Supabase storage growth from abuse.
 */
export const MAX_SHARE_BYTES = 256 * 1024;

/** How long a share stays resolvable before `shares:cleanup` deletes it. */
export const SHARE_TTL_DAYS = 30;
