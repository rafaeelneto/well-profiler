import type { SectionKey, SectionVisibility } from '@welldot/core';
import { SECTION_KEYS } from '@welldot/core';
import { defineStore } from 'pinia';

export const useShareVisibilityStore = defineStore(
  'shareVisibility',
  () => {
    const visibility = ref<SectionVisibility>({
      general: true,
      constructive: true,
      geology: true,
      hydrodynamic: true,
      history: true,
    });

    const visibleCount = computed(
      () => SECTION_KEYS.filter(key => visibility.value[key]).length,
    );
    const hasHidden = computed(() => visibleCount.value < SECTION_KEYS.length);

    /** Sets a section's visibility. No-ops if it would hide the last visible section. */
    function setVisible(key: SectionKey, value: boolean): void {
      if (!value && visibleCount.value <= 1 && visibility.value[key]) return;
      visibility.value[key] = value;
    }

    return { visibility, visibleCount, hasHidden, setVisible };
  },
  {
    persist: { key: 'welldot_share_visibility' },
  },
);
