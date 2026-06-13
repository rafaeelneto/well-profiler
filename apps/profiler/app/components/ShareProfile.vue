<script setup lang="ts">
const visible = defineModel<boolean>({ default: false });

const { t } = useI18n();
const { download, getRawJson } = useProfileExport();

async function copyJson() {
  const json = getRawJson();
  if (json) await copyToClipboard(json);
  visible.value = false;
}

function downloadWell() {
  download();
  visible.value = false;
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="t('editor.shareDialog.title')"
    :style="{ width: '24rem' }"
  >
    <div class="flex flex-col gap-2 pt-1">
      <!-- Copy JSON -->
      <button
        class="flex items-center gap-4 p-3 rounded-lg border border-surface-200 hover:border-primary-300 hover:bg-surface-50 transition-colors text-left w-full cursor-pointer"
        @click="copyJson"
      >
        <Icon
          name="ph:clipboard-text-duotone"
          class="size-6 text-primary-500 shrink-0"
        />
        <div class="flex-1 min-w-0">
          <div class="font-medium text-sm text-content-0">
            {{ t('editor.shareDialog.copyJson') }}
          </div>
          <div class="text-xs text-content-400 mt-0.5">
            {{ t('editor.shareDialog.copyJsonDesc') }}
          </div>
        </div>
      </button>

      <!-- Download .well -->
      <button
        class="flex items-center gap-4 p-3 rounded-lg border border-surface-200 hover:border-primary-300 hover:bg-surface-50 transition-colors text-left w-full cursor-pointer"
        @click="downloadWell"
      >
        <Icon
          name="ph:download-simple-duotone"
          class="size-6 text-primary-500 shrink-0"
        />
        <div class="flex-1 min-w-0">
          <div class="font-medium text-sm text-content-0">
            {{ t('editor.shareDialog.downloadWell') }}
          </div>
          <div class="text-xs text-content-400 mt-0.5">
            {{ t('editor.shareDialog.downloadWellDesc') }}
          </div>
        </div>
      </button>

      <!-- Copy as link (coming soon) -->
      <div
        class="flex items-center gap-4 p-3 rounded-lg border border-surface-200 opacity-50 cursor-not-allowed"
      >
        <Icon name="ph:link-duotone" class="size-6 text-content-400 shrink-0" />
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="font-medium text-sm text-content-0">
              {{ t('editor.shareDialog.copyLink') }}
            </span>
            <span
              class="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-100 text-content-400 tracking-wider uppercase"
            >
              {{ t('editor.shareDialog.comingSoon') }}
            </span>
          </div>
          <div class="text-xs text-content-400 mt-0.5">
            {{ t('editor.shareDialog.copyLinkDesc') }}
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</template>
