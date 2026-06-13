<script setup lang="ts">
defineProps<{
  label?: string;
  orientation?: 'vertical' | 'horizontal';
}>();
</script>

<template>
  <div
    v-if="label"
    class="flex flex-col gap-1"
    :class="orientation === 'horizontal' ? 'sm:flex-row sm:items-center' : ''"
  >
    <label
      class="text-[10px] font-semibold tracking-widest uppercase text-content-400"
    >
      {{ label }}
    </label>
    <slot />
  </div>
</template>
