<script setup lang="ts">
import Select from 'primevue/select';
import { FGDC_TEXTURES_OPTIONS, type TextureOption } from '@welldot/core';
import { useGridOverlayFocusGuard } from '../composables/useGridOverlayFocusGuard';

const props = defineProps<{
  val?: unknown;
  save: (value: any, preventFocus?: boolean) => void;
  close: (focusNext?: boolean) => void;
}>();

const selectRef = ref<InstanceType<typeof Select> | null>(null);
const showPending = ref(false);

const filteredOptions = computed(() =>
  showPending.value
    ? FGDC_TEXTURES_OPTIONS
    : FGDC_TEXTURES_OPTIONS.filter((option) => !option.pending),
);

const overlayFocusGuard = useGridOverlayFocusGuard();

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
    :model-value="val ?? null"
    :options="filteredOptions"
    option-label="label"
    option-value="code"
    :filter="true"
    :filter-fields="['label', 'code']"
    append-to="body"
    :pt="{
      root: 'well-cell-select well-cell-texture-select',
      label: 'flex items-center',
      option: 'p-1',
      overlay: () => ({ class: 'min-w-[340px]', ...overlayFocusGuard }),
    }"
    @update:model-value="onSelect"
    @keydown="onKeydown"
  >
    <template #option="{ option }: { option: TextureOption }">
      <div class="flex items-center gap-2.5 py-0.5">
        <TextureThumbnail :code="option.code" :size="48" />
        <div class="flex flex-col min-w-0">
          <span class="font-mono text-[13px] font-semibold leading-tight">{{
            option.code
          }}</span>
          <span class="text-[11px] opacity-65 truncate max-w-60">{{
            option.label
          }}</span>
        </div>
      </div>
    </template>
    <template #value="{ value: selectedCode, placeholder }">
      <div v-if="selectedCode != null" class="flex items-center gap-1.5">
        <TextureThumbnail :code="selectedCode as string | number" :size="28" />
        <span class="font-mono text-[11px]">{{ selectedCode }}</span>
      </div>
      <span v-else class="text-content-400 text-[11px]">{{ placeholder }}</span>
    </template>
    <template #footer>
      <div class="flex items-center gap-1 px-2 py-1">
        <Checkbox
          v-model="showPending"
          binary
          size="small"
          input-id="show-pending-textures"
        />
        <label
          for="show-pending-textures"
          class="text-[10px] text-content-400 cursor-pointer select-none"
        >
          Show pending textures
        </label>
      </div>
    </template>
  </Select>
</template>
