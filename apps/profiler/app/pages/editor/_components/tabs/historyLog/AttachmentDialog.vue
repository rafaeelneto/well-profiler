<script setup lang="ts">
import type { Attachment } from '@welldot/core';

const emit = defineEmits<{ save: [attachment: Attachment] }>();

const { t } = useI18n();

const mediaTypeOptions = [
  { label: 'PDF', value: 'application/pdf' },
  { label: 'JPEG', value: 'image/jpeg' },
  { label: 'PNG', value: 'image/png' },
  { label: 'Word', value: 'application/msword' },
  { label: 'Other', value: 'application/octet-stream' },
];

const visible = ref(false);
/** The attachment being edited, or null when adding a new one. */
const editing = ref<Attachment | null>(null);

const form = reactive({
  url: '',
  filename: '',
  mediaType: 'application/pdf',
});

function openAdd() {
  editing.value = null;
  form.url = '';
  form.filename = '';
  form.mediaType = 'application/pdf';
  visible.value = true;
}

function openEdit(attachment: Attachment) {
  editing.value = { ...attachment };
  form.url = attachment.uri;
  form.filename = attachment.filename ?? '';
  form.mediaType = attachment.media_type;
  visible.value = true;
}

defineExpose({ openAdd, openEdit });

/**
 * Emits a complete attachment — the original id when editing, a fresh one when
 * adding — so every caller can handle the result the same way: upsert by id.
 * `sha256` is dropped when the URI changed: the old hash no longer describes
 * the target.
 */
function save() {
  const uri = form.url.trim();
  if (!uri) return;

  const patch = {
    uri,
    media_type: form.mediaType,
    filename: form.filename.trim() || undefined,
  };
  const existing = editing.value;

  emit(
    'save',
    existing
      ? {
          id: existing.id,
          description: existing.description,
          sha256: existing.uri === uri ? existing.sha256 : undefined,
          ...patch,
        }
      : { id: crypto.randomUUID(), ...patch },
  );

  visible.value = false;
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="
      editing
        ? t('editor.historyLog.logs.editAttachment')
        : t('editor.historyLog.logs.addAttachment')
    "
    :style="{ width: '28rem' }"
  >
    <div class="flex flex-col gap-4 pt-2">
      <Field :label="t('editor.historyLog.logs.fields.attachmentUrl')">
        <InputText
          v-model="form.url"
          class="w-full font-mono text-sm"
          placeholder="https://"
        />
      </Field>

      <Field :label="t('editor.historyLog.logs.fields.attachmentFilename')">
        <InputText v-model="form.filename" class="w-full" />
      </Field>

      <Field :label="t('editor.historyLog.logs.fields.attachmentMediaType')">
        <Select
          v-model="form.mediaType"
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
        @click="visible = false"
      />
      <Button
        :label="
          editing ? t('editor.save') : t('editor.historyLog.logs.addAttachment')
        "
        :disabled="!form.url.trim()"
        @click="save"
      />
    </template>
  </Dialog>
</template>
