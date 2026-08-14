<script setup lang="ts">
defineProps<{
  value?: unknown;
}>();
</script>

<template>
  <span class="flex h-full w-full items-center gap-1.5">
    <template v-if="value != null">
      <TextureThumbnail :code="(value as string | number)" :size="28" />
      <span class="font-mono text-[11px]">{{ value }}</span>
    </template>
  </span>
</template>
