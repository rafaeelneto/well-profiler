import type { DiameterUnits } from '@welldot/core';

export function useUnitFormat() {
  const {
    toDisplay: lengthToDisplay,
    toCanonical: lengthToCanonical,
    unit: lengthUnit,
  } = useUnitDisplay('length');
  const {
    toDisplay: diamToDisplay,
    toCanonical: diamToCanonical,
    unit: diameterUnit,
  } = useUnitDisplay('diameter');
  const { formatNumber } = useNumberFormat();
  const { locale } = useI18n();

  function formatLength(
    value: number | null | undefined,
    fractionDigits = 2,
  ): string {
    if (value == null) return '—';
    return formatNumber(lengthToDisplay(value), {
      fractionDigits,
      suffix: lengthUnit.value,
    });
  }

  function formatDiameter(
    value: number | null | undefined,
    fractionDigits = 1,
  ): string {
    if (value == null) return '—';
    return formatNumber(diamToDisplay(value), {
      fractionDigits,
      suffix: resolveDiameterUnitLabel(
        diameterUnit.value as DiameterUnits,
        locale.value,
      ),
    });
  }

  function formatVolume(
    value: number | null | undefined,
    fractionDigits = 2,
  ): string {
    if (value == null) return '—';
    return formatNumber(value, { fractionDigits, suffix: 'm³' });
  }

  return {
    formatLength,
    formatDiameter,
    formatVolume,
    lengthUnit,
    diameterUnit,
    toLength: lengthToDisplay,
    toCanonicalLength: lengthToCanonical,
    toDiameter: diamToDisplay,
    toCanonicalDiameter: diamToCanonical,
  };
}
