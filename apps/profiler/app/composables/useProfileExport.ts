import { serializeWell } from '@welldot/core';

/**
 * Composable for exporting the current profile.
 *
 * Raw serialisation is delegated here so the store stays free of DOM and
 * browser-specific concerns. The store provides `getExportableWell()` which
 * returns the key-free Well ready for serialisation.
 */
export function useProfileExport() {
  const store = useProfileStore();
  const persistence = useFilePersistence();

  /** Serialise the current well to a JSON string, or null if no well is loaded. */
  function getRawJson(): string | null {
    const well = store.getExportableWell();
    if (!well) return null;
    return serializeWell(well);
  }

  function _defaultName(): string {
    const well = store.getExportableWell();
    return `${well?.name ?? 'well'}.well`;
  }

  /**
   * Save to the currently open file handle, or prompt with Save As if no
   * handle exists. Falls back to a blob download on unsupported browsers.
   */
  async function save(): Promise<void> {
    if (import.meta.server) return;
    const json = getRawJson();
    if (!json) return;
    const ok = await persistence.save(json, _defaultName());
    if (ok) store.markClean();
  }

  /**
   * Always prompt the user to choose a save location, then store the new
   * handle for future saves. Falls back to download on unsupported browsers.
   */
  async function saveAs(): Promise<void> {
    if (import.meta.server) return;
    const json = getRawJson();
    if (!json) return;
    const ok = await persistence.saveAs(json, _defaultName());
    if (ok) store.markClean();
  }

  /**
   * Trigger a `.well` file download in the browser.
   * No-ops on the server (SSR guard) and when no well is loaded.
   *
   * @param filename - Override the default `<wellName>.well` filename.
   */
  function download(filename?: string): void {
    if (import.meta.server) return;

    const json = getRawJson();
    if (!json) return;

    const name = filename ?? _defaultName();

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return { getRawJson, save, saveAs, download };
}
