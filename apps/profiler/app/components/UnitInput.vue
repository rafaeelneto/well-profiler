<script setup lang="ts">
import {
  metersToFeet,
  feetToMeters,
  mmToInches,
  inchesToMm,
} from '@welldot/core';

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  modelValue?: number | null;
  unitType: 'length' | 'diameter';
  min?: number;
  max?: number;
  step?: number;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: number | null];
}>();

const attrs = useAttrs();
const uiStore = useUiStore();

function toDisplay(v: number): number {
  if (props.unitType === 'length')
    return uiStore.lengthUnit === 'ft' ? metersToFeet(v) : v;
  return uiStore.diameterUnit === 'inches' ? mmToInches(v) : v;
}

function toCanonical(v: number): number {
  if (props.unitType === 'length')
    return uiStore.lengthUnit === 'ft' ? feetToMeters(v) : v;
  return uiStore.diameterUnit === 'inches' ? inchesToMm(v) : v;
}

const displayValue = computed(() =>
  props.modelValue != null ? toDisplay(props.modelValue) : null,
);
const displayMin = computed(() =>
  props.min != null ? toDisplay(props.min) : undefined,
);
const displayMax = computed(() =>
  props.max != null ? toDisplay(props.max) : undefined,
);
const displayStep = computed(() =>
  props.step != null ? toDisplay(props.step) : undefined,
);
</script>

<template>
  <WellInputNumber
    v-bind="attrs"
    :model-value="displayValue"
    :min="displayMin"
    :max="displayMax"
    :step="displayStep"
    :max-fraction-digits="(attrs['maxFractionDigits'] as number) ?? 4"
    @update:model-value="
      v => emit('update:modelValue', v != null ? toCanonical(v) : null)
    "
  />
</template>
