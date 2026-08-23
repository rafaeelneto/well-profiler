<script setup lang="ts">
const props = defineProps<{
  value?: unknown;
  unitType: 'length' | 'diameter';
}>();

const { unit, toDisplay } = useUnitDisplay(props.unitType);
const { formatNumber } = useNumberFormat();

const display = computed((): string => {
  const raw = props.value;
  if (raw === null || raw === undefined || raw === '') return '—';
  const canonical = Number(raw);
  if (isNaN(canonical)) return '—';
  return formatNumber(toDisplay(canonical), {
    maximumFractionDigits: 4,
    suffix: unit.value,
  });
});
</script>

<template>
  <span class="flex h-full w-full items-center justify-end">{{ display }}</span>
</template>
