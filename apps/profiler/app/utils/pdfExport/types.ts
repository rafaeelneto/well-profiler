import type { DiameterUnits, LengthUnits } from '@welldot/core';
import type { CoordinateFormat } from '~/stores/ui.store';

/** `useI18n().t`, narrowed to what the pure `pdfExport` builders need. */
export type PdfTranslate = (_key: string) => string;

export interface ResolvedInfoItem {
  label: string;
  /** Already resolved via `useWellMetadataFields().resolveMetadataValue` when the source item had `profileField` set. */
  value: string;
}

export interface PdfExportOptions {
  header: string;
  breakPages: boolean;
  /** 1:N scale ratio, matches `pdfExportStore.scale`. */
  scale: number;
  metadataPosition: 'before' | 'after' | null;
  headingInfo: ResolvedInfoItem[];
  endInfo: ResolvedInfoItem[];
  lengthUnit: LengthUnits;
  diameterUnit: DiameterUnits;
  coordinateFormat: CoordinateFormat;
  /** Origin the PDF is being generated from (e.g. `useRequestURL().origin`). Footer QR/branding fall back to this when there's no `shareUrl`. */
  baseUrl: string;
  /** Share link for the exported profile. Falls back to the `baseUrl` QR when absent. */
  shareUrl?: string;
  /** ISO timestamp the share expires at; shown as "valid until" next to the footer QR when `shareUrl` is set. */
  shareExpiresAt?: string;
}

export interface RenderedSvg {
  /** `outerHTML` of the rendered `<svg>` element. */
  markup: string;
  width: number;
  height: number;
}
