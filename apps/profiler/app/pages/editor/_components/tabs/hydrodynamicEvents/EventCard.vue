<script setup lang="ts">
import type { HydrodynamicEvent } from '@welldot/core';
import { useConfirm } from 'primevue/useconfirm';
import EventStats from './EventStats.vue';

const props = defineProps<{ event: HydrodynamicEvent }>();
const emit = defineEmits<{ edit: [event: HydrodynamicEvent] }>();

const { t } = useI18n();
const profileStore = useProfileStore();
const confirm = useConfirm();
const { eventTypeLabel, eventTypeSeverity } = useHydrodynamicEventTypes();

function deleteEvent() {
  confirm.require({
    icon: 'ph:warning-duotone',
    header: t('editor.hydrodynamicEvents.deleteConfirm'),
    message: t('editor.hydrodynamicEvents.deleteConfirm'),
    acceptLabel: t('editor.confirmClear.accept'),
    rejectLabel: t('editor.confirmClear.reject'),
    acceptProps: { severity: 'danger' },
    rejectProps: { text: true, severity: 'secondary' },
    defaultFocus: 'reject',
    accept: () => {
      profileStore.updateWell(draft => {
        draft.hydrodynamic_events = draft.hydrodynamic_events?.filter(e => e.id !== props.event.id);
      });
    },
  });
}
</script>

<template>
  <div class="event-card">
    <!-- card header -->
    <div class="flex items-center gap-2 flex-wrap">
      <Tag
        :value="eventTypeLabel(event.type)"
        :severity="eventTypeSeverity(event.type)"
        class="text-[11px] font-mono tracking-wide"
      />
      <span class="ml-auto font-mono text-xs text-content-300">
        {{ formatDate(event.datetime, 'dd MMM yyyy') }}
      </span>
      <Button
        severity="secondary"
        text
        size="small"
        :label="t('editor.edit')"
        @click="emit('edit', event)"
      >
        <template #icon>
          <Icon name="ph:pencil-simple-duotone" />
        </template>
      </Button>
    </div>

    <EventStats :event="event" />

    <!-- sparkline chart -->
    <svg
      v-if="hasSparkline(event)"
      class="w-full mt-1 text-primary-400"
      height="56"
      viewBox="0 0 200 40"
      preserveAspectRatio="none"
    >
      <polyline
        :points="sparklinePoints(event)"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
    </svg>

    <!-- footer -->
    <div class="flex items-center gap-3 pt-2 border-t border-surface-100 text-[11px] text-content-400 flex-wrap">
      <template v-if="event.operator || event.equipment || recoveryReadingsCount(event)">
        <span v-if="event.operator">
          <strong class="font-semibold text-content-200">Operador</strong>
          {{ event.operator }}
        </span>
        <span v-if="event.equipment">
          <strong class="font-semibold text-content-200">Equip.</strong>
          {{ event.equipment }}
        </span>
        <span v-if="recoveryReadingsCount(event)">
          <strong class="font-semibold text-content-200">
            {{ t('editor.hydrodynamicEvents.stats.recovery') }}
          </strong>
          {{ recoveryReadingsCount(event) }}
          {{ t('editor.hydrodynamicEvents.stats.readings') }}
        </span>
      </template>
      <div class="ml-auto shrink-0">
        <Button
          severity="danger"
          text
          size="small"
          @click="deleteEvent"
        >
          <template #icon>
            <Icon name="ph:x-bold" />
          </template>
        </Button>
      </div>
    </div>

    <!-- notes -->
    <p
      v-if="event.notes"
      class="text-xs text-content-300 m-0 leading-relaxed pt-1"
    >
      {{ event.notes }}
    </p>
  </div>
</template>

<style scoped>
.event-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid var(--color-surface-200);
  background: var(--color-surface-0);
}
</style>
