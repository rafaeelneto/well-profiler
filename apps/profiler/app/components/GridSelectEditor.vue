<script setup lang="ts">
import Select from 'primevue/select';

const props = defineProps<{
  val?: unknown;
  save: (value: any, preventFocus?: boolean) => void;
  close: (focusNext?: boolean) => void;
  options: Array<{ label: string; value: string }>;
}>();

const selectRef = ref<InstanceType<typeof Select> | null>(null);

onMounted(() => nextTick(() => selectRef.value?.show()));

function onSelect(value: unknown) {
  props.save(value);
  props.close();
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.stopPropagation();
    props.close();
  }
}
</script>

<template>
  <Select
    ref="selectRef"
    :model-value="val"
    :options="options"
    option-label="label"
    option-value="value"
    append-to="body"
    :pt="{
      root: 'well-cell-select',
      label: 'flex items-center',
      option: 'text-sm p-1',
    }"
    @update:model-value="onSelect"
    @keydown="onKeydown"
  />
</template>
