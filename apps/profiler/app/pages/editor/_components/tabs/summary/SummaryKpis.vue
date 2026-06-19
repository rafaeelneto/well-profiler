<script setup lang="ts">
const { t } = useI18n();
const profileStore = useProfileStore();
const { unit: lengthUnit, toDisplay } = useUnitDisplay('length');
const { formatNumber } = useNumberFormat();

const screenLength = computed(() =>
  profileStore.well.well_screen.reduce((sum, s) => sum + (s.to - s.from), 0),
);

const kpis = computed(() => [
  {
    key: 'depth',
    label: t('editor.summary.kpis.depth'),
    value: formatNumber(toDisplay(profileStore.maxDepth), { fractionDigits: 2 }),
    unit: lengthUnit.value,
  },
  {
    key: 'layers',
    label: t('editor.summary.kpis.layers'),
    value: String(profileStore.lithologyCount),
    unit: '',
  },
  {
    key: 'screen',
    label: t('editor.summary.kpis.screen'),
    value: formatNumber(toDisplay(screenLength.value), { fractionDigits: 2 }),
    unit: lengthUnit.value,
  },
]);
</script>

<template>
  <div class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-2.5">
    <div
      v-for="kpi in kpis"
      :key="kpi.key"
      class="rounded-[10px] border border-surface-200 bg-gradient-to-b from-surface-0/85 to-surface-50/55 p-3 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset] dark:shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]"
    >
      <div class="mb-1 font-mono text-[9.5px] tracking-[0.08em] uppercase text-content-400">
        {{ kpi.label }}
      </div>
      <div class="font-serif text-[22px] font-medium tracking-[-0.01em] text-content-0">
        {{ kpi.value }}
        <small v-if="kpi.unit" class="ml-0.5 font-mono text-[11px] font-normal text-content-400">
          {{ kpi.unit }}
        </small>
      </div>
    </div>
  </div>
</template>
