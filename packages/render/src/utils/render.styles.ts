import sanitizeHtml from 'sanitize-html';
import { WellTheme } from '~/types/render.types';

/** Strips all HTML/CSS-breaking characters from a theme string value before CSS injection. */
const sanitizeCssValue = (v: unknown): string =>
  sanitizeHtml(String(v ?? ''), { allowedTags: [], allowedAttributes: {} });

export function buildSvgStyleBlock(theme: WellTheme): string {
  const { labels, lithology } = theme;
  const s = sanitizeCssValue;
  return [
    `.wp-lithology-depth-tip{border:0.5px solid ${s(lithology.stroke)};font-size:${s(labels.fontSize)}px;color:${s(labels.color)}}`,
    `.wp-annotation-label{font-size:${s(labels.fontSize)}px}`,
    `.wp-annotation-header{font-weight:${s(labels.headerFontWeight ?? 600)};font-family:${s(labels.headerFont)};font-size:${s(labels.fontSize)}px;color:${s(labels.color)}}`,
    `.wp-annotation-body{font-weight:${s(labels.bodyFontWeight ?? 400)};font-family:${s(labels.bodyFont ?? 'sans-serif')};font-size:${s(labels.fontSize)}px;color:${s(labels.bodyColor)}}`,
    `.wp-depth-tip-text{font-family:${s(labels.bodyFont ?? 'sans-serif')};font-size:${s(labels.fontSize)}px;color:${s(labels.color)}}`,
    `.wp-tooltip{position:absolute;z-index:1000;display:flex;flex-direction:column;gap:2px;max-width:240px;padding:8px 10px;border-radius:6px;background:${s(labels.annotationBg)};border:1px solid ${s(labels.annotationBorderColor ?? 'rgba(0,0,0,0.08)')};box-shadow:0 4px 12px rgba(0,0,0,0.15);font-family:${s(labels.bodyFont ?? 'sans-serif')};line-height:1.45}`,
    `.wp-tooltip-title{font-family:${s(labels.headerFont)};font-weight:${s(labels.headerFontWeight ?? 600)};font-size:10px;letter-spacing:0.06em;text-transform:uppercase;color:${s(labels.color)}}`,
    `.wp-tooltip-primary{font-weight:${s(labels.headerFontWeight ?? 600)};font-size:12px;color:${s(labels.color)}}`,
    `.wp-tooltip-secondary{font-size:11px;color:${s(labels.bodyColor)}}`,
  ].join('');
}
