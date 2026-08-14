import type { Well } from '@welldot/core';
import { format, parseISO } from 'date-fns';
import { formatCoord } from '~/utils/coords';
import { createPdfFormatters } from './formatters';
import type { Content, TableCell } from './pdfmake.types';
import type { PdfExportOptions, PdfTranslate } from './types';

interface MetaField {
  label: string;
  value: string;
}

/** Packs `label \n value` cells `columns`-per-row, padding the last row with blanks. */
export function packLabelValueRows(
  fields: MetaField[],
  columns: number,
): TableCell[][] {
  const cells: TableCell[] = fields.map(field => ({
    width: '*',
    text: [
      { text: `${field.label} \n`, style: 'metadataLabel' },
      { text: field.value, style: 'metadataValue' },
    ],
  }));

  const rows: TableCell[][] = [];
  cells.forEach((cell, i) => {
    if (i % columns === 0) rows.push([cell]);
    else rows[rows.length - 1]!.push(cell);
  });

  const lastRow = rows[rows.length - 1];
  if (lastRow) {
    while (lastRow.length < columns) lastRow.push({ width: '*', text: '' });
  }
  return rows;
}

/**
 * Builds the well-metadata table (name, type, driller, construction date,
 * coordinates, elevation, observations), omitting fields with no value and
 * returning `null` when none are populated.
 */
export function buildMetadataTable(
  well: Well,
  options: PdfExportOptions,
  t: PdfTranslate,
): Content | null {
  const { formatLength } = createPdfFormatters(options);

  const fields: MetaField[] = [];

  if (well.name) {
    fields.push({ label: t('editor.general.name'), value: well.name });
  }
  if (well.well_type) {
    fields.push({ label: t('editor.general.wellType'), value: well.well_type });
  }
  if (well.well_driller) {
    fields.push({
      label: t('editor.general.driller'),
      value: well.well_driller,
    });
  }
  if (well.construction_date) {
    fields.push({
      label: t('editor.general.constructionDate'),
      value: format(parseISO(well.construction_date), 'dd/MM/yyyy'),
    });
  }
  if (well.location?.lat != null && well.location?.lng != null) {
    fields.push({
      label: t('editor.general.coordinates'),
      value: `${formatCoord(well.location.lat, options.coordinateFormat, true)}, ${formatCoord(well.location.lng, options.coordinateFormat, false)}`,
    });
  }
  if (well.location?.elevation != null) {
    fields.push({
      label: t('editor.general.elevation'),
      value: formatLength(well.location.elevation),
    });
  }
  if (well.obs) {
    fields.push({
      label: t('editor.general.observationsLabel'),
      value: well.obs,
    });
  }

  if (fields.length === 0) return null;

  return {
    layout: 'noBorders',
    table: {
      widths: ['*', '*', '*'],
      dontBreakRows: false,
      body: packLabelValueRows(fields, 3),
    },
  };
}
