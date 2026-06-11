<script setup lang="ts">
const props = defineProps<{
  rowIndex: number;
  requestDelete: (rowIndex: number) => void;
}>();

function handleClick(e: MouseEvent) {
  e.stopPropagation();
  props.requestDelete(props.rowIndex);
}
</script>

<template>
  <button class="well-grid-delete-btn" type="button" @click="handleClick" />
</template>
