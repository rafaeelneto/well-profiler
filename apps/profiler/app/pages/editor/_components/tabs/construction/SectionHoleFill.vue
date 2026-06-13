<script setup lang="ts">
import type { Well } from '@welldot/core';
import type { WellGridColumn } from '~/components/WellDataGrid.vue';

const { t } = useI18n();
const profileStore = useProfileStore();

const holeFillTypeOptions = computed(() => [
  {
    label: t('editor.construction.holeFill.typeOptions.gravelPack'),
    value: 'gravel_pack',
  },
  { label: t('editor.construction.holeFill.typeOptions.seal'), value: 'seal' },
]);

const holeFillColumns = computed<WellGridColumn[]>(() => [
  {
    prop: 'from',
    label: t('editor.construction.holeFill.from'),
    unitType: 'length',
    size: 130,
  },
  {
    prop: 'to',
    label: t('editor.construction.holeFill.to'),
    unitType: 'length',
    size: 130,
  },
  {
    prop: 'diameter',
    label: t('editor.construction.holeFill.diameter'),
    unitType: 'diameter',
    size: 150,
  },
  {
    prop: 'type',
    label: t('editor.construction.holeFill.type'),
    type: 'select',
    size: 150,
    options: holeFillTypeOptions.value,
  },
  {
    prop: 'description',
    label: t('editor.construction.holeFill.description'),
    type: 'text',
    stretch: true,
    minSize: 200,
  },
]);

function addHoleFill() {
  profileStore.well.hole_fill.push({
    from: 0,
    to: 0,
    diameter: 0,
    type: 'gravel_pack',
    description: '',
  });
}

function deleteHoleFill(index: number) {
  profileStore.well.hole_fill.splice(index, 1);
}

function updateHoleFill(index: number, prop: string, value: unknown) {
  (profileStore.well.hole_fill[index] as Record<string, unknown>)[prop] = value;
}

function reorderHoleFill(from: number, to: number) {
  const items = [...profileStore.well.hole_fill];
  const [moved] = items.splice(from, 1);
  if (!moved) return;
  items.splice(to, 0, moved);
  profileStore.updateWell((draft: Well) => {
    draft.hole_fill.splice(0, draft.hole_fill.length, ...items);
  });
}
</script>

<template>
  <section class="flex flex-col gap-5">
    <div class="flex items-baseline justify-between">
      <h3
        class="font-serif text-[22px] font-medium tracking-[-0.015em] text-content-0 m-0"
      >
        {{ t('editor.construction.holeFill.title') }}
      </h3>
      <span
        class="font-mono text-[10px] tracking-[0.08em] uppercase text-content-500"
      >
        {{ t('editor.construction.holeFill.tag') }}
      </span>
    </div>
    <WellDataGrid
      :rows="[...profileStore.well.hole_fill]"
      :columns="holeFillColumns"
      :add-label="t('editor.construction.holeFill.addRow')"
      @add="addHoleFill"
      @delete="deleteHoleFill"
      @change="updateHoleFill"
      @reorder="reorderHoleFill"
    />
  </section>
</template>
