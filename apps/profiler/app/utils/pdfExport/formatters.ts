import { metersToFeet, mmToInches } from '@welldot/core';
import { formatNumber } from '~/utils/formatNumber';
import type { PdfExportOptions } from './types';

export interface PdfFormatters {
  formatLength(
    _value: number | null | undefined,
    _fractionDigits?: number,
  ): string;
  formatDiameter(
    _value: number | null | undefined,
    _fractionDigits?: number,
  ): string;
  formatVolume(
    _volumeM3: number | null | undefined,
    _fractionDigits?: number,
  ): string;
  lengthUnit: PdfExportOptions['lengthUnit'];
  diameterUnit: PdfExportOptions['diameterUnit'];
}

/**
 * Plain (non-composable) equivalent of `useUnitFormat` for use in pure
 * `pdfExport` builder functions, which must not depend on Vue/Pinia context.
 */
export function createPdfFormatters(
  options: Pick<PdfExportOptions, 'lengthUnit' | 'diameterUnit'>,
): PdfFormatters {
  const { lengthUnit, diameterUnit } = options;

  function formatLength(
    value: number | null | undefined,
    fractionDigits = 2,
  ): string {
    if (value == null) return '—';
    const displayValue = lengthUnit === 'ft' ? metersToFeet(value) : value;
    return formatNumber(displayValue, { fractionDigits, suffix: lengthUnit });
  }

  function formatDiameter(
    value: number | null | undefined,
    fractionDigits = 1,
  ): string {
    if (value == null) return '—';
    const displayValue = diameterUnit === 'inches' ? mmToInches(value) : value;
    return formatNumber(displayValue, { fractionDigits, suffix: diameterUnit });
  }

  function formatVolume(
    volumeM3: number | null | undefined,
    fractionDigits = 2,
  ): string {
    if (volumeM3 == null) return '—';
    if (lengthUnit === 'ft') {
      return formatNumber(volumeM3 * 35.3147, {
        fractionDigits,
        suffix: 'ft³',
      });
    }
    return formatNumber(volumeM3, { fractionDigits, suffix: 'm³' });
  }

  return {
    formatLength,
    formatDiameter,
    formatVolume,
    lengthUnit,
    diameterUnit,
  };
}
