<script setup lang="ts">
const props = defineProps<{
  value?: unknown;
  model: Record<string, unknown>;
  formatter: (value: unknown, row: Record<string, unknown>) => string;
}>();

const text = computed(() => props.formatter(props.value, props.model));
</script>

<template>
  <span class="flex h-full w-full items-center">{{ text }}</span>
</template>
