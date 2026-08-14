import type { Well } from '@welldot/core';
import { calculateHoleFillVolume } from '@welldot/utils';
import { createPdfFormatters } from './formatters';
import type { Content, TableCell, TableLayout } from './pdfmake.types';
import type { PdfExportOptions, PdfTranslate } from './types';

const LIGHT_LINES_LAYOUT: TableLayout = {
  hLineWidth: (i, node) => (i === node.table.body.length || i === 0 ? 1 : 0),
  vLineWidth: () => 0,
  hLineColor: () => '#3d3d3d',
};

function headerCell(text: string, alignRight = false): TableCell {
  return {
    text,
    style: alignRight ? ['tableHeader', 'columnRight'] : 'tableHeader',
  };
}

function rightCell(text: string): TableCell {
  return { text, style: 'columnRight' };
}

function sectionTitle(text: string): Content {
  return { text, style: 'title' };
}

function sectionWrapper(title: string, table: Content): Content {
  return { stack: [{ text: ' ' }, sectionTitle(title), table] };
}

function buildCementPadSection(
  well: Well,
  options: PdfExportOptions,
  t: PdfTranslate,
): Content | null {
  const pad = well.cement_pad;
  if (!pad?.thickness || !pad?.width) return null;

  const { formatLength } = createPdfFormatters(options);
  const body: TableCell[][] = [
    [
      headerCell(t('editor.construction.wellhead.thickness')),
      rightCell(formatLength(pad.thickness)),
    ],
    [
      headerCell(t('editor.construction.wellhead.width')),
      rightCell(formatLength(pad.width)),
    ],
    [
      headerCell(t('editor.construction.wellhead.length')),
      rightCell(formatLength(pad.length)),
    ],
    [
      headerCell(t('editor.construction.wellhead.type')),
      rightCell(pad.type ?? '—'),
    ],
  ];

  return sectionWrapper(t('editor.construction.wellhead.cementPad'), {
    layout: LIGHT_LINES_LAYOUT,
    table: { widths: ['*', '*'], dontBreakRows: true, body },
  });
}

function buildIntervalSection(
  items: { from: number; to: number; diameter: number }[],
  title: string,
  options: PdfExportOptions,
  t: PdfTranslate,
): Content | null {
  if (items.length === 0) return null;

  const { formatLength, formatDiameter, diameterUnit, lengthUnit } =
    createPdfFormatters(options);
  const body: TableCell[][] = [
    [
      headerCell(
        `${t('editor.construction.boreHole.diameter')} (${diameterUnit})`,
      ),
      headerCell(
        `${t('editor.construction.boreHole.from')} (${lengthUnit})`,
        true,
      ),
      headerCell(
        `${t('editor.construction.boreHole.to')} (${lengthUnit})`,
        true,
      ),
    ],
  ];
  for (const item of items) {
    body.push([
      { text: formatDiameter(item.diameter) },
      rightCell(formatLength(item.from)),
      rightCell(formatLength(item.to)),
    ]);
  }

  return sectionWrapper(title, {
    layout: 'lightHorizontalLines',
    table: {
      widths: ['auto', 'auto', 'auto'],
      headerRows: 1,
      dontBreakRows: true,
      keepWithHeaderRows: true,
      body,
    },
  });
}

function buildHoleFillSection(
  well: Well,
  options: PdfExportOptions,
  t: PdfTranslate,
): Content | null {
  const items = well.hole_fill;
  if (items.length === 0) return null;

  const {
    formatLength,
    formatDiameter,
    formatVolume,
    diameterUnit,
    lengthUnit,
  } = createPdfFormatters(options);
  const body: TableCell[][] = [
    [
      headerCell(t('editor.construction.holeFill.description')),
      headerCell(
        `${t('editor.construction.holeFill.diameter')} (${diameterUnit})`,
        true,
      ),
      headerCell(
        `${t('editor.construction.holeFill.from')} (${lengthUnit})`,
        true,
      ),
      headerCell(
        `${t('editor.construction.holeFill.to')} (${lengthUnit})`,
        true,
      ),
    ],
  ];

  items.forEach((item, index) => {
    body.push([
      item.description || item.type,
      rightCell(formatDiameter(item.diameter)),
      rightCell(formatLength(item.from)),
      rightCell(formatLength(item.to)),
    ]);

    const next = items[index + 1];
    if (!next || next.type !== item.type) {
      const volumeM3 = calculateHoleFillVolume(item.type, well);
      body.push([
        {
          text: t('editor.exportPdfDialog.content.volumeTotal'),
          style: 'sumRow',
          colSpan: 3,
        },
        {},
        {},
        { text: formatVolume(volumeM3), style: 'sumRow', alignment: 'right' },
      ]);
    }
  });

  return sectionWrapper(t('editor.construction.holeFill.title'), {
    layout: 'lightHorizontalLines',
    table: {
      widths: ['*', 'auto', 'auto', 'auto'],
      headerRows: 1,
      dontBreakRows: true,
      keepWithHeaderRows: true,
      body,
    },
  });
}

function buildWellCaseSection(
  well: Well,
  options: PdfExportOptions,
  t: PdfTranslate,
): Content | null {
  const items = well.well_case;
  if (items.length === 0) return null;

  const { formatLength, formatDiameter, diameterUnit, lengthUnit } =
    createPdfFormatters(options);
  const body: TableCell[][] = [
    [
      headerCell(t('editor.construction.wellCase.type')),
      headerCell(
        `${t('editor.construction.wellCase.diameter')} (${diameterUnit})`,
        true,
      ),
      headerCell(
        `${t('editor.construction.wellCase.from')} (${lengthUnit})`,
        true,
      ),
      headerCell(
        `${t('editor.construction.wellCase.to')} (${lengthUnit})`,
        true,
      ),
    ],
  ];

  items.forEach((item, index) => {
    body.push([
      item.type,
      rightCell(formatDiameter(item.diameter)),
      rightCell(formatLength(item.from)),
      rightCell(formatLength(item.to)),
    ]);

    const next = items[index + 1];
    if (!next || next.type !== item.type || next.diameter !== item.diameter) {
      const totalLength = items
        .filter(el => el.type === item.type && el.diameter === item.diameter)
        .reduce((sum, el) => sum + (el.to - el.from), 0);
      body.push([
        {
          text: t('editor.exportPdfDialog.content.total'),
          style: 'sumRow',
          colSpan: 3,
        },
        {},
        {},
        {
          text: formatLength(totalLength),
          style: 'sumRow',
          alignment: 'right',
        },
      ]);
    }
  });

  return sectionWrapper(t('editor.construction.wellCase.title'), {
    layout: 'lightHorizontalLines',
    table: {
      widths: ['*', 'auto', 'auto', 'auto'],
      headerRows: 1,
      dontBreakRows: true,
      keepWithHeaderRows: true,
      body,
    },
  });
}

function buildWellScreenSection(
  well: Well,
  options: PdfExportOptions,
  t: PdfTranslate,
): Content | null {
  const items = well.well_screen;
  if (items.length === 0) return null;

  const { formatLength, formatDiameter, diameterUnit, lengthUnit } =
    createPdfFormatters(options);
  const body: TableCell[][] = [
    [
      headerCell(t('editor.construction.wellScreen.type')),
      headerCell(
        `${t('editor.construction.wellScreen.diameter')} (${diameterUnit})`,
        true,
      ),
      headerCell(
        `${t('editor.exportPdfDialog.content.slot')} (${diameterUnit})`,
        true,
      ),
      headerCell(
        `${t('editor.construction.wellScreen.from')} (${lengthUnit})`,
        true,
      ),
      headerCell(
        `${t('editor.construction.wellScreen.to')} (${lengthUnit})`,
        true,
      ),
    ],
  ];

  items.forEach((item, index) => {
    body.push([
      item.type,
      rightCell(formatDiameter(item.diameter)),
      rightCell(formatDiameter(item.screen_slot)),
      rightCell(formatLength(item.from)),
      rightCell(formatLength(item.to)),
    ]);

    const next = items[index + 1];
    if (!next || next.type !== item.type || next.diameter !== item.diameter) {
      const totalLength = items
        .filter(el => el.type === item.type && el.diameter === item.diameter)
        .reduce((sum, el) => sum + (el.to - el.from), 0);
      body.push([
        {
          text: t('editor.exportPdfDialog.content.total'),
          style: 'sumRow',
          colSpan: 4,
        },
        {},
        {},
        {},
        {
          text: formatLength(totalLength),
          style: 'sumRow',
          alignment: 'right',
        },
      ]);
    }
  });

  return sectionWrapper(t('editor.construction.wellScreen.title'), {
    layout: 'lightHorizontalLines',
    table: {
      widths: ['*', 'auto', 'auto', 'auto', 'auto'],
      headerRows: 1,
      dontBreakRows: true,
      keepWithHeaderRows: true,
      body,
    },
  });
}

/**
 * Builds the per-feature summary tables (cement pad, bore hole, surface
 * casing, hole fill w/ gravel-pack volume, casing, screen), each omitted
 * when its corresponding `well.*` array/field is empty.
 */
export function buildSectionTables(
  well: Well,
  options: PdfExportOptions,
  t: PdfTranslate,
): Content[] {
  const sections = [
    buildCementPadSection(well, options, t),
    buildIntervalSection(
      well.bore_hole,
      t('editor.construction.boreHole.title'),
      options,
      t,
    ),
    buildIntervalSection(
      well.surface_case,
      t('editor.construction.surfaceCase.title'),
      options,
      t,
    ),
    buildHoleFillSection(well, options, t),
    buildWellCaseSection(well, options, t),
    buildWellScreenSection(well, options, t),
  ];

  return sections.filter((section): section is Content => section !== null);
}
