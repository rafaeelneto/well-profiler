<script setup lang="ts">
const props = defineProps<{
  value?: unknown;
  unitType: 'length' | 'diameter';
}>();

const { unit, toDisplay } = useUnitDisplay(props.unitType);

const display = computed(() => {
  const raw = props.value;
  if (raw === null || raw === undefined || raw === '') return null;
  const canonical = Number(raw);
  if (isNaN(canonical)) return null;
  return Number(toDisplay(canonical).toFixed(4));
});
</script>

<template>
  <span class="flex h-full w-full items-center justify-end">
    <template v-if="display !== null">{{ display }} {{ unit }}</template>
    <template v-else>—</template>
  </span>
</template>
