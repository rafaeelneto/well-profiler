/** Canonical `well_type` vocabulary per the .well spec v2. */
export const WELL_TYPE_VALUES = [
  'tubular',
  'artesian',
  'hand_dug',
  'horizontal',
  'infiltration_gallery',
] as const;

export type WellTypeValue = (typeof WELL_TYPE_VALUES)[number];

const WELL_TYPE_I18N_KEYS: Record<WellTypeValue, string> = {
  tubular: 'editor.general.wellTypes.tubular',
  artesian: 'editor.general.wellTypes.artesian',
  hand_dug: 'editor.general.wellTypes.handDug',
  horizontal: 'editor.general.wellTypes.horizontal',
  infiltration_gallery: 'editor.general.wellTypes.infiltrationGallery',
};

function isWellTypeValue(value: string): value is WellTypeValue {
  return (WELL_TYPE_VALUES as readonly string[]).includes(value);
}

/**
 * Resolves a `well_type` value to its translated label, falling back to the
 * raw value for non-canonical values (e.g. `x-` prefixed or legacy data).
 */
export function resolveWellTypeLabel(
  value: string,
  t: (key: string) => string,
): string {
  return isWellTypeValue(value) ? t(WELL_TYPE_I18N_KEYS[value]) : value;
}
