<script setup lang="ts">
import type { WellGridColumn } from '~/components/DataGrid/types';

const { t } = useI18n();
const profileStore = useProfileStore();

const boreHoleColumns = computed<WellGridColumn[]>(() => [
  {
    prop: 'from',
    label: t('editor.construction.boreHole.from'),
    unitType: 'length',
    size: 130,
  },
  {
    prop: 'to',
    label: t('editor.construction.boreHole.to'),
    unitType: 'length',
    size: 130,
  },
  {
    prop: 'diameter',
    label: t('editor.construction.boreHole.diameter'),
    unitType: 'diameter',
    size: 150,
  },
  {
    prop: 'drilling_method',
    label: t('editor.construction.boreHole.drillingMethod'),
    type: 'text',
    stretch: true,
    minSize: 200,
  },
]);

function addBoreHole() {
  profileStore.addWellFeature('bore_hole', { from: 0, to: 10, diameter: 0 });
}

function deleteBoreHole(index: number) {
  profileStore.well.bore_hole.splice(index, 1);
}

function updateBoreHole(index: number, prop: string, value: unknown) {
  profileStore.updateWellFeature('bore_hole', index, prop, value);
}

function reorderBoreHole(from: number, to: number) {
  profileStore.reorderWellFeature('bore_hole', from, to);
}
</script>

<template>
  <!-- flex-1 min-w-0: layout constraints from the parent side-by-side flex row in TabConstruction -->
  <section class="flex flex-col gap-5 flex-1 min-w-0">
    <div class="flex items-baseline justify-between">
      <h3
        class="font-serif text-[22px] font-medium tracking-[-0.015em] text-content-0 m-0"
      >
        {{ t('editor.construction.boreHole.title') }}
      </h3>
      <span
        class="font-mono text-[10px] tracking-[0.08em] uppercase text-content-500"
      >
        {{ t('editor.construction.boreHole.tag') }}
      </span>
    </div>
    <WellDataGrid
      :rows="[...profileStore.well.bore_hole]"
      :columns="boreHoleColumns"
      :add-label="t('editor.construction.boreHole.addRow')"
      @add="addBoreHole"
      @delete="deleteBoreHole"
      @change="updateBoreHole"
      @reorder="reorderBoreHole"
    />
  </section>
</template>
