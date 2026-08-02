<script setup lang="ts">
const props = defineProps<{
  rowIndex: number;
  model: Record<string, unknown>;
  requestDelete: (rowIndex: number, model: Record<string, unknown>) => void;
}>();

function handleClick(e: MouseEvent) {
  e.stopPropagation();
  props.requestDelete(props.rowIndex, props.model);
}
</script>

<template>
  <button class="well-grid-delete-btn" type="button" @click="handleClick" />
</template>
