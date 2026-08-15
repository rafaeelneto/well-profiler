<script setup lang="ts">
const props = defineProps<{
  value?: unknown;
}>();

const typedValue = computed(() => props.value as string | number | undefined);
</script>

<template>
  <span class="flex h-full w-full items-center gap-1.5">
    <TextureThumbnail :code="typedValue" :size="28" />
    <span class="font-mono text-[11px]">{{ typedValue }}</span>
  </span>
</template>
