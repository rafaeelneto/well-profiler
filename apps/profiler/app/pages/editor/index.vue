<script setup lang="ts">
import Header from './_components/Header.vue';
import TabGeneral from './_components/tabs/TabGeneral.vue';
import TabConstruction from './_components/tabs/TabConstruction.vue';
import TabGeological from './_components/tabs/TabGeological.vue';
import TabSummary from './_components/tabs/TabSummary.vue';
import TabHistorico from './_components/tabs/TabHistorico.vue';

definePageMeta({ layout: 'editor' });

const { t } = useI18n();
const viewport = useViewport();

const isMobile = computed(() => viewport.isLessThan('lg'));
const mobileView = ref<'perfil' | 'dados'>('dados');
const activeTabKey = ref<string>('0');

const tabs = computed(() => [
  {
    value: '0',
    label: t('editor.tabs.general'),
    shortLabel: t('editor.tabs.general'),
  },
  {
    value: '1',
    label: t('editor.tabs.construction'),
    shortLabel: t('editor.tabs.constructionShort'),
  },
  {
    value: '2',
    label: t('editor.tabs.geological'),
    shortLabel: t('editor.tabs.geological'),
  },
  {
    value: '3',
    label: t('editor.tabs.summary'),
    shortLabel: t('editor.tabs.summary'),
  },
  {
    value: '4',
    label: t('editor.tabs.historico'),
    shortLabel: t('editor.tabs.historico'),
  },
  {
    value: '5',
    label: t('editor.tabs.hidrodinamica'),
    shortLabel: t('editor.tabs.hidro'),
    disabled: true,
    comingSoon: true,
  },
]);
</script>

<template>
  <Header v-model:mobile-view="mobileView" />

  <!-- ─── Content row: flex-row container for all panes ────────────── -->
  <div class="flex flex-1 min-h-0 overflow-hidden">
    <!-- Profiler pane: sidebar on desktop, full-pane on mobile (perfil view) -->
    <div
      :class="[
        'flex-col overflow-hidden',
        isMobile && mobileView !== 'perfil' ? 'hidden' : 'flex',
        'flex-1 lg:flex-none lg:w-120 lg:shrink-0',
        'lg:border-r lg:border-surface-200/60',
      ]"
    >
      <div
        :class="[
          'flex-1 relative flex flex-col overflow-hidden',
          isMobile ? 'glass rounded-xl mx-4 my-4' : 'bg-surface-50',
        ]"
      >
        <!-- Floating zoom controls -->
        <div
          class="absolute top-3 lg:top-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-0.5 px-1.5 py-1.5 rounded-full border border-white/10 shadow-xl"
          style="
            background: linear-gradient(
              180deg,
              rgba(40, 52, 70, 0.82),
              rgba(28, 38, 54, 0.72)
            );
            backdrop-filter: saturate(150%) blur(12px);
          "
        >
          <Button
            unstyled
            :aria-label="t('editor.zoom.in')"
            :pt="{
              root: 'size-7 rounded-full flex items-center justify-center text-content-800 dark:text-content-200 hover:text-content-0 transition-colors cursor-pointer',
            }"
          >
            <template #icon>
              <Icon name="ph:plus" class="size-3.5" />
            </template>
          </Button>
          <Button
            unstyled
            :aria-label="t('editor.zoom.out')"
            :pt="{
              root: 'size-7 rounded-full flex items-center justify-center text-content-800 dark:text-content-200 hover:text-content-0 transition-colors cursor-pointer',
            }"
          >
            <template #icon>
              <Icon name="ph:minus" class="size-3.5" />
            </template>
          </Button>
          <Button
            :label="t('editor.zoom.fit')"
            unstyled
            :pt="{
              root: 'px-3 py-1 rounded-full bg-surface-50 text-content-200 text-[12px] font-semibold ml-0.5 transition-colors hover:bg-surface-50 cursor-pointer',
            }"
          />
          <span
            class="font-mono text-[11px] text-content-800 dark:text-content-200 px-2.5"
            >1 : 850</span
          >
        </div>
        <div class="flex-1 flex items-center justify-center">
          <span class="font-mono text-xs text-content-400">SVG Profiler</span>
        </div>
      </div>
    </div>

    <!-- Tabs: desktop right pane + mobile dados content -->
    <div
      :class="[
        'flex-1 flex-col overflow-hidden',
        isMobile && mobileView === 'perfil' ? 'hidden' : 'flex',
      ]"
    >
      <Tabs v-model:value="activeTabKey">
        <TabList>
          <Tab
            v-for="tab in tabs"
            :key="tab.value"
            :value="tab.value"
            :disabled="tab.disabled ?? false"
          >
            <span class="flex items-center gap-1.5">
              {{ isMobile ? tab.shortLabel : tab.label }}
              <span
                v-if="tab.comingSoon"
                class="text-[9px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-surface-200 dark:bg-surface-700 text-content-400"
              >
                {{ t('editor.tabs.inDevelopment') }}
              </span>
            </span>
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="0"><TabGeneral /></TabPanel>
          <TabPanel value="1"><TabConstruction /></TabPanel>
          <TabPanel value="2"><TabGeological /></TabPanel>
          <TabPanel value="3"><TabSummary /></TabPanel>
          <TabPanel value="4"><TabHistorico /></TabPanel>
          <TabPanel value="5" />
        </TabPanels>
      </Tabs>
    </div>
  </div>
</template>
