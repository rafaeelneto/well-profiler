<script setup lang="ts">
const { t } = useI18n();
const profileStore = useProfileStore();

const constructionDate = computed({
  get: () =>
    profileStore.well.construction_date
      ? new Date(profileStore.well.construction_date)
      : null,
  set: value =>
    (profileStore.well.construction_date = value
      ? value.toISOString().split('T')[0]
      : undefined),
});

const location = computed(() => ({
  lat: profileStore.well.location?.lat ?? 0,
  lng: profileStore.well.location?.lng ?? 0,
  elevation: profileStore.well.location?.elevation ?? 0,
  ...profileStore.well.location,
}));

async function updateLocationField<K extends 'lat' | 'lng' | 'elevation'>(
  key: K,
  newValue: number,
) {
  if (!profileStore.well.location) {
    profileStore.well.location = { lat: 0, lng: 0, elevation: 0 };
  }
  profileStore.well.location[key] = newValue;
}

// ─── Well type Select ─────────────────────────────────────────────────────────

const wellTypeOptions = computed(() => [
  { label: t('editor.general.wellTypes.deepTubular'), value: 'tubular_deep' },
  {
    label: t('editor.general.wellTypes.shallowTubular'),
    value: 'tubular_shallow',
  },
  { label: t('editor.general.wellTypes.artesian'), value: 'artesian' },
  { label: t('editor.general.wellTypes.handDug'), value: 'hand_dug' },
]);

onMounted(() => {
  // Ensure location is initialized for the LocationPicker
  setTimeout(() => {
    updateLocationField('lat', 12.212);
  }, 6000);
});
</script>

<template>
  <div class="flex flex-col gap-8 p-6 lg:p-8">
    <!-- ── Section: General Information ──────────────────────────────────── -->
    <section class="flex flex-col gap-5">
      <div
        class="flex items-baseline justify-between border-b border-surface-200/70 dark:border-surface-700/60 pb-3"
      >
        <h2 class="text-2xl font-semibold tracking-tight">
          {{ t('editor.general.generalInfo') }}
        </h2>
        <span
          class="text-[10px] font-semibold tracking-widest uppercase text-content-400"
        >
          {{ t('editor.general.metadata') }} · {{ t('editor.well') }}
        </span>
      </div>

      <!-- Name -->
      <Field :label="t('editor.general.name')">
        <InputText v-model="profileStore.well.name" class="w-full" />
      </Field>

      <!-- Driller + Construction Date -->
      <div class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
        <Field :label="t('editor.general.driller')">
          <InputText v-model="profileStore.well.well_driller" class="w-full" />
        </Field>
        <Field :label="t('editor.general.constructionDate')">
          <DatePicker
            v-model="constructionDate"
            show-button-bar
            date-format="dd/mm/yy"
            class="w-full"
            :pt="{ pcInput: { root: 'font-mono text-sm w-full' } }"
          />
        </Field>
      </div>

      <!-- Well Type (half-width) -->
      <div class="grid grid-cols-2 gap-4">
        <Field :label="t('editor.general.wellType')">
          <Select
            v-model="profileStore.well.well_type"
            :options="wellTypeOptions"
            option-label="label"
            option-value="value"
            :placeholder="t('editor.general.wellType')"
            class="w-full"
            :pt="{ label: { class: 'font-mono text-sm' } }"
          />
        </Field>
      </div>
    </section>

    <!-- ── Section: Location ──────────────────────────────────────────────── -->
    <section class="flex flex-col gap-5">
      <div
        class="flex items-baseline justify-between border-b border-surface-200/70 dark:border-surface-700/60 pb-3"
      >
        <h2 class="text-2xl font-semibold tracking-tight">
          {{ t('editor.general.location') }}
        </h2>
        <span
          class="text-[10px] font-semibold tracking-widest uppercase text-content-400"
        >
          {{ t('editor.general.coordinates') }}
        </span>
      </div>

      <LocationPicker
        :lat="location.lat"
        :lng="location.lng"
        :elevation="location.elevation"
        @update:lat="value => updateLocationField('lat', value)"
        @update:lng="value => updateLocationField('lng', value)"
        @update:elevation="value => updateLocationField('elevation', value)"
      />
    </section>

    <!-- ── Section: Observations ──────────────────────────────────────────── -->
    <section class="flex flex-col gap-5">
      <div
        class="flex items-baseline justify-between border-b border-surface-200/70 dark:border-surface-700/60 pb-3"
      >
        <h2 class="text-2xl font-semibold tracking-tight">
          {{ t('editor.general.observations') }}
        </h2>
        <span
          class="text-[10px] font-semibold tracking-widest uppercase text-content-400"
        >
          {{ t('editor.general.freeNotes') }}
        </span>
      </div>

      <Field :label="t('editor.general.observationsLabel')">
        <Textarea
          v-model="profileStore.well.obs"
          class="w-full font-mono text-sm"
          :rows="5"
        />
      </Field>
    </section>
  </div>
</template>
