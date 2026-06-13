<script setup lang="ts">
import type { Well } from '@welldot/core';
import type { WellGridColumn } from '~/components/WellDataGrid.vue';

const { t } = useI18n();
const profileStore = useProfileStore();

const surfaceCaseColumns = computed<WellGridColumn[]>(() => [
  {
    prop: 'from',
    label: t('editor.construction.surfaceCase.from'),
    unitType: 'length',
    size: 100,
  },
  {
    prop: 'to',
    label: t('editor.construction.surfaceCase.to'),
    unitType: 'length',
    size: 100,
  },
  {
    prop: 'diameter',
    label: t('editor.construction.surfaceCase.diameter'),
    unitType: 'diameter',
    stretch: true,
  },
]);

function addSurfaceCase() {
  profileStore.well.surface_case.push({ from: 0, to: 0, diameter: 0 });
}

function deleteSurfaceCase(index: number) {
  profileStore.well.surface_case.splice(index, 1);
}

function updateSurfaceCase(index: number, prop: string, value: unknown) {
  (profileStore.well.surface_case[index] as Record<string, unknown>)[prop] =
    value;
}

function reorderSurfaceCase(from: number, to: number) {
  const items = [...profileStore.well.surface_case];
  const [moved] = items.splice(from, 1);
  if (!moved) return;
  items.splice(to, 0, moved);
  profileStore.updateWell((draft: Well) => {
    draft.surface_case.splice(0, draft.surface_case.length, ...items);
  });
}
</script>

<template>
  <!-- @[700px]:w-2/5 @[700px]:shrink-0: layout constraints from the parent side-by-side flex row in TabConstruction -->
  <section class="flex flex-col gap-5 @[700px]:w-2/5 @[700px]:shrink-0">
    <div class="flex items-baseline justify-between">
      <h3
        class="font-serif text-[22px] font-medium tracking-[-0.015em] text-content-0 m-0"
      >
        {{ t('editor.construction.surfaceCase.title') }}
      </h3>
      <span
        class="font-mono text-[10px] tracking-[0.08em] uppercase text-content-500"
      >
        {{ t('editor.construction.surfaceCase.tag') }}
      </span>
    </div>
    <WellDataGrid
      :rows="[...profileStore.well.surface_case]"
      :columns="surfaceCaseColumns"
      :add-label="t('editor.construction.surfaceCase.addRow')"
      @add="addSurfaceCase"
      @delete="deleteSurfaceCase"
      @change="updateSurfaceCase"
      @reorder="reorderSurfaceCase"
    />
  </section>
</template>
