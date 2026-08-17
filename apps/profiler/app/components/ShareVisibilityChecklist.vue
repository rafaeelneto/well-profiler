<script setup lang="ts">
import { SECTION_KEYS } from '@welldot/core';

const { t } = useI18n();
const shareVisibilityStore = useShareVisibilityStore();
</script>

<template>
  <div class="flex flex-col gap-2.5">
    <label
      v-for="key in SECTION_KEYS"
      :key="key"
      class="flex items-center gap-2.5 text-sm text-content-0 cursor-pointer"
    >
      <Checkbox
        :model-value="shareVisibilityStore.visibility[key]"
        binary
        :disabled="
          shareVisibilityStore.visibility[key] &&
          shareVisibilityStore.visibleCount === 1
        "
        @update:model-value="value => shareVisibilityStore.setVisible(key, value)"
      />
      {{ t(`editor.shareVisibility.sections.${key}`) }}
    </label>
  </div>
</template>
