const _fileHandle = ref<FileSystemFileHandle | null>(null);

const hasFileSystemAccess =
  typeof window !== 'undefined' &&
  'showOpenFilePicker' in window &&
  'showSaveFilePicker' in window;

const _wellFileTypes: FilePickerAcceptType[] = [
  {
    description: 'Well Profile',
    accept: { 'application/json': ['.well', '.json'] },
  },
];

/**
 * Singleton composable managing a FileSystemFileHandle for the active .well
 * file. When the File System Access API is unavailable (Firefox, older Safari),
 * open() returns null and save/saveAs fall back to a blob download.
 */
export function useFilePersistence() {
  const hasFileHandle = computed(() => _fileHandle.value !== null);
  const fileName = computed(() => _fileHandle.value?.name ?? null);

  async function open(): Promise<string | null> {
    if (import.meta.server || !hasFileSystemAccess) return null;
    try {
      const handles = await window.showOpenFilePicker({
        types: _wellFileTypes,
        multiple: false,
      });
      const handle = handles[0];
      if (!handle) return null;
      _fileHandle.value = handle;
      const file = await handle.getFile();
      return file.text();
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') return null;
      throw e;
    }
  }

  async function save(json: string, suggestedName?: string): Promise<boolean> {
    if (import.meta.server) return false;
    if (!_fileHandle.value) return saveAs(json, suggestedName);
    try {
      const writable = await _fileHandle.value.createWritable();
      await writable.write(json);
      await writable.close();
      return true;
    } catch (e) {
      if ((e as DOMException).name === 'NotAllowedError') {
        // Permission was revoked — fall back to saveAs so the user can re-grant
        return saveAs(json, suggestedName);
      }
      throw e;
    }
  }

  async function saveAs(json: string, suggestedName?: string): Promise<boolean> {
    if (import.meta.server) return false;
    if (!hasFileSystemAccess) {
      _downloadFallback(json, suggestedName ?? 'well.well');
      return true;
    }
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: suggestedName ?? 'well.well',
        types: _wellFileTypes,
      });
      _fileHandle.value = handle;
      const writable = await handle.createWritable();
      await writable.write(json);
      await writable.close();
      return true;
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') return false;
      throw e;
    }
  }

  function clearHandle(): void {
    _fileHandle.value = null;
  }

  return { hasFileSystemAccess, hasFileHandle, fileName, open, save, saveAs, clearHandle };
}

function _downloadFallback(json: string, name: string): void {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
