/* eslint-disable camelcase -- .well schema fields (bore_hole, well_case, ...) are intentionally snake_case */
import type { Well } from '@welldot/core';
import { describe, expect, it } from 'vitest';
import { buildDocDefinition } from './buildDocDefinition';
import type { PdfExportOptions, RenderedSvg } from './types';

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

// Deliberately not welldot.org-shaped, so a passing assertion can't be
// explained by a hardcoded fallback matching this value by coincidence.
const BASE_URL = 'https://example.test';

const baseOptions: PdfExportOptions = {
  header: 'My Well Profile',
  breakPages: false,
  scale: 500,
  metadataPosition: null,
  headingInfo: [],
  endInfo: [],
  lengthUnit: 'm',
  diameterUnit: 'mm',
  coordinateFormat: 'DD',
  baseUrl: BASE_URL,
};

const t = (key: string) => key;

const svg: RenderedSvg = { markup: '<svg></svg>', width: 400, height: 600 };

describe('buildDocDefinition', () => {
  it('renders one SVG panel per page with no pageBreak on the first', () => {
    const doc = buildDocDefinition(
      baseWell(),
      [svg, svg],
      null,
      baseOptions,
      t,
    );
    const svgBlocks = doc.content.filter(
      (c): c is { svg: string; pageBreak?: string } =>
        typeof c === 'object' && 'svg' in c,
    );
    expect(svgBlocks).toHaveLength(2);
    expect(svgBlocks[0]!.pageBreak).toBeUndefined();
  });

  it('adds pageBreak before subsequent panels when breakPages is true', () => {
    const doc = buildDocDefinition(
      baseWell(),
      [svg, svg],
      null,
      { ...baseOptions, breakPages: true },
      t,
    );
    const svgBlocks = doc.content.filter(
      (c): c is { svg: string; pageBreak?: string } =>
        typeof c === 'object' && 'svg' in c,
    );
    expect(svgBlocks[0]!.pageBreak).toBeUndefined();
    expect(svgBlocks[1]!.pageBreak).toBe('before');
  });

  it('omits the metadata table entirely when metadataPosition is null', () => {
    const well = baseWell({ name: 'Well A' });
    const doc = buildDocDefinition(well, [svg], null, baseOptions, t);
    expect(JSON.stringify(doc.content)).not.toContain('Well A');
  });

  it('places the populated metadata table before the SVG when "before"', () => {
    const well = baseWell({ name: 'Well A' });
    const doc = buildDocDefinition(
      well,
      [svg],
      null,
      { ...baseOptions, metadataPosition: 'before' },
      t,
    );
    const svgIndex = doc.content.findIndex(
      c => typeof c === 'object' && 'svg' in c,
    );
    const metaIndex = doc.content.findIndex(c =>
      JSON.stringify(c).includes('Well A'),
    );
    expect(metaIndex).toBeGreaterThanOrEqual(0);
    expect(metaIndex).toBeLessThan(svgIndex);
  });

  it('places the populated metadata table after the SVG when "after"', () => {
    const well = baseWell({ name: 'Well A' });
    const doc = buildDocDefinition(
      well,
      [svg],
      null,
      { ...baseOptions, metadataPosition: 'after' },
      t,
    );
    const svgIndex = doc.content.findIndex(
      c => typeof c === 'object' && 'svg' in c,
    );
    const metaIndex = doc.content.findIndex(c =>
      JSON.stringify(c).includes('Well A'),
    );
    expect(metaIndex).toBeGreaterThan(svgIndex);
  });

  it('omits heading/end info tables when empty', () => {
    const doc = buildDocDefinition(baseWell(), [svg], null, baseOptions, t);
    expect(JSON.stringify(doc.content)).not.toContain('finalInfo');
  });

  it('renders heading and end info as tables when non-empty', () => {
    const doc = buildDocDefinition(
      baseWell(),
      [svg],
      null,
      {
        ...baseOptions,
        headingInfo: [{ label: 'Client', value: 'Acme' }],
        endInfo: [{ label: 'Notes', value: 'All good' }],
      },
      t,
    );
    const serialized = JSON.stringify(doc.content);
    expect(serialized).toContain('Client');
    expect(serialized).toContain('Acme');
    expect(serialized).toContain('Notes');
    expect(serialized).toContain('All good');
  });

  it('includes the legend svg when provided', () => {
    const legend: RenderedSvg = {
      markup: '<svg id="legend"></svg>',
      width: 500,
      height: 40,
    };
    const doc = buildDocDefinition(baseWell(), [svg], legend, baseOptions, t);
    expect(JSON.stringify(doc.content)).toContain('legend');
  });

  it('sets page height to auto when breakPages is false, fixed A4 otherwise', () => {
    const single = buildDocDefinition(baseWell(), [svg], null, baseOptions, t);
    expect(single.pageSize?.height).toBe('auto');

    const paged = buildDocDefinition(
      baseWell(),
      [svg],
      null,
      { ...baseOptions, breakPages: true },
      t,
    );
    expect(paged.pageSize?.height).toBe(841.89);
  });

  it('appends the footer inline only when breakPages is false', () => {
    const single = buildDocDefinition(baseWell(), [svg], null, baseOptions, t);
    expect(JSON.stringify(single.content)).toContain('example.test');

    const paged = buildDocDefinition(
      baseWell(),
      [svg],
      null,
      { ...baseOptions, breakPages: true },
      t,
    );
    expect(JSON.stringify(paged.content)).not.toContain('example.test');
    expect(paged.footer?.(1, 2)).toBeDefined();
    expect(paged.footer && !paged.footer(1, 2)).toBeFalsy();
  });

  it('threads options.shareUrl through to the footer QR', () => {
    const withoutShareUrl = buildDocDefinition(
      baseWell(),
      [svg],
      null,
      baseOptions,
      t,
    );
    const withShareUrl = buildDocDefinition(
      baseWell(),
      [svg],
      null,
      { ...baseOptions, shareUrl: `${BASE_URL}/s/abc123` },
      t,
    );
    expect(JSON.stringify(withShareUrl.content)).not.toEqual(
      JSON.stringify(withoutShareUrl.content),
    );
  });
});
