// @vitest-environment jsdom

import type { RenderableWell } from '@welldot/render';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  A4_SVG_HEIGHT,
  buildSvgProfiles,
  computePageHeights,
  computeTotalSvgHeight,
} from './buildSvgProfiles';

// `WellRenderer` relies on SVG geometry APIs (`createSVGPoint`, etc.) jsdom
// doesn't implement. Mock it so this test exercises buildSvgProfiles' own
// wiring (panel count, selectors, attribute readback) instead of the real
// D3 draw pipeline, which @welldot/render already owns test coverage for.
const drawnSelectors: string[] = [];
vi.mock('@welldot/render', () => ({
  STATIC_RENDER_CONFIG: { legend: { height: 44, maxWidth: 700 } },
  applyRenderLocale: (config: unknown) => config,
  WellRenderer: class {
    private svgs: { selector: string }[];
    constructor(svgs: { selector: string }[]) {
      this.svgs = svgs;
      drawnSelectors.push(...svgs.map(s => s.selector));
    }
    async prepareSvg() {
      for (const { selector } of this.svgs) {
        const el = document.querySelector(selector);
        el?.setAttribute('width', '485.28');
        el?.setAttribute('height', '200');
      }
    }
    draw() {}
    renderLegend(selector: string) {
      const el = document.querySelector(selector);
      el?.setAttribute('width', '535.28');
      el?.setAttribute('height', '40');
    }
  },
}));

function makeWell(): RenderableWell {
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
  } as unknown as RenderableWell;
}

describe('computeTotalSvgHeight', () => {
  it('scales linearly with depth', () => {
    expect(computeTotalSvgHeight(20, 500)).toBeCloseTo(
      computeTotalSvgHeight(10, 500) * 2,
    );
  });

  it('scales inversely with the 1:N ratio', () => {
    expect(computeTotalSvgHeight(10, 1000)).toBeCloseTo(
      computeTotalSvgHeight(10, 500) / 2,
    );
  });
});

describe('computePageHeights', () => {
  it('breakPages=false always yields exactly one page', () => {
    expect(computePageHeights(2000, false)).toEqual([2000]);
    expect(computePageHeights(0, false)).toEqual([0]);
  });

  it('breakPages=true splits into A4-height pages', () => {
    const heights = computePageHeights(A4_SVG_HEIGHT * 2.5, true);
    expect(heights).toHaveLength(3);
    expect(heights[0]).toBeCloseTo(A4_SVG_HEIGHT);
    expect(heights[1]).toBeCloseTo(A4_SVG_HEIGHT);
    expect(heights[2]).toBeCloseTo(A4_SVG_HEIGHT * 0.5);
  });

  it('reduces the first page by firstPageAvailableHeight', () => {
    const reducedFirst = A4_SVG_HEIGHT / 2;
    const heights = computePageHeights(A4_SVG_HEIGHT * 1.5, true, reducedFirst);
    expect(heights[0]).toBeCloseTo(reducedFirst);
    expect(heights.reduce((a, b) => a + b, 0)).toBeCloseTo(A4_SVG_HEIGHT * 1.5);
  });
});

describe('buildSvgProfiles', () => {
  beforeEach(() => {
    drawnSelectors.length = 0;
  });

  it('creates one panel per computed page height and reads back their markup', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const result = await buildSvgProfiles(makeWell(), container, {
      breakPages: false,
      scale: 500,
      units: { length: 'm', diameter: 'mm' },
      locale: 'pt',
    });

    expect(result.svgs).toHaveLength(1);
    expect(result.svgs[0]?.width).toBe(485.28);
    expect(result.svgs[0]?.markup).toContain('<svg');
    expect(result.legendSvg).not.toBeNull();
    expect(drawnSelectors).toEqual(['#pdf-export-svg-panel-0']);
  });

  it('clears previously drawn panels between calls', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    await buildSvgProfiles(makeWell(), container, {
      breakPages: false,
      scale: 500,
      units: { length: 'm', diameter: 'mm' },
      locale: 'pt',
    });
    await buildSvgProfiles(makeWell(), container, {
      breakPages: false,
      scale: 500,
      units: { length: 'm', diameter: 'mm' },
      locale: 'pt',
    });

    expect(container.querySelectorAll('svg')).toHaveLength(2);
  });
});
