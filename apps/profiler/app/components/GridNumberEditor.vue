<script setup lang="ts">
const props = defineProps<{
  val?: unknown;
  save: (value: any, preventFocus?: boolean) => void;
  close: (focusNext?: boolean) => void;
}>();

const numRef = ref<{ $el: HTMLElement } | null>(null);
const localValue = ref<number | null>(
  props.val !== undefined && props.val !== null && props.val !== ''
    ? Number(props.val)
    : null,
);

onMounted(() =>
  nextTick(() => {
    const el = numRef.value?.$el;
    (el?.querySelector('input') as HTMLInputElement | null)?.focus();
  }),
);

function commit() {
  props.save(localValue.value);
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.stopPropagation();
    commit();
  } else if (e.key === 'Escape') {
    e.stopPropagation();
    props.close();
  }
}

function update(value: number) {
  localValue.value = value;
  commit();
}
</script>

<template>
  <WellInputNumber
    ref="numRef"
    :model-value="localValue"
    @update:model-value="update"
    :max-fraction-digits="4"
    :pt="{
      root: 'well-cell-input-number',
      pcInput: { root: 'well-cell-input well-cell-input-number text-right' },
    }"
    @keydown="onKeydown"
  />
</template>
