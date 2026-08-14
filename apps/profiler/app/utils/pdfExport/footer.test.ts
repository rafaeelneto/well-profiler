import { describe, expect, it } from 'vitest';
import { buildFooterContent } from './footer';

const t = (key: string) => key;

describe('buildFooterContent', () => {
  it('references welldot.org, not the legacy domain', () => {
    const content = JSON.stringify(buildFooterContent(true, t));
    expect(content).toContain('welldot.org');
    expect(content).not.toContain('wellprofiler.com');
  });

  it('encodes a welldot.org URL in the QR svg', () => {
    const content = JSON.stringify(buildFooterContent(true, t));
    expect(content).toContain('<svg');
  });

  it('uses page margins when breakPages is true, none otherwise', () => {
    const withBreaks = buildFooterContent(true, t) as { margin: number[] };
    const withoutBreaks = buildFooterContent(false, t) as { margin: number[] };
    expect(withBreaks.margin).toEqual([30, 10, 30, 10]);
    expect(withoutBreaks.margin).toEqual([0, 0, 0, 0]);
  });
});
