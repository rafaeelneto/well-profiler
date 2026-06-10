<script setup lang="ts">
import ShareProfile from '~/components/ShareProfile.vue';
import SettingsModal from '~/components/SettingsModal.vue';

const props = defineProps<{ mobileView: 'perfil' | 'dados' }>();
const emit = defineEmits<{
  'update:mobileView': [value: 'perfil' | 'dados'];
}>();

const { t } = useI18n();
const store = useProfileStore();
const { download } = useProfileExport();

// ── Store-derived computeds ─────────────────────────────────────────
const hasWell = computed(() => !!store.well);
const wellName = computed(() => store.well?.name ?? '—');
const depthDisplay = computed(() =>
  store.maxDepth > 0 ? `${store.maxDepth} M` : '—',
);
const totalLayers = computed(
  () => store.totalGeologicLayers + store.totalConstructiveLayers,
);

// ── Open ────────────────────────────────────────────────────────────
const fileInputRef = ref<HTMLInputElement | null>(null);

function openFile() {
  fileInputRef.value?.click();
}

async function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  store.loadWell(await file.text());
  input.value = '';
}

// ── Save ────────────────────────────────────────────────────────────
function saveFile() {
  download();
}

// ── Share dialog ────────────────────────────────────────────────────
const shareVisible = ref(false);

// ── Settings dialog ─────────────────────────────────────────────────
const settingsVisible = ref(false);

// ── Pass-through ────────────────────────────────────────────────────
const actionBtnPt = {
  root: {
    class: [
      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium',
      'text-content-400 hover:text-content-0 hover:bg-surface-100',
      'transition-colors duration-150 cursor-pointer border-none bg-transparent',
      'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
    ],
  },
};

const viewOptions = computed(() => [
  {
    value: 'perfil',
    label: t('editor.viewProfile'),
    icon: 'ph:chart-bar-horizontal-duotone',
  },
  { value: 'dados', label: t('editor.viewData'), icon: 'ph:table-duotone' },
]);
</script>

<template>
  <!-- ─── Desktop nav (hidden on mobile) ───────────────────────────── -->
  <nav
    class="glass-nav hidden lg:flex sticky top-0 z-50 shrink-0 items-center gap-3 px-6 py-3"
  >
    <!-- Brand -->
    <NuxtLink
      to="/"
      class="flex items-center gap-2.5 font-bold text-base tracking-tight text-content-0 no-underline shrink-0"
    >
      <div
        class="w-6.5 h-6.5 rounded-full bg-linear-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-mono text-[10px] font-semibold"
      >
        wd
      </div>
      welldot
    </NuxtLink>

    <!-- Breadcrumb separator -->
    <span class="text-content-400 text-sm select-none">/</span>

    <!-- Well label + name + status -->
    <div class="flex flex-col min-w-0">
      <div class="flex items-baseline gap-2">
        <span class="kicker shrink-0">{{ t('editor.well') }}</span>
        <span
          class="font-semibold text-[15px] text-content-0 truncate leading-tight"
        >
          {{ wellName }}
        </span>
      </div>
      <div class="flex items-center gap-1.5 mt-0.5">
        <span class="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
        <span
          class="font-mono text-[10px] tracking-[0.12em] uppercase text-content-400"
        >
          <template v-if="hasWell">
            {{
              store.isDirty
                ? t('editor.status.unsaved')
                : t('editor.status.saved')
            }}
            · {{ depthDisplay }} · {{ totalLayers }}
            {{ t('editor.status.layers').toUpperCase() }}
          </template>
          <template v-else>—</template>
        </span>
      </div>
    </div>

    <div class="flex-1" />

    <!-- Action buttons -->
    <div class="flex items-center gap-0.5">
      <Button
        :label="t('editor.save')"
        :disabled="!hasWell"
        unstyled
        :pt="actionBtnPt"
        @click="saveFile"
      >
        <template #icon>
          <Icon name="ph:floppy-disk-duotone" class="size-4 shrink-0" />
        </template>
      </Button>
      <Button
        :label="t('editor.open')"
        unstyled
        :pt="actionBtnPt"
        @click="openFile"
      >
        <template #icon>
          <Icon name="ph:folder-open-duotone" class="size-4 shrink-0" />
        </template>
      </Button>
      <Button
        :label="t('editor.share')"
        :disabled="!hasWell"
        unstyled
        :pt="actionBtnPt"
        @click="shareVisible = true"
      >
        <template #icon>
          <Icon name="ph:share-network-duotone" class="size-4 shrink-0" />
        </template>
      </Button>
      <Button
        :label="t('editor.settings.title')"
        unstyled
        :pt="actionBtnPt"
        @click="settingsVisible = true"
      >
        <template #icon>
          <Icon name="ph:gear-six-duotone" class="size-4 shrink-0" />
        </template>
      </Button>
    </div>

    <!-- Divider -->
    <div class="w-px h-5 bg-surface-200/80 shrink-0" />

    <!-- Export PDF (primary CTA) -->
    <Button :label="t('editor.exportPdf')" :disabled="!hasWell" size="small">
      <template #icon>
        <Icon name="ph:file-pdf-duotone" class="size-4 shrink-0" />
      </template>
    </Button>
  </nav>

  <!-- ─── Mobile sticky header (hidden on desktop) ──────────────────── -->
  <div
    class="lg:hidden sticky top-0 z-40 bg-surface-0 border-b border-surface-200/60"
  >
    <!-- Row 1: top bar -->
    <div class="flex items-center gap-3 px-4 py-3">
      <NuxtLink
        to="/"
        class="size-8 rounded-full border border-surface-200 flex items-center justify-center text-content-400 hover:text-content-0 hover:border-surface-300 transition-colors shrink-0"
        :aria-label="t('editor.back')"
      >
        <Icon name="ph:arrow-left" class="size-4" />
      </NuxtLink>

      <div class="flex flex-col min-w-0 flex-1">
        <span class="kicker leading-none mb-0.5">{{ t('editor.well') }}</span>
        <span
          class="font-semibold text-[15px] text-content-0 truncate leading-tight"
        >
          {{ wellName }}
        </span>
      </div>

      <button
        class="size-8 rounded-full border border-surface-200 flex items-center justify-center text-content-400 hover:text-content-0 hover:border-surface-300 transition-colors shrink-0"
        :aria-label="t('editor.settings.title')"
        @click="settingsVisible = true"
      >
        <Icon name="ph:gear-six-duotone" class="size-4" />
      </button>
    </div>

    <!-- Row 2: status bar -->
    <div class="flex items-center gap-2 px-4 pb-2.5">
      <span class="size-1.5 rounded-full bg-primary-500 shrink-0" />
      <span
        class="font-mono text-[10px] tracking-[0.12em] uppercase text-content-400"
      >
        <template v-if="hasWell">
          {{
            store.isDirty
              ? t('editor.status.unsaved')
              : t('editor.status.saved')
          }}
          · {{ depthDisplay }} · {{ totalLayers }}
          {{ t('editor.status.layers').toUpperCase() }}
        </template>
        <template v-else>—</template>
      </span>
    </div>

    <!-- Row 3: Perfil / Dados view toggle -->
    <div class="flex items-center gap-2 px-4 pb-3">
      <SelectButton
        :model-value="props.mobileView"
        :options="viewOptions"
        option-value="value"
        :option-label="() => ''"
        data-key="value"
        :allow-empty="false"
        @update:model-value="emit('update:mobileView', $event)"
      >
        <template #option="{ option }">
          <Icon :name="option.icon" class="size-3.5 shrink-0" />
          {{ option.label }}
        </template>
      </SelectButton>
    </div>
  </div>

  <!-- ─── Share dialog ──────────────────────────────────────────────── -->
  <ShareProfile v-model="shareVisible" />

  <!-- ─── Settings dialog ───────────────────────────────────────────── -->
  <SettingsModal v-model="settingsVisible" />

  <!-- ─── Hidden file input ─────────────────────────────────────────── -->
  <ClientOnly>
    <input
      ref="fileInputRef"
      type="file"
      accept=".well,.json"
      class="sr-only"
      @change="onFileSelected"
    />
  </ClientOnly>
</template>
