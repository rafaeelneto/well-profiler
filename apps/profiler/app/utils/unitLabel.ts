import type { DiameterUnits } from '@welldot/core';

/**
 * Resolves the diameter unit's display suffix for the active locale.
 * `mm` is locale-invariant; `inches` reads `in.` in English and `"` in
 * Portuguese, matching the double-quote convention used in Brazilian
 * well reports.
 */
export function resolveDiameterUnitLabel(
  unit: DiameterUnits,
  locale: string,
): string {
  if (unit === 'mm') return 'mm';
  return locale === 'pt' ? '"' : 'in.';
}
