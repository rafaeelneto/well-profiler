<script setup lang="ts">
import type { WellGridColumn } from '~/components/WellDataGrid.vue';

const { t } = useI18n();
const profileStore = useProfileStore();

// ─── Bore hole columns ────────────────────────────────────────────────────────

const boreHoleColumns = computed<WellGridColumn[]>(() => [
  {
    prop: 'from',
    label: t('editor.construction.boreHole.from'),
    type: 'number',
    size: 130,
  },
  {
    prop: 'to',
    label: t('editor.construction.boreHole.to'),
    type: 'number',
    size: 130,
  },
  {
    prop: 'diameter',
    label: t('editor.construction.boreHole.diameter'),
    type: 'number',
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

// ─── Store mutations ──────────────────────────────────────────────────────────

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
  // Replace the entire array in one Immer update to keep history clean
  profileStore.updateWell(draft => {
    draft.bore_hole.splice(0, draft.bore_hole.length, ...items);
  });
}
</script>

<template>
  <div class="flex flex-col px-6">
    <WellDataGrid
      :rows="[...profileStore.well.bore_hole]"
      :columns="boreHoleColumns"
      @add="addBoreHole"
      @delete="deleteBoreHole"
      @change="updateBoreHole"
      @reorder="reorderBoreHole"
      :add-label="t('editor.construction.boreHole.addRow')"
    >
    </WellDataGrid>
  </div>
</template>
