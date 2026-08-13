<script setup lang="ts">
// Preview pane is still a structural placeholder — no PDF generation exists
// yet in this app, only the options sidebar's state is real.
const visible = defineModel<boolean>({ default: false });

const { t } = useI18n();
const pdfExportStore = usePdfExportStore();

const kickerClass =
  'text-[10px] font-semibold tracking-widest uppercase text-content-400';

const metadataPositionOptions = computed(() => [
  { label: t('editor.exportPdfDialog.metadataSection.before'), value: 'before' },
  { label: t('editor.exportPdfDialog.metadataSection.after'), value: 'after' },
  { label: t('editor.exportPdfDialog.metadataSection.hide'), value: 'none' },
]);

const metadataPositionModel = computed({
  get: () => pdfExportStore.metadataPosition ?? 'none',
  set: (value: string) =>
    (pdfExportStore.metadataPosition =
      value === 'none' ? null : (value as 'before' | 'after')),
});

const headingInfoCount = computed(() =>
  t(
    'editor.exportPdfDialog.initialInfo.sections',
    pdfExportStore.headingInfo.length,
    { count: pdfExportStore.headingInfo.length },
  ),
);
const endInfoCount = computed(() =>
  t(
    'editor.exportPdfDialog.finalInfo.sections',
    pdfExportStore.endInfo.length,
    { count: pdfExportStore.endInfo.length },
  ),
);
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :show-header="false"
    :style="{
      width: '100vw',
      height: '100dvh',
      maxWidth: '100vw',
      maxHeight: '100dvh',
      margin: 0,
      borderRadius: 0,
    }"
    :pt="{ content: { class: 'p-0! h-full overflow-hidden' } }"
  >
    <div class="flex flex-col lg:flex-row h-full overflow-hidden bg-surface-0">
      <!-- ─── Options panel ──────────────────────────────────────────── -->
      <aside
        class="flex flex-col w-full lg:w-96 shrink-0 h-full overflow-y-auto lg:border-r border-surface-200"
      >
        <!-- Panel header -->
        <div class="flex items-center justify-between gap-3 px-6 pt-6 pb-5">
          <h2
            class="font-serif text-2xl font-semibold text-content-0 tracking-tight"
          >
            {{ t('editor.exportPdfDialog.title') }}
          </h2>
          <button
            type="button"
            class="size-8 rounded-full flex items-center justify-center shrink-0 border-none bg-transparent text-content-400 hover:text-content-0 hover:bg-surface-100 transition-colors cursor-pointer"
            :aria-label="t('editor.exportPdfDialog.close')"
            @click="visible = false"
          >
            <Icon name="ph:x-bold" class="size-4" />
          </button>
        </div>

        <!-- Primary actions -->
        <div class="flex items-center gap-2 px-6 pb-6">
          <Button :label="t('editor.exportPdfDialog.download')" class="flex-1">
            <template #icon>
              <Icon name="ph:download-simple-bold" class="size-4 shrink-0" />
            </template>
          </Button>
          <Button
            :label="t('editor.exportPdfDialog.print')"
            severity="secondary"
            outlined
          >
            <template #icon>
              <Icon name="ph:printer-duotone" class="size-4 shrink-0" />
            </template>
          </Button>
        </div>

        <div class="flex flex-col gap-6 px-6 pb-10">
          <!-- Header -->
          <section class="flex flex-col gap-3">
            <span :class="kickerClass">{{
              t('editor.exportPdfDialog.header')
            }}</span>
            <InputText v-model="pdfExportStore.header" class="w-full" />
          </section>

          <!-- Page breaks -->
          <section class="flex flex-col gap-3">
            <span :class="kickerClass">{{
              t('editor.exportPdfDialog.pageBreaks.title')
            }}</span>
            <label
              class="flex items-center gap-2.5 text-sm text-content-0 cursor-pointer"
            >
              <Checkbox v-model="pdfExportStore.breakPages" binary />
              {{ t('editor.exportPdfDialog.pageBreaks.split') }}
            </label>
          </section>

          <!-- Metadata section placement -->
          <section class="flex flex-col gap-3">
            <span :class="kickerClass">{{
              t('editor.exportPdfDialog.metadataSection.title')
            }}</span>
            <SelectButton
              v-model="metadataPositionModel"
              :options="metadataPositionOptions"
              option-label="label"
              option-value="value"
              :allow-empty="false"
              class="w-full *:flex-1"
            />
          </section>

          <!-- Scale -->
          <section class="flex flex-col gap-3">
            <span :class="kickerClass">{{
              t('editor.exportPdfDialog.scale.title')
            }}</span>
            <div class="flex items-center gap-3">
              <Slider
                v-model="pdfExportStore.scale"
                :min="1"
                :max="850"
                class="flex-1"
              />
              <div class="flex items-center gap-1 shrink-0">
                <span class="font-mono text-xs text-content-400">1 :</span>
                <InputNumber
                  v-model="pdfExportStore.scale"
                  :min="1"
                  :max="850"
                  :use-grouping="false"
                  class="w-20"
                  input-class="font-mono text-xs"
                />
              </div>
            </div>
          </section>

          <!-- Initial information -->
          <section class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span :class="kickerClass">{{
                t('editor.exportPdfDialog.initialInfo.title')
              }}</span>
              <span class="text-[10px] font-medium text-content-400">{{
                headingInfoCount
              }}</span>
            </div>
            <PdfInfoItemsList
              v-model:items="pdfExportStore.headingInfo"
              :empty-message="t('editor.exportPdfDialog.initialInfo.empty')"
              :add-label="t('editor.exportPdfDialog.initialInfo.add')"
              :metadata-button-label="
                t('editor.exportPdfDialog.initialInfo.metadataButton')
              "
              :label-placeholder="t('editor.exportPdfDialog.labelPlaceholder')"
              :value-placeholder="t('editor.exportPdfDialog.valuePlaceholder')"
              :synced-tooltip="t('editor.exportPdfDialog.syncedTooltip')"
              :delete-label="t('editor.exportPdfDialog.deleteItem')"
            />
          </section>

          <!-- Final information -->
          <section class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span :class="kickerClass">{{
                t('editor.exportPdfDialog.finalInfo.title')
              }}</span>
              <span class="text-[10px] font-medium text-content-400">{{
                endInfoCount
              }}</span>
            </div>
            <PdfInfoItemsList
              v-model:items="pdfExportStore.endInfo"
              :empty-message="t('editor.exportPdfDialog.finalInfo.empty')"
              :add-label="t('editor.exportPdfDialog.finalInfo.add')"
              :metadata-button-label="
                t('editor.exportPdfDialog.finalInfo.metadataButton')
              "
              :label-placeholder="t('editor.exportPdfDialog.labelPlaceholder')"
              :value-placeholder="t('editor.exportPdfDialog.valuePlaceholder')"
              :synced-tooltip="t('editor.exportPdfDialog.syncedTooltip')"
              :delete-label="t('editor.exportPdfDialog.deleteItem')"
            />
          </section>
        </div>
      </aside>

      <!-- ─── Preview pane (desktop only) ────────────────────────────── -->
      <div class="hidden lg:flex flex-1 flex-col overflow-hidden bg-surface-50">
        <!-- Toolbar -->
        <div
          class="flex items-center justify-between gap-3 px-6 py-3 border-b border-surface-200 shrink-0"
        >
          <span
            class="font-mono text-[10px] tracking-widest uppercase text-content-400"
          >
            {{ t('editor.exportPdfDialog.preview.label') }} · A4 · 3
            {{ t('editor.exportPdfDialog.preview.pages') }}
          </span>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-1">
              <span
                v-for="page in [1, 2, 3]"
                :key="page"
                class="size-6 rounded-md flex items-center justify-center text-[11px] font-semibold"
                :class="
                  page === 1
                    ? 'bg-content-0 text-surface-0'
                    : 'bg-surface-0 text-content-400 border border-surface-200'
                "
              >
                {{ page }}
              </span>
            </div>
            <span class="font-mono text-[11px] text-content-400">100%</span>
            <button
              type="button"
              class="px-2.5 py-1 rounded-full bg-surface-0 border border-surface-200 text-[10px] font-semibold uppercase tracking-wider text-content-400 hover:text-content-0 transition-colors cursor-pointer"
            >
              {{ t('editor.exportPdfDialog.preview.fit') }}
            </button>
          </div>
        </div>

        <!-- Canvas -->
        <div class="flex-1 overflow-auto flex items-center justify-center p-10">
          <div
            class="bg-surface-0 rounded-md border border-surface-200 shadow-lg w-full max-w-md flex flex-col gap-4 p-6"
            style="aspect-ratio: 210 / 297"
          >
            <div class="flex items-center justify-between">
              <div class="h-3 w-20 rounded-full bg-surface-200" />
              <div class="h-3 w-14 rounded-full bg-surface-100" />
            </div>
            <div class="h-6 w-2/3 rounded-full bg-surface-200" />
            <div class="grid grid-cols-2 gap-3">
              <div class="h-10 rounded-lg bg-surface-100" />
              <div class="h-10 rounded-lg bg-surface-100" />
              <div class="h-10 rounded-lg bg-surface-100" />
              <div class="h-10 rounded-lg bg-surface-100" />
            </div>
            <div class="flex-1 rounded-lg bg-surface-100" />
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</template>
