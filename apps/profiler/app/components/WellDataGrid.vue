<script setup lang="ts">
import VGrid, {
  BasePlugin,
  VGridVueTemplate,
  type PluginProviders,
} from '@revolist/vue3-datagrid';
import type {
  AfterEditEvent,
  BeforeSaveDataDetails,
  ColumnRegular,
  CellTemplateProp,
  HyperFunc,
  VNode,
} from '@revolist/revogrid';
import GridRowHandle from './GridRowHandle.vue';

// ─── Public column-definition interface ──────────────────────────────────────
// Consumers import this type to declare columns for any well feature array.

export interface WellGridColumn {
  /** Object key on the row model */
  prop: string;
  /** Pre-translated header label */
  label: string;
  /** Column width in px (default 150) */
  size?: number;
  /** Input type — drives default editor */
  type?: 'text' | 'number';
  /** Prevent editing */
  readonly?: boolean;
  /** Override the RevoGrid editor key */
  editor?: string;
  /** Display-only formatter — bypasses the editor */
  formatter?: (value: unknown, row: Record<string, unknown>) => string;
  pin?: 'colPinStart' | 'colPinEnd';
}

// ─── Props / Emits ────────────────────────────────────────────────────────────

const props = defineProps<{
  /** Reactive array from the store (via deep-proxy or plain copy). */
  rows: Record<string, unknown>[];
  columns: WellGridColumn[];
}>();

const emit = defineEmits<{
  /** Parent should push a new row to the store */
  add: [];
  /** Parent should splice row at `index` from the store */
  delete: [index: number];
  /** Parent should assign `value` to `store.array[index][prop]` */
  change: [index: number, prop: string, value: unknown];
  /** Parent should reorder row from `from` to `to` */
  reorder: [from: number, to: number];
}>();

// ─── Row drag handle (left row-header) ───────────────────────────────────────

const plugins = [
  class HRPlugin extends BasePlugin {
    constructor(r: HTMLRevoGridElement, p: PluginProviders) {
      super(r, p);
      this.addEventListener('rowdragstart', e => {
        console.log('Row drag started:', e.detail);
        if (e.detail.model) {
          e.detail.text = e.detail.model['name'];
        }
      });
    }
  },
];
// ─── Column definitions ───────────────────────────────────────────────────────

const revoColumns = computed<ColumnRegular[]>(() => {
  const onDelete = (rowIndex: number) => emit('delete', rowIndex);

  const dataCols: ColumnRegular[] = props.columns.map(col => {
    const revoCol: ColumnRegular = {
      prop: col.prop,
      name: col.label,
      autoSize: !col.size,
      size: col.size,
      readonly: col.readonly ?? false,
      editor: col.readonly
        ? undefined
        : (col.editor ?? (col.type === 'number' ? 'number' : 'text')),
      pin: col.pin,
    };

    if (col.formatter) {
      const fmt = col.formatter;
      revoCol.cellTemplate = (
        _h: HyperFunc<VNode>,
        cellProps: CellTemplateProp,
      ) => {
        return _h(
          'span',
          { class: 'well-grid-cell-formatted' },
          fmt(cellProps.value, cellProps.model as Record<string, unknown>),
        );
      };
    }

    return revoCol;
  });

  const deleteCol: ColumnRegular = {
    prop: '_delete',
    name: '',
    size: 40,
    readonly: true,
    pin: 'colPinEnd',
  };

  return [
    {
      prop: '_drag',
      name: '',
      size: 30,
      pin: 'colPinStart',
      rowDrag: true,
      cellProperties: () => ({ class: 'p-0 flex items-center justify-center' }),
      cellTemplate: VGridVueTemplate(GridRowHandle),
    } as ColumnRegular,
    ...dataCols,
    deleteCol,
  ];
});

// ─── Source ───────────────────────────────────────────────────────────────────
// Spread to a plain array so RevoGrid's internal diffing does not fight the
// Immer/deep-proxy wrapper on the store.

const gridSource = computed(() => props.rows.map(r => ({ ...r })));

// ─── Height — auto-size based on row count ────────────────────────────────────

const HEADER_H = 32;
const ROW_H = 32;

const gridHeight = computed(() => {
  const contentH = Math.max(1, props.rows.length) * ROW_H;
  return `${HEADER_H + contentH + 2}px`;
});

// ─── Event handlers ───────────────────────────────────────────────────────────

function handleAfterEdit(event: CustomEvent<AfterEditEvent>) {
  const detail = event.detail;
  // Narrow to single-cell edit (BeforeSaveDataDetails has rowIndex + prop)
  if (!('rowIndex' in detail)) return;
  const { rowIndex, prop, val } = detail as BeforeSaveDataDetails;
  emit('change', rowIndex, String(prop), val);
}

function handleRowOrderChanged(
  event: CustomEvent<{ from: number; to: number }>,
) {
  console.log('Row order changed:', event.detail);
  emit('reorder', event.detail.from, event.detail.to);
}
</script>

<template>
  <div class="well-data-grid-wrapper flex flex-col">
    <div class="well-grid-container">
      <ClientOnly>
        <VGrid
          class="well-data-grid"
          :stretch="true"
          :source="gridSource"
          :columns="revoColumns"
          :plugins="plugins"
          :range="false"
          can-drag
          theme="compact"
          @afteredit="handleAfterEdit"
          @roworderchanged="handleRowOrderChanged"
        />

        <template #fallback>
          <div
            class="well-grid-skeleton animate-pulse rounded bg-surface-100 w-full h-full"
          />
        </template>
      </ClientOnly>
    </div>

    <div
      v-if="rows.length === 0"
      class="flex items-center justify-center py-6 text-xs font-mono text-content-400 tracking-wide"
    >
      <slot name="empty">—</slot>
    </div>
  </div>
</template>

<style scoped></style>
