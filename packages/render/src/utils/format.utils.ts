import type { DiameterUnits, LengthUnits } from '@welldot/core';
import type { RenderLocalizedText } from '~/types/render.types';

const MM_TO_INCHES = 0.0393701;
const M_TO_FT = 3.28084;

/** Formats a depth value in metres to the active length unit string. */
export function formatLength(m: number, units: LengthUnits): string {
  return units === 'ft' ? (m * M_TO_FT).toFixed(1) : String(m);
}

/** Formats a diameter value in millimetres to the active diameter unit string. */
export function formatDiameter(mm: number, units: DiameterUnits): string {
  return units === 'inches' ? (mm * MM_TO_INCHES).toFixed(2) : String(mm);
}

/** Returns the display label for the active length unit (e.g. `"m"` or `"ft"`). */
export function getLengthUnit(units: LengthUnits): string {
  return units === 'ft' ? 'ft' : 'm';
}

/**
 * Returns the display symbol for the active diameter unit. `mm` is
 * locale-invariant; `inches` is `'"'` unless `locale` is `'en'`, in which
 * case it's `'in.'`. Omitting `locale` preserves the historical `'"'` default.
 */
export function getDiameterUnit(
  units: DiameterUnits,
  locale?: 'en' | 'pt',
): string {
  if (units !== 'inches') return 'mm';
  return locale === 'en' ? 'in.' : '"';
}

/**
 * Resolves a paired-locale render label to a plain string. A bare string is
 * returned as-is (locale-invariant); for the `{ pt, en }` object form, `pt`
 * is always the fallback — mirrors the org-wide `resolveLanguageText()` contract.
 */
export function resolveRenderLabel(
  value: RenderLocalizedText,
  locale: 'en' | 'pt',
): string {
  if (typeof value === 'string') return value;
  return locale === 'en' && value.en ? value.en : value.pt;
}
