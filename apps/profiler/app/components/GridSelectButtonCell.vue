<script setup lang="ts">
const props = defineProps<{
  value?: unknown;
  rowIndex: number;
  prop: string;
  options: Array<{ label: string; value: string }>;
  onChange: (rowIndex: number, prop: string, value: unknown) => void;
}>();

function handleChange(newValue: string) {
  props.onChange(props.rowIndex, props.prop, newValue);
}
</script>

<template>
  <span
    class="flex h-full w-full items-center justify-center px-0"
    @click.stop
    @mousedown.stop
  >
    <SelectButton
      :model-value="value"
      :options="options"
      option-label="label"
      option-value="value"
      :allow-empty="false"
      size="small"
      @update:model-value="handleChange"
      :pt="{
        pcToggleButton: {
          root: 'font-mono text-[10px] h-5 p-0 focus-visible:ring-offset-1',
          content: 'px-1 py-0 rounded-full',
        },
      }"
    />
  </span>
</template>
