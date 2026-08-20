<script setup lang="ts">
import Select from 'primevue/select';
import { useGridOverlayFocusGuard } from '../composables/useGridOverlayFocusGuard';

const MAX_LENGTH = 90;

const props = defineProps<{
  val?: unknown;
  save: (value: any, preventFocus?: boolean) => void;
  close: (focusNext?: boolean) => void;
  options: Array<{ label: string; value: string }>;
}>();

const selectRef = ref<InstanceType<typeof Select> | null>(null);
const overlayFocusGuard = useGridOverlayFocusGuard();

// With `option-value="value"`, the Select's model is always the raw string —
// one of the suggested canonical values, or whatever free text was typed.
const localValue = ref(typeof props.val === 'string' ? props.val : '');

onMounted(() => nextTick(() => selectRef.value?.show()));

// The panel closes on option pick, Enter, Escape, and outside click alike —
// `hide` is the one event that covers all of them, so it's the single point
// where we commit and hand control back to the grid.
function onHide() {
  props.save(localValue.value, true);
  props.close();
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === 'Escape') {
    e.stopPropagation();
  }
}
</script>

<template>
  <Select
    ref="selectRef"
    v-model="localValue"
    :options="options"
    option-label="label"
    option-value="value"
    editable
    append-to="body"
    :pt="{
      root: 'well-cell-select',
      label: { maxlength: MAX_LENGTH },
      option: 'text-sm p-1',
      overlay: () => overlayFocusGuard,
    }"
    @hide="onHide"
    @keydown="onKeydown"
  />
</template>
