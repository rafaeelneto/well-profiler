import type { PdfMakeStatic } from './pdfmake.types';

let registered = false;

/**
 * Registers the custom PDF font set (JetBrains Mono, Space Grotesk,
 * IBM Plex Serif) with `pdfmake`'s virtual file system. Idempotent and
 * side-effect-free beyond the first call.
 *
 * The font data (`vfsFontsData`, ~1.7MB) is dynamically imported so it
 * never enters the SSR/server bundle — PDF generation is client-only.
 */
export async function registerPdfFonts(pdfMake: PdfMakeStatic): Promise<void> {
  if (registered) return;

  const { default: vfsFontsData } = await import('./vfsFontsData');

  pdfMake.addVirtualFileSystem(vfsFontsData);
  pdfMake.addFonts({
    jetBrainsMono: {
      normal: 'JetBrainsMono-Regular.ttf',
      bold: 'JetBrainsMono-Bold.ttf',
      italics: 'JetBrainsMono-Italic.ttf',
      bolditalics: 'JetBrainsMono-BoldItalic.ttf',
    },
    spaceGrotesk: {
      normal: 'SpaceGrotesk-Regular.ttf',
      bold: 'SpaceGrotesk-Bold.ttf',
      italics: 'SpaceGrotesk-Regular.ttf',
      bolditalics: 'SpaceGrotesk-Bold.ttf',
    },
    ibmPlexSerif: {
      normal: 'IBMPlexSerif-Regular.ttf',
      bold: 'IBMPlexSerif-Bold.ttf',
      italics: 'IBMPlexSerif-Italic.ttf',
      bolditalics: 'IBMPlexSerif-BoldItalic.ttf',
    },
  });

  registered = true;
}
