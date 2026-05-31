<script setup lang="ts">
import VGrid, {
  BasePlugin,
  VGridVueEditor,
  type PluginProviders,
} from '@revolist/vue3-datagrid';
import GridTextEditor from './GridTextEditor.vue';
import GridNumberEditor from './GridNumberEditor.vue';
import { columnStretchPlugin } from './columnStretchPlugin';
import type {
  AfterEditEvent,
  BeforeSaveDataDetails,
  ColumnRegular,
  CellTemplateProp,
  HyperFunc,
  VNode,
} from '@revolist/revogrid';

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
  /** Stretch this column to absorb all remaining grid width */
  stretch?: boolean;
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

const gridEditors = {
  text: VGridVueEditor(GridTextEditor),
  number: VGridVueEditor(GridNumberEditor),
};

const stretchProp = computed(
  () => props.columns.find(c => c.stretch)?.prop ?? null,
);

const gridStretch = computed(() => stretchProp.value === null);

const plugins = computed(() => {
  const list = [
    class HRPlugin extends BasePlugin {
      constructor(r: HTMLRevoGridElement, p: PluginProviders) {
        super(r, p);
        this.addEventListener('rowdragstart', e => {
          const name = e.detail.model?.['name'];
          if (typeof name === 'string' && name) {
            e.detail.text = name;
          }
        });
      }
    },
  ];
  if (stretchProp.value !== null) {
    list.push(columnStretchPlugin(stretchProp.value));
  }
  return list;
});
// ─── Column definitions ───────────────────────────────────────────────────────

const revoColumns = computed<ColumnRegular[]>(() => {
  const onDelete = (rowIndex: number) => emit('delete', rowIndex);

  const dataCols: ColumnRegular[] = props.columns.map(col => {
    const revoCol: ColumnRegular = {
      prop: col.prop,
      name: col.label,
      autoSize: !col.size && !col.stretch,
      size: col.size,
      readonly: col.readonly ?? false,
      editor: col.readonly
        ? undefined
        : (col.editor ?? (col.type === 'number' ? 'number' : 'text')),
      pin: col.pin,
      cellProperties:
        col.type === 'number' ? () => ({ class: 'num' }) : undefined,
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
    cellProperties: () => ({ class: 'well-grid-delete-cell' }),
    cellTemplate: (h: HyperFunc<VNode>, cellProps: CellTemplateProp) =>
      h('button', {
        class: 'well-grid-delete-btn',
        type: 'button',
        onClick: (e: MouseEvent) => {
          e.stopPropagation();
          onDelete(cellProps.rowIndex);
        },
      }),
  };

  return [
    {
      prop: '_drag',
      name: '',
      size: 30,
      pin: 'colPinStart',
      rowDrag: true,
      cellProperties: () => ({ class: 'well-grid-drag-cell' }),
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

const HEADER_H = 38;
const ROW_H = 30;

const gridHeight = computed(() => {
  const contentH = Math.max(1, props.rows.length) * ROW_H;
  return `${HEADER_H + contentH + 2}px`;
});

// ─── Event handlers ───────────────────────────────────────────────────────────

function handleAfterEdit(event: CustomEvent<AfterEditEvent>) {
  const detail = event.detail;

  console.log(event.detail);
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
    <div v-show="rows.length > 0" class="well-grid-container">
      <ClientOnly>
        <VGrid
          class="well-data-grid"
          :style="{ height: gridHeight }"
          :row-size="ROW_H"
          :stretch="gridStretch"
          :source="gridSource"
          :columns="revoColumns"
          :editors="gridEditors"
          :plugins="plugins"
          :range="true"
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
  </div>
</template>

<style scoped>
.well-data-grid :deep(.header-rgRow) {
  height: v-bind('`${HEADER_H}px`');
}
</style>

<style>
/* ── RevoGrid → welldot theme ─────────────────────────────────────────────
   Token map: --font-mono, --color-surface-*, --color-content-*, --color-primary-*
   ────────────────────────────────────────────────────────────────────────── */

revogr-attribution {
  display: none !important;
}

revo-grid {
  --revo-grid-font: var(--font-mono);
  --revo-border-color: var(--color-surface-200);
  font-family: var(--font-mono) !important;
  font-size: 11px !important;
  color: var(--color-content-0);
  border: 1px solid var(--color-surface-200);
  border-radius: 8px;
  overflow: hidden;
}

/* Header cells — .rgHeaderCell (v4+) and .header-rgCell (older builds) */
revo-grid .rgHeaderCell,
revo-grid .header-rgCell {
  background: var(--color-surface-50);
  color: var(--color-content-500);
  font-weight: 400;
  font-size: 9.5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border-bottom: 1px solid var(--color-surface-200) !important;
  border-right: none !important;
}

/* Body cells */
revo-grid .rgCell {
  border-bottom: 1px solid var(--color-surface-200) !important;
  border-right: none !important;
  padding: 0 8px;
  display: flex;
  align-items: center;
  color: var(--color-content-0);
}

/* Row states */
revo-grid .rgRow:hover .rgCell {
  background: color-mix(in srgb, var(--color-primary-500) 5%, transparent);
}

revo-grid .rgRow.focused-rgRow .rgCell,
revo-grid .rgRow[selected] .rgCell {
  background: color-mix(in srgb, var(--color-primary-500) 5%, transparent);
}

/* Accent rail on first cell of selected row */
revo-grid .rgRow[selected] .rgCell:first-child {
  box-shadow: inset 3px 0 0 var(--color-primary-500);
}

/* Numeric columns — tabular figures, right-aligned */
revo-grid .rgCell.num {
  justify-content: flex-end;
  font-variant-numeric: tabular-nums;
}

/* ── PrimeVue cell editors ────────────────────────────────────────────────── */

/* Editor renders in revogr-edit which is a portal outside revo-grid */
revogr-edit input {
  font-family: var(--font-mono) !important;
  font-size: 11px !important;
  color: var(--color-content-0) !important;
}

/* InputText root IS the <input>; InputNumber pcInput root is also the <input> */
revo-grid .well-cell-input {
  width: 100%;
  height: 100%;
  border: none !important;
  border-radius: 0 !important;
  background: var(--color-surface-0) !important;
  box-shadow: inset 0 0 0 1.5px var(--color-primary-500) !important;
  font-family: var(--font-mono) !important;
  font-size: 11px !important;
  color: var(--color-content-0) !important;
  padding: 0 8px !important;
  outline: none !important;
}

/* InputNumber wrapper div must fill the cell */
revo-grid .well-cell-input-number {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
  text-align: right !important;
}

revogr-edit .well-cell-input-number input {
  text-align: right !important;
}

/* Numeric cells — right-align */
revo-grid .rgCell.num .well-cell-input {
  text-align: left;
}

/* Focus ring */
revo-grid .rgCell.focused-cell,
revo-grid revogr-focus {
  border-color: var(--color-primary-500) !important;
}

/* ── Drag column ─────────────────────────────────────────────────────────── */

revo-grid .well-grid-drag-cell {
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

revo-grid .revo-drag-icon::before {
  content: '';
  display: block;
  width: 12px;
  height: 12px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3E%3Cpath fill='%23aaaaaa' d='M102 60a10 10 0 1 1-10-10a10 10 0 0 1 10 10m62 10a10 10 0 1 0-10-10a10 10 0 0 0 10 10m-72 48a10 10 0 1 0 10 10a10 10 0 0 0-10-10m72 0a10 10 0 1 0 10 10a10 10 0 0 0-10-10m-72 68a10 10 0 1 0 10 10a10 10 0 0 0-10-10m72 0a10 10 0 1 0 10 10a10 10 0 0 0-10-10'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.7;
  transition: opacity 200ms ease;
}

revo-grid .revo-draggable:hover .revo-drag-icon::before {
  opacity: 1;
}

/* ── Delete / actions column ─────────────────────────────────────────────── */

revo-grid .well-grid-delete-cell {
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

revo-grid .well-grid-delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 4px;
  color: var(--color-content-500);
  font-family: var(--font-mono);
  font-size: 18px;
  line-height: 1;
  opacity: 0.4;
  transition:
    opacity 200ms ease,
    color 200ms ease,
    background-color 200ms ease;
}

revo-grid .well-grid-delete-btn::before {
  content: '×';
  display: block;
}

revo-grid .well-grid-delete-btn:hover {
  opacity: 1;
  color: oklch(50% 0.2 25);
  background-color: color-mix(in srgb, oklch(50% 0.2 25) 8%, transparent);
}
</style>
