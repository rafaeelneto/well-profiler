<script setup lang="ts">
const props = defineProps<{
  value?: unknown;
  options: Array<{ label: string; value: string }>;
}>();

const label = computed(() => {
  const match = props.options.find(o => o.value === props.value);
  return match?.label ?? String(props.value ?? '');
});
</script>

<template>
  <span class="flex h-full w-full items-center">{{ label }}</span>
</template>
