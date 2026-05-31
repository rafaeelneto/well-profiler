<script setup lang="ts">
import InputText from 'primevue/inputtext';

const props = defineProps<{
  val?: unknown;
  save: (value: any, preventFocus?: boolean) => void;
  close: (focusNext?: boolean) => void;
}>();

const inputRef = ref<{ $el: HTMLInputElement } | null>(null);
const localValue = ref<string>('');

onMounted(() => nextTick(() => inputRef.value?.$el?.focus()));

function commit() {
  console.log(`commit ${localValue.value}`);
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

function update(value: string | undefined) {
  localValue.value = value || '';
}
</script>

<template>
  <p v-show="false" class="h-0 w-0">{{ localValue }}</p>
  <InputText
    ref="inputRef"
    :pt="{
      root: 'well-cell-input',
    }"
    :model-value="localValue"
    @update:model-value="update"
    @blur="commit"
    @keydown="onKeydown"
  />
</template>
