import { format } from 'date-fns';
import { renderSVG } from 'uqr';
import type { Content } from './pdfmake.types';
import type { PdfTranslate } from './types';

const WELLDOT_URL = 'https://welldot.org';

/** Builds the page footer: version/date, welldot.org, and a QR code linking to it. */
export function buildFooterContent(
  breakPages: boolean,
  t: PdfTranslate,
): Content {
  const qrSvg = renderSVG(WELLDOT_URL, { pixelSize: 4 });

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
            text: 'welldot.org',
            font: 'spaceGrotesk',
            fontSize: 7,
            color: '#494949',
            alignment: 'center',
            width: '*',
          },
          {
            columns: [
              {
                text: t('editor.exportPdfDialog.content.footerTagline'),
                font: 'spaceGrotesk',
                fontSize: 7,
                color: '#494949',
                alignment: 'right',
                width: 46,
              },
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
