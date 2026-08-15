import { renderSVG } from 'uqr';
import { describe, expect, it, vi } from 'vitest';
import { buildFooterContent, type FooterShareInfo } from './footer';

vi.mock('uqr', () => ({
  renderSVG: vi.fn((text: string) => `<svg data-text="${text}"></svg>`),
}));

const t = (key: string) => key;

// Deliberately not welldot.org/pages.dev-shaped, so a test passing can't be
// explained by a hardcoded fallback matching this value by coincidence.
const BASE_URL = 'https://example.test:4173';
const SHARE_URL = 'https://example.test:4173/editor?share=abc123';

function share(overrides: Partial<FooterShareInfo> = {}): FooterShareInfo {
  return { baseUrl: BASE_URL, ...overrides };
}

describe('buildFooterContent', () => {
  it('labels the footer with the host derived from baseUrl, protocol/port stripped from the label', () => {
    const doc = buildFooterContent(true, t, share()) as {
      stack: [unknown, { columns: [unknown, { text: string }, unknown] }];
    };
    const [, row] = doc.stack;
    expect(row.columns[1].text).toBe('example.test:4173');
  });

  it('encodes a QR svg', () => {
    const content = JSON.stringify(buildFooterContent(true, t, share()));
    expect(content).toContain('<svg');
  });

  it('uses page margins when breakPages is true, none otherwise', () => {
    const withBreaks = buildFooterContent(true, t, share()) as {
      margin: number[];
    };
    const withoutBreaks = buildFooterContent(false, t, share()) as {
      margin: number[];
    };
    expect(withBreaks.margin).toEqual([30, 10, 30, 10]);
    expect(withoutBreaks.margin).toEqual([0, 0, 0, 0]);
  });

  it('encodes shareUrl in the QR when provided', () => {
    buildFooterContent(true, t, share({ shareUrl: SHARE_URL }));
    expect(renderSVG).toHaveBeenCalledWith(SHARE_URL, expect.anything());
  });

  it('falls back to baseUrl in the QR when shareUrl is absent', () => {
    buildFooterContent(true, t, share());
    expect(renderSVG).toHaveBeenCalledWith(BASE_URL, expect.anything());
  });

  it('uses the fallback tagline (not the share tagline) when shareUrl is absent', () => {
    const content = JSON.stringify(buildFooterContent(true, t, share()));
    expect(content).toContain('footerTaglineFallback');
    expect(content).not.toContain('"footerTagline"');
  });

  it('uses the share tagline and omits a valid-until line when shareUrl has no expiresAt', () => {
    const content = JSON.stringify(
      buildFooterContent(true, t, share({ shareUrl: SHARE_URL })),
    );
    expect(content).toContain('footerTagline');
    expect(content).not.toContain('footerValidUntilLabel');
  });

  it('appends a valid-until line when both shareUrl and shareExpiresAt are given', () => {
    // Noon UTC keeps the formatted day stable regardless of the test
    // runner's local timezone (`format` renders in local time).
    const content = JSON.stringify(
      buildFooterContent(
        true,
        t,
        share({
          shareUrl: SHARE_URL,
          shareExpiresAt: '2026-09-14T12:00:00.000Z',
        }),
      ),
    );
    expect(content).toContain('footerValidUntilLabel');
    expect(content).toContain('14 Sep 2026');
  });
});
