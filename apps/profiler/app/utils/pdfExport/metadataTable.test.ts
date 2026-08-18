/* eslint-disable camelcase -- .well schema fields (bore_hole, well_case, ...) are intentionally snake_case */
import type { Well } from '@welldot/core';
import { describe, expect, it } from 'vitest';
import { buildMetadataTable } from './metadataTable';
import type { PdfExportOptions } from './types';

function baseWell(overrides: Partial<Well> = {}): Well {
  return {
    version: 2,
    bore_hole: [],
    well_case: [],
    reduction: [],
    well_screen: [],
    surface_case: [],
    hole_fill: [],
    lithology: [],
    fractures: [],
    caves: [],
    ...overrides,
  };
}

const baseOptions: PdfExportOptions = {
  header: 'Header',
  breakPages: false,
  scale: 500,
  metadataPosition: 'before',
  headingInfo: [],
  endInfo: [],
  lengthUnit: 'm',
  diameterUnit: 'mm',
  coordinateFormat: 'DD',
  locale: 'pt',
  baseUrl: 'https://example.test',
};

const t = (key: string) => key;

describe('buildMetadataTable', () => {
  it('returns null when no metadata field is populated', () => {
    expect(buildMetadataTable(baseWell(), baseOptions, t)).toBeNull();
  });

  it('includes only populated fields', () => {
    const well = baseWell({ name: 'Well A', well_driller: 'Acme Drilling' });
    const table = buildMetadataTable(well, baseOptions, t);
    expect(table).not.toBeNull();
    const serialized = JSON.stringify(table);
    expect(serialized).toContain('Well A');
    expect(serialized).toContain('Acme Drilling');
    expect(serialized).not.toContain('editor.general.wellType');
  });

  it('formats coordinates via coordinateFormat and elevation via lengthUnit', () => {
    const well = baseWell({
      location: { lat: -23.5, lng: -46.6, elevation: 760 },
    });
    const table = buildMetadataTable(
      well,
      { ...baseOptions, lengthUnit: 'ft' },
      t,
    );
    const serialized = JSON.stringify(table);
    expect(serialized).toContain('ft');
  });

  it('formats construction_date as dd/MM/yyyy', () => {
    const well = baseWell({ construction_date: '2024-03-05' });
    const table = buildMetadataTable(well, baseOptions, t);
    expect(JSON.stringify(table)).toContain('05/03/2024');
  });

  it('includes well identifiers, marking the primary one', () => {
    const well = baseWell({
      well_id: [
        { authority: 'SIAGAS', id: 'SP-0042819', primary: true },
        { authority: 'ANA', id: '12345' },
        { authority: '', id: 'no-authority' },
      ],
    });
    const serialized = JSON.stringify(buildMetadataTable(well, baseOptions, t));
    expect(serialized).toContain('SIAGAS (editor.general.wellIds.primary)');
    expect(serialized).toContain('SP-0042819');
    expect(serialized).toContain('ANA');
    expect(serialized).toContain('12345');
    expect(serialized).toContain('editor.general.wellIds.id');
    expect(serialized).toContain('no-authority');
  });

  it('skips well_id entries with no id', () => {
    const well = baseWell({ well_id: [{ authority: 'SIAGAS', id: '' }] });
    expect(buildMetadataTable(well, baseOptions, t)).toBeNull();
  });
});
