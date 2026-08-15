import { isWellEmpty, serializeWell } from '@welldot/core';
import { ref } from 'vue';
import { useProfileStore } from '~/stores/profile.store';
import { copyToClipboard } from '~/utils/clipboard';

export interface ShareResult {
  id: string;
  expiresAt: string;
}

export type CopyShareLinkResult =
  | { ok: true; url: string; expiresAt: string }
  | { ok: false; reason: 'empty' | 'tooLarge' | 'error' };

const shareCache = new Map<string, ShareResult>();

export function useProfileShare() {
  const profileStore = useProfileStore();
  const isGenerating = ref(false);

  /** Returns the share id/expiry for the current profile, or `null` if it's empty. Caches by content. */
  async function getShare(): Promise<ShareResult | null> {
    const well = profileStore.getExportableWell();
    if (!well || isWellEmpty(well)) return null;

    const key = serializeWell(well);
    const cached = shareCache.get(key);
    if (cached) return cached;

    isGenerating.value = true;
    try {
      const result = await $fetch<ShareResult>('/api/share', {
        method: 'POST',
        body: { well },
      });
      shareCache.set(key, result);
      return result;
    } finally {
      isGenerating.value = false;
    }
  }

  /** Generates (or reuses) a share id and copies its link to the clipboard. */
  async function copyShareLink(): Promise<CopyShareLinkResult> {
    try {
      const share = await getShare();
      if (!share) return { ok: false, reason: 'empty' };

      const url = `${useRequestURL().origin}/editor?share=${share.id}`;
      const copied = await copyToClipboard(url);
      return copied
        ? { ok: true, url, expiresAt: share.expiresAt }
        : { ok: false, reason: 'error' };
    } catch (err) {
      const statusCode = (err as { statusCode?: number } | undefined)
        ?.statusCode;
      return { ok: false, reason: statusCode === 413 ? 'tooLarge' : 'error' };
    }
  }

  return { getShare, copyShareLink, isGenerating };
}
