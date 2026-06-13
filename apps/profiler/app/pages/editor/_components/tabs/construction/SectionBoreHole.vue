<script setup lang="ts">
import type { Well } from '@welldot/core';
import type { WellGridColumn } from '~/components/WellDataGrid.vue';

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
  profileStore.well.bore_hole.push({ from: 0, to: 0, diameter: 0 });
}

function deleteBoreHole(index: number) {
  profileStore.well.bore_hole.splice(index, 1);
}

function updateBoreHole(index: number, prop: string, value: unknown) {
  (profileStore.well.bore_hole[index] as Record<string, unknown>)[prop] = value;
}

function reorderBoreHole(from: number, to: number) {
  const items = [...profileStore.well.bore_hole];
  const [moved] = items.splice(from, 1);
  if (!moved) return;
  items.splice(to, 0, moved);
  profileStore.updateWell((draft: Well) => {
    draft.bore_hole.splice(0, draft.bore_hole.length, ...items);
  });
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
