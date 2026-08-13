<script setup lang="ts">
import type { Attachment, HistoryLogEntry } from '@welldot/core';
import { useConfirm } from 'primevue/useconfirm';

const { t } = useI18n();
const profileStore = useProfileStore();
const confirm = useConfirm();

// ─── Filter / search ──────────────────────────────────────────────────────────

const searchQuery = ref('');
const activeCategory = ref<string | null>(null);

const allLogs = computed<HistoryLogEntry[]>(() =>
  [...(profileStore.well.history_logs ?? [])].sort(
    (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime(),
  ),
);

const filteredLogs = computed<HistoryLogEntry[]>(() => {
  let result = allLogs.value;
  if (activeCategory.value) {
    result = result.filter(e => e.category === activeCategory.value);
  }
  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    result = result.filter(
      e =>
        e.description.toLowerCase().includes(q) ||
        e.author?.toLowerCase().includes(q) ||
        categoryLabel(e.category).toLowerCase().includes(q),
    );
  }
  return result;
});

function toggleCategory(cat: string) {
  activeCategory.value = activeCategory.value === cat ? null : cat;
}

// ─── Description expand ───────────────────────────────────────────────────────

const expandedDescriptions = ref(new Set<string>());

function toggleDescription(id: string) {
  if (expandedDescriptions.value.has(id)) {
    expandedDescriptions.value.delete(id);
  } else {
    expandedDescriptions.value.add(id);
  }
  expandedDescriptions.value = new Set(expandedDescriptions.value);
}

function isDescriptionExpanded(id: string) {
  return expandedDescriptions.value.has(id);
}

// ─── Attachment expand ────────────────────────────────────────────────────────

const VISIBLE_ATTACHMENTS = 3;
const expandedAttachments = ref(new Set<string>());

function toggleAttachments(id: string) {
  if (expandedAttachments.value.has(id)) {
    expandedAttachments.value.delete(id);
  } else {
    expandedAttachments.value.add(id);
  }
  expandedAttachments.value = new Set(expandedAttachments.value);
}

function visibleAttachments(entry: HistoryLogEntry): Attachment[] {
  const list = entry.attachments ?? [];
  if (expandedAttachments.value.has(entry.id)) return list;
  return list.slice(0, VISIBLE_ATTACHMENTS);
}

// ─── Entry dialog ─────────────────────────────────────────────────────────────

const dialogVisible = ref(false);
const editingId = ref<string | null>(null);

const form = reactive({
  category: '' as string,
  datetime: null as Date | null,
  description: '',
  author: '',
  severity: '' as string,
});

const categoryOptions = computed(() => [
  {
    label: t('editor.historico.logs.categories.maintenance'),
    value: 'maintenance',
    icon: 'ph:wrench-duotone',
  },
  {
    label: t('editor.historico.logs.categories.inspection'),
    value: 'inspection',
    icon: 'ph:eye-duotone',
  },
  {
    label: t('editor.historico.logs.categories.incident'),
    value: 'incident',
    icon: 'ph:warning-duotone',
  },
  {
    label: t('editor.historico.logs.categories.event'),
    value: 'event',
    icon: 'ph:flag-duotone',
  },
]);

const severityOptions = computed(() => [
  { label: t('editor.historico.logs.severity.low'), value: 'low' },
  { label: t('editor.historico.logs.severity.medium'), value: 'medium' },
  { label: t('editor.historico.logs.severity.high'), value: 'high' },
  { label: t('editor.historico.logs.severity.critical'), value: 'critical' },
]);

function openAddDialog() {
  editingId.value = null;
  form.category = 'event';
  form.datetime = new Date();
  form.description = '';
  form.author = '';
  form.severity = '';
  dialogVisible.value = true;
}

function openEditDialog(entry: HistoryLogEntry) {
  editingId.value = entry.id;
  form.category = entry.category;
  form.datetime = new Date(entry.datetime);
  form.description = entry.description;
  form.author = entry.author ?? '';
  form.severity = entry.severity ?? '';
  dialogVisible.value = true;
}

function saveEntry() {
  if (!form.category || !form.datetime || !form.description.trim()) return;

  const now = new Date().toISOString();
  const datetimeStr = form.datetime.toISOString();

  if (editingId.value) {
    profileStore.updateWell(draft => {
      const idx =
        draft.history_logs?.findIndex(e => e.id === editingId.value) ?? -1;
      if (idx !== -1 && draft.history_logs) {
        draft.history_logs[idx] = {
          ...draft.history_logs[idx],
          category: form.category,
          datetime: datetimeStr,
          description: form.description.trim(),
          author: form.author.trim() || undefined,
          severity: form.severity || undefined,
          updated_at: now,
        };
      }
    });
  } else {
    const newEntry: HistoryLogEntry = {
      id: crypto.randomUUID(),
      category: form.category,
      datetime: datetimeStr,
      description: form.description.trim(),
      author: form.author.trim() || undefined,
      severity: form.severity || undefined,
      updated_at: now,
    };
    profileStore.updateWell(draft => {
      if (!draft.history_logs) draft.history_logs = [];
      draft.history_logs.push(newEntry);
    });
  }

  dialogVisible.value = false;
}

function deleteEntry(id: string) {
  confirm.require({
    icon: 'ph:warning-duotone',
    header: t('editor.historico.logs.deleteConfirm'),
    message: t('editor.historico.logs.deleteConfirm'),
    acceptLabel: t('editor.confirmClear.accept'),
    rejectLabel: t('editor.confirmClear.reject'),
    acceptProps: { severity: 'danger' },
    rejectProps: { text: true, severity: 'secondary' },
    defaultFocus: 'reject',
    accept: () => {
      profileStore.updateWell(draft => {
        draft.history_logs = draft.history_logs?.filter(e => e.id !== id);
      });
    },
  });
}

// ─── Attachment dialog ────────────────────────────────────────────────────────

const mediaTypeOptions = [
  { label: 'PDF', value: 'application/pdf' },
  { label: 'JPEG', value: 'image/jpeg' },
  { label: 'PNG', value: 'image/png' },
  { label: 'Word', value: 'application/msword' },
  { label: 'Other', value: 'application/octet-stream' },
];

const attachmentDialog = reactive({
  visible: false,
  entryId: '' as string,
  editingAttachmentId: null as string | null,
  form: {
    url: '',
    filename: '',
    mediaType: 'application/pdf',
  },
});

function openAddAttachment(entryId: string) {
  attachmentDialog.entryId = entryId;
  attachmentDialog.editingAttachmentId = null;
  attachmentDialog.form.url = '';
  attachmentDialog.form.filename = '';
  attachmentDialog.form.mediaType = 'application/pdf';
  attachmentDialog.visible = true;
}

function openEditAttachment(entryId: string, attachment: Attachment) {
  attachmentDialog.entryId = entryId;
  attachmentDialog.editingAttachmentId = attachment.id;
  attachmentDialog.form.url = attachment.uri;
  attachmentDialog.form.filename = attachment.filename ?? '';
  attachmentDialog.form.mediaType = attachment.media_type;
  attachmentDialog.visible = true;
}

function saveAttachment() {
  const { entryId, editingAttachmentId, form } = attachmentDialog;
  if (!form.url.trim() && !editingAttachmentId) return;

  profileStore.updateWell(draft => {
    const entry = draft.history_logs?.find(e => e.id === entryId);
    if (!entry) return;
    if (!entry.attachments) entry.attachments = [];

    if (editingAttachmentId) {
      const idx = entry.attachments.findIndex(
        a => a.id === editingAttachmentId,
      );
      if (idx !== -1) {
        const existing = entry.attachments[idx]!;
        entry.attachments[idx] = {
          id: existing.id,
          uri: existing.uri,
          sha256: existing.sha256,
          description: existing.description,
          filename: form.filename.trim() || undefined,
          media_type: form.mediaType,
        };
      }
    } else {
      entry.attachments.push({
        id: crypto.randomUUID(),
        uri: form.url.trim(),
        media_type: form.mediaType,
        filename: form.filename.trim() || undefined,
      });
    }
  });

  attachmentDialog.visible = false;
}

function deleteAttachment(entryId: string, attachmentId: string) {
  confirm.require({
    icon: 'ph:warning-duotone',
    header: t('editor.historico.logs.deleteAttachment'),
    message: t('editor.historico.logs.deleteAttachment'),
    acceptLabel: t('editor.confirmClear.accept'),
    rejectLabel: t('editor.confirmClear.reject'),
    acceptProps: { severity: 'danger' },
    rejectProps: { text: true, severity: 'secondary' },
    defaultFocus: 'reject',
    accept: () => {
      profileStore.updateWell(draft => {
        const entry = draft.history_logs?.find(e => e.id === entryId);
        if (entry) {
          entry.attachments = entry.attachments?.filter(
            a => a.id !== attachmentId,
          );
        }
      });
    },
  });
}

// ─── Display helpers ──────────────────────────────────────────────────────────

function categoryIcon(category: string): string {
  const opt = categoryOptions.value.find(o => o.value === category);
  return opt?.icon ?? 'ph:dot-duotone';
}

function categorySeverity(category: string): string {
  const map: Record<string, string> = {
    maintenance: 'warn',
    inspection: 'info',
    incident: 'danger',
    event: 'secondary',
  };
  return map[category] ?? 'secondary';
}

function severityToChip(severity: string): string {
  if (severity === 'low') return 'success';
  if (severity === 'medium') return 'warn';
  if (severity === 'high' || severity === 'critical') return 'danger';
  return 'secondary';
}

function categoryLabel(category: string): string {
  const opt = categoryOptions.value.find(o => o.value === category);
  return opt?.label ?? category;
}

function severityLabel(severity: string): string {
  const opt = severityOptions.value.find(o => o.value === severity);
  return opt?.label ?? severity;
}

function showEditedAt(entry: HistoryLogEntry): boolean {
  if (!entry.updated_at) return false;
  const diff = Math.abs(
    new Date(entry.updated_at).getTime() - new Date(entry.datetime).getTime(),
  );
  return diff > 60_000;
}

function attachmentIcon(mediaType: string): string {
  if (mediaType.includes('pdf')) return 'ph:file-pdf-duotone';
  if (mediaType.startsWith('image/')) return 'ph:image-duotone';
  if (mediaType.includes('word') || mediaType.includes('document'))
    return 'ph:file-doc-duotone';
  return 'ph:file-duotone';
}
</script>

<template>
  <div class="flex flex-col gap-6 p-6">
    <!-- ── Header ─────────────────────────────────────────────────────────── -->
    <div class="flex items-baseline justify-between">
      <h3
        class="font-serif text-[22px] font-medium tracking-[-0.015em] text-content-0 m-0"
      >
        {{ t('editor.historico.logs.title') }}
      </h3>
      <span
        class="font-mono text-[10px] tracking-[0.08em] uppercase text-content-500 tabular-nums"
      >
        {{ filteredLogs.length }}
        <span v-if="filteredLogs.length !== allLogs.length">
          / {{ allLogs.length }}</span
        >
        {{ t('editor.historico.logs.registries') }}
      </span>
    </div>

    <!-- ── Toolbar: search + add ──────────────────────────────────────────── -->
    <div class="flex items-center gap-3">
      <div class="relative flex-1">
        <Icon
          name="ph:magnifying-glass-duotone"
          class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-content-400 pointer-events-none"
        />
        <InputText
          v-model="searchQuery"
          :placeholder="t('editor.historico.logs.search')"
          class="w-full pl-9"
        />
      </div>
      <Button
        unstyled
        class="add-entry-btn"
        type="button"
        @click="openAddDialog"
        :label="t('editor.historico.logs.addEvent')"
      >
        <template #icon>
          <Icon name="ph:plus" />
        </template>
      </Button>
    </div>

    <!-- ── Category filter chips ──────────────────────────────────────────── -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="opt in categoryOptions"
        :key="opt.value"
        class="filter-chip"
        :class="{ active: activeCategory === opt.value }"
        type="button"
        @click="toggleCategory(opt.value)"
      >
        <Icon :name="opt.icon" class="size-3.5" />
        {{ opt.label }}
      </button>
    </div>

    <!-- ── Empty state ────────────────────────────────────────────────────── -->
    <div
      v-if="!allLogs.length"
      class="flex flex-col items-center gap-4 py-10 text-content-400"
    >
      <Icon
        name="ph:clock-counter-clockwise-duotone"
        class="size-12 opacity-40"
      />
      <p class="text-sm">{{ t('editor.historico.logs.empty') }}</p>
    </div>

    <!-- ── No results ────────────────────────────────────────────────────── -->
    <div
      v-else-if="!filteredLogs.length"
      class="flex flex-col items-center gap-3 py-10 text-content-400"
    >
      <Icon name="ph:funnel-simple-duotone" class="size-10 opacity-40" />
      <p class="text-sm">{{ t('editor.historico.logs.noResults') }}</p>
    </div>

    <!-- ── Timeline ───────────────────────────────────────────────────────── -->
    <div v-else class="relative flex flex-col">
      <!-- vertical line -->
      <div class="absolute left-4.5 top-0 bottom-0 w-px bg-surface-200" />

      <div
        v-for="entry in filteredLogs"
        :key="entry.id"
        class="relative flex gap-4 pb-6 last:pb-0"
      >
        <!-- dot on timeline -->
        <div class="relative z-10 shrink-0 mt-1">
          <div
            class="size-9 rounded-full flex items-center justify-center bg-surface-100 border border-surface-200"
          >
            <Icon
              :name="categoryIcon(entry.category)"
              class="size-4 text-content-200"
            />
          </div>
        </div>

        <!-- card -->
        <div
          class="flex-1 rounded-xl border border-surface-200/70 bg-surface-0 px-4 py-3 flex flex-col gap-3"
        >
          <!-- ── header row: tags + date ─────────────────────────────────── -->
          <div class="flex items-center flex-wrap gap-2">
            <Tag
              :value="categoryLabel(entry.category)"
              :severity="categorySeverity(entry.category)"
              class="text-[11px]"
            />
            <Tag
              v-if="entry.severity"
              :value="severityLabel(entry.severity)"
              :severity="severityToChip(entry.severity)"
              class="text-[11px]"
            />
            <span class="ml-auto font-mono text-xs text-content-300">
              {{ formatDate(entry.datetime, 'dd/MM/yyyy HH:mm') }}
            </span>
          </div>

          <!-- ── description ────────────────────────────────────────────── -->
          <div class="flex flex-col gap-1">
            <p
              class="text-sm leading-relaxed whitespace-pre-line m-0 transition-all"
              :class="{ 'line-clamp-3': !isDescriptionExpanded(entry.id) }"
            >
              {{ entry.description }}
            </p>
            <button
              v-if="entry.description.length > 200"
              class="show-more-btn"
              type="button"
              @click="toggleDescription(entry.id)"
            >
              {{
                isDescriptionExpanded(entry.id)
                  ? t('editor.historico.logs.showLess')
                  : t('editor.historico.logs.showMore')
              }}
            </button>
          </div>

          <!-- ── attachments section ────────────────────────────────────── -->
          <div class="flex flex-col gap-2">
            <!-- label row -->
            <div class="flex items-center gap-2">
              <span
                class="font-mono text-[10px] tracking-[0.08em] uppercase text-content-400"
              >
                {{
                  t('editor.historico.logs.attachments', {
                    n: (entry.attachments ?? []).length,
                  })
                }}
              </span>
              <button
                class="add-attachment-btn"
                type="button"
                @click="openAddAttachment(entry.id)"
              >
                <Icon name="ph:plus" class="size-3" />
                {{ t('editor.historico.logs.addAttachment') }}
              </button>
            </div>

            <!-- thumbnail strip -->
            <div
              v-if="(entry.attachments ?? []).length"
              class="flex flex-wrap gap-2"
            >
              <div
                v-for="att in visibleAttachments(entry)"
                :key="att.id"
                class="attachment-thumb"
              >
                <Icon
                  :name="attachmentIcon(att.media_type)"
                  class="size-5 text-content-300 shrink-0"
                />
                <span
                  class="font-mono text-[10px] text-content-300 truncate flex-1 min-w-0"
                >
                  {{ att.filename ?? att.uri.split('/').at(-1) ?? att.uri }}
                </span>
                <div class="flex items-center gap-1 shrink-0">
                  <button
                    class="thumb-action"
                    type="button"
                    :aria-label="t('editor.historico.logs.editAttachment')"
                    @click="openEditAttachment(entry.id, att)"
                  >
                    <Icon name="ph:pencil-simple-duotone" class="size-3" />
                  </button>
                  <button
                    class="thumb-action thumb-action--danger"
                    type="button"
                    :aria-label="t('editor.historico.logs.deleteAttachment')"
                    @click="deleteAttachment(entry.id, att.id)"
                  >
                    <Icon name="ph:trash-duotone" class="size-3" />
                  </button>
                </div>
              </div>

              <!-- overflow / show more -->
              <button
                v-if="(entry.attachments ?? []).length > VISIBLE_ATTACHMENTS"
                class="attachment-overflow-btn"
                type="button"
                @click="toggleAttachments(entry.id)"
              >
                <span v-if="!expandedAttachments.has(entry.id)">
                  +{{ (entry.attachments?.length ?? 0) - VISIBLE_ATTACHMENTS }}
                  {{ t('editor.historico.logs.showMore') }}
                </span>
                <span v-else>{{ t('editor.historico.logs.showLess') }}</span>
              </button>
            </div>
          </div>

          <!-- ── footer row: author + actions ───────────────────────────── -->
          <div class="flex items-center gap-2 pt-1 border-t border-surface-100">
            <div
              class="flex items-center gap-2 flex-1 text-xs text-content-400"
            >
              <span v-if="entry.author">
                {{ t('editor.historico.logs.by') }} {{ entry.author }}
              </span>
              <span
                v-if="showEditedAt(entry)"
                :class="{ 'before:content-[\'·\'] before:mr-2': entry.author }"
              >
                {{
                  t('editor.historico.logs.editedAt', {
                    date: formatDate(entry.updated_at, 'dd/MM/yyyy'),
                  })
                }}
              </span>
            </div>
            <Button
              severity="secondary"
              text
              size="small"
              :label="t('editor.edit')"
              :aria-label="t('editor.historico.logs.editEvent')"
              @click="openEditDialog(entry)"
            >
              <template #icon>
                <Icon name="ph:pencil-simple-duotone" />
              </template>
            </Button>
            <Button
              severity="danger"
              text
              size="small"
              :aria-label="t('editor.historico.logs.deleteConfirm')"
              @click="deleteEntry(entry.id)"
            >
              <template #icon>
                <Icon name="ph:x-bold" />
              </template>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ── Add / Edit Entry Dialog ───────────────────────────────────────────── -->
  <Dialog
    v-model:visible="dialogVisible"
    modal
    :header="
      editingId
        ? t('editor.historico.logs.editEvent')
        : t('editor.historico.logs.addEvent')
    "
    :style="{ width: '100vw', maxWidth: '36rem' }"
  >
    <div class="flex flex-col gap-4 pt-2">
      <Field :label="t('editor.historico.logs.fields.category')">
        <div class="flex flex-wrap gap-2">
          <label
            v-for="opt in categoryOptions"
            :key="opt.value"
            :for="`cat-${opt.value}`"
            class="category-radio-option"
            :class="{ active: form.category === opt.value }"
          >
            <RadioButton
              v-model="form.category"
              :inputId="`cat-${opt.value}`"
              :value="opt.value"
              class="sr-only"
            />
            <Icon :name="opt.icon" class="size-4 shrink-0" />
            <span>{{ opt.label }}</span>
          </label>
        </div>
      </Field>

      <Field :label="t('editor.historico.logs.fields.datetime')">
        <DatePicker
          v-model="form.datetime"
          show-time
          hour-format="24"
          show-button-bar
          date-format="dd/mm/yy"
          class="w-full"
          :pt="{ pcInput: { root: 'font-mono text-sm w-full' } }"
        />
      </Field>

      <Field :label="t('editor.historico.logs.fields.description')">
        <Textarea
          v-model="form.description"
          :rows="5"
          class="w-full font-mono text-sm"
        />
      </Field>

      <Field :label="t('editor.historico.logs.fields.author')">
        <InputText v-model="form.author" class="w-full" />
      </Field>

      <Field :label="t('editor.historico.logs.fields.severity')">
        <div class="flex flex-wrap gap-2">
          <label
            v-for="opt in severityOptions"
            :key="opt.value"
            :for="`sev-${opt.value}`"
            class="category-radio-option"
            :class="{ active: form.severity === opt.value }"
          >
            <RadioButton
              v-model="form.severity"
              :inputId="`sev-${opt.value}`"
              :value="opt.value"
              class="sr-only"
            />
            <span>{{ opt.label }}</span>
          </label>
        </div>
      </Field>
    </div>

    <template #footer>
      <Button
        :label="t('editor.confirmClear.reject')"
        severity="secondary"
        text
        @click="dialogVisible = false"
      />
      <Button
        :label="
          editingId ? t('editor.save') : t('editor.historico.logs.addEvent')
        "
        :disabled="!form.category || !form.datetime || !form.description.trim()"
        @click="saveEntry"
      />
    </template>
  </Dialog>

  <!-- ── Add / Edit Attachment Dialog ─────────────────────────────────────── -->
  <Dialog
    v-model:visible="attachmentDialog.visible"
    modal
    :header="
      attachmentDialog.editingAttachmentId
        ? t('editor.historico.logs.editAttachment')
        : t('editor.historico.logs.addAttachment')
    "
    :style="{ width: '28rem' }"
  >
    <div class="flex flex-col gap-4 pt-2">
      <Field
        v-if="!attachmentDialog.editingAttachmentId"
        :label="t('editor.historico.logs.fields.attachmentUrl')"
      >
        <InputText
          v-model="attachmentDialog.form.url"
          class="w-full font-mono text-sm"
          placeholder="https://"
        />
      </Field>

      <Field :label="t('editor.historico.logs.fields.attachmentFilename')">
        <InputText v-model="attachmentDialog.form.filename" class="w-full" />
      </Field>

      <Field :label="t('editor.historico.logs.fields.attachmentMediaType')">
        <Select
          v-model="attachmentDialog.form.mediaType"
          :options="mediaTypeOptions"
          option-label="label"
          option-value="value"
          class="w-full"
        />
      </Field>
    </div>

    <template #footer>
      <Button
        :label="t('editor.confirmClear.reject')"
        severity="secondary"
        text
        @click="attachmentDialog.visible = false"
      />
      <Button
        :label="
          attachmentDialog.editingAttachmentId
            ? t('editor.save')
            : t('editor.historico.logs.addAttachment')
        "
        :disabled="
          !attachmentDialog.editingAttachmentId &&
          !attachmentDialog.form.url.trim()
        "
        @click="saveAttachment"
      />
    </template>
  </Dialog>
</template>

<style scoped>
.add-entry-btn {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 14px;
  min-height: 32px;
  border-radius: 999px;
  border: 1px dashed var(--color-surface-300);
  background: var(--color-surface-50);
  color: var(--color-content-300);
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.01em;
  cursor: pointer;
  transition:
    background 120ms ease,
    color 120ms ease,
    border-color 120ms ease;
}

.add-entry-btn:hover {
  background: var(--color-surface-100);
  color: var(--color-content-0);
  border-color: var(--color-content-0);
}

.add-entry-btn:active {
  transform: translateY(0.5px);
}

.add-entry-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px
    color-mix(in srgb, var(--color-primary-500) 25%, transparent);
  border-color: var(--color-primary-500);
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid var(--color-surface-200);
  background: var(--color-surface-50);
  color: var(--color-content-300);
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 120ms ease,
    color 120ms ease,
    border-color 120ms ease;
}

.filter-chip:hover {
  background: var(--color-surface-100);
  color: var(--color-content-100);
  border-color: var(--color-surface-300);
}

.filter-chip.active {
  background: var(--color-primary-50);
  color: var(--color-primary-600);
  border-color: var(--color-primary-200);
}

.show-more-btn {
  align-self: flex-start;
  background: none;
  border: none;
  padding: 0;
  font-size: 11px;
  font-family: var(--font-display);
  font-weight: 500;
  color: var(--color-primary-500);
  cursor: pointer;
  letter-spacing: 0.01em;
}

.show-more-btn:hover {
  color: var(--color-primary-600);
  text-decoration: underline;
}

.add-attachment-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px dashed var(--color-surface-300);
  background: transparent;
  color: var(--color-content-400);
  font-family: var(--font-display);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition:
    background 120ms ease,
    color 120ms ease,
    border-color 120ms ease;
}

.add-attachment-btn:hover {
  background: var(--color-surface-50);
  color: var(--color-content-200);
  border-color: var(--color-surface-400);
}

.attachment-thumb {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 8px;
  border: 1px solid var(--color-surface-200);
  background: var(--color-surface-50);
  max-width: 200px;
  min-width: 120px;
}

.thumb-action {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 2px;
  border-radius: 4px;
  color: var(--color-content-400);
  cursor: pointer;
  transition:
    color 100ms ease,
    background 100ms ease;
}

.thumb-action:hover {
  background: var(--color-surface-100);
  color: var(--color-content-100);
}

.thumb-action--danger:hover {
  background: color-mix(in srgb, var(--color-error-500) 10%, transparent);
  color: var(--color-error-500);
}

.attachment-overflow-btn {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px dashed var(--color-surface-300);
  background: transparent;
  color: var(--color-content-400);
  font-family: var(--font-display);
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 120ms ease,
    color 120ms ease;
}

.attachment-overflow-btn:hover {
  background: var(--color-surface-50);
  color: var(--color-primary-500);
}

.category-radio-option {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-surface-200);
  background: var(--color-surface-50);
  color: var(--color-content-300);
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background 120ms ease,
    color 120ms ease,
    border-color 120ms ease;
}

.category-radio-option:hover {
  background: var(--color-surface-100);
  color: var(--color-content-100);
  border-color: var(--color-surface-300);
}

.category-radio-option.active {
  background: var(--color-primary-50);
  color: var(--color-primary-600);
  border-color: var(--color-primary-300);
}
</style>
