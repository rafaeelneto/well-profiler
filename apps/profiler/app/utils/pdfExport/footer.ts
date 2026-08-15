import { format } from 'date-fns';
import { renderSVG } from 'uqr';
import type { Content, ContentText } from './pdfmake.types';
import type { PdfTranslate } from './types';

export interface FooterShareInfo {
  baseUrl: string;
  shareUrl?: string;
  shareExpiresAt?: string;
}

function hostLabel(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

function buildTagline(
  t: PdfTranslate,
  hasShare: boolean,
  shareExpiresAt?: string,
): ContentText {
  const base: Omit<ContentText, 'text'> = {
    font: 'spaceGrotesk',
    fontSize: 6,
    color: '#494949',
    alignment: 'right',
    width: 46,
  };
  const tagline = hasShare
    ? t('editor.exportPdfDialog.content.footerTagline')
    : t('editor.exportPdfDialog.content.footerTaglineFallback');

  if (!hasShare || !shareExpiresAt) {
    return { ...base, text: tagline };
  }

  const validUntil = `${t('editor.exportPdfDialog.content.footerValidUntilLabel')} ${format(new Date(shareExpiresAt), 'd MMM yyyy')}`;
  return {
    ...base,
    text: [{ text: `${tagline}\n` }, { text: validUntil, fontSize: 5 }],
  };
}

/** Builds the page footer: version/date, host label, and a QR code linking to the shared profile (or `share.baseUrl` as a fallback). */
export function buildFooterContent(
  breakPages: boolean,
  t: PdfTranslate,
  share: FooterShareInfo,
): Content {
  const { baseUrl, shareUrl, shareExpiresAt } = share;
  const qrSvg = renderSVG(shareUrl ?? baseUrl, { pixelSize: 4 });

  return {
    stack: [
      {
        canvas: [
          {
            type: 'line',
            x1: 0,
            y1: 0,
            x2: 535,
            y2: 0,
            lineWidth: 0.5,
            lineColor: '#cccccc',
          },
        ],
        margin: [0, 0, 0, 5],
      },
      {
        columns: [
          {
            text: `.well v2 - ${format(new Date(), 'yyyy-MM-dd')}`,
            font: 'jetBrainsMono',
            fontSize: 7,
            color: '#404040',
            width: 84,
            alignment: 'left',
          },
          {
            text: hostLabel(baseUrl),
            font: 'spaceGrotesk',
            fontSize: 7,
            color: '#494949',
            alignment: 'center',
            width: '*',
          },
          {
            columns: [
              buildTagline(t, Boolean(shareUrl), shareExpiresAt),
              { svg: qrSvg, width: 34, height: 34 },
            ],
            columnGap: 4,
            width: 84,
          },
        ],
      },
    ],
    margin: breakPages ? [30, 10, 30, 10] : [0, 0, 0, 0],
  };
}
