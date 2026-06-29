<script setup lang="ts">
import { h, defineComponent } from 'vue';
import VGrid, {
  BasePlugin,
  VGridVueEditor,
  VGridVueTemplate,
  type PluginProviders,
} from '@revolist/vue3-datagrid';
import GridTextEditor from './GridTextEditor.vue';
import GridNumberEditor from './GridNumberEditor.vue';
import GridUnitEditor from './GridUnitEditor.vue';
import GridSelectEditor from './GridSelectEditor.vue';
import GridColorPickerEditor from './GridColorPickerEditor.vue';
import GridUnitCell from './GridUnitCell.vue';
import GridColorCell from './GridColorCell.vue';
import GridSelectCell from './GridSelectCell.vue';
import GridTextureSelectEditor from './GridTextureSelectEditor.vue';
import GridTextureSelectCell from './GridTextureSelectCell.vue';
import GridFormattedCell from './GridFormattedCell.vue';
import { columnStretchPlugin } from './columnStretchPlugin';
import GridDeleteCell from './GridDeleteCell.vue';
import GridCheckboxCell from './GridCheckboxCell.vue';
import GridSelectButtonCell from './GridSelectButtonCell.vue';
import type {
  AfterEditEvent,
  BeforeSaveDataDetails,
  ColumnProp,
  ColumnRegular,
  Editors,
  FocusAfterRenderEvent,
} from '@revolist/revogrid';

// ─── Public column-definition interface ──────────────────────────────────────
// Consumers import this type to declare columns for any well feature array.

type WellGridColumnBase = {
  /** Object key on the row model */
  prop: string;
  /** Pre-translated header label */
  label: string;
  /** Column width in px (default 150) */
  size?: number;
  /** Prevent editing */
  readonly?: boolean;
  /** Override the RevoGrid editor key */
  editor?: string;
  /** Unit-aware column — auto-converts to/from canonical units (m ↔ ft, mm ↔ inches) */
  unitType?: 'length' | 'diameter';
  /** Display-only formatter — bypasses the editor */
  formatter?: (value: unknown, row: Record<string, unknown>) => string;
  pin?: 'colPinStart' | 'colPinEnd';
  /** Stretch this column to absorb all remaining grid width */
  stretch?: boolean;
  /** Minimum width (px) for a stretch column (default 50) */
  minSize?: number;
};

export type WellGridColumn =
  | (WellGridColumnBase & { type?: 'text' | 'number' | 'color' | 'checkbox' })
  | (WellGridColumnBase & {
      type: 'select';
      options: Array<{ label: string; value: string }>;
    })
  | (WellGridColumnBase & {
      type: 'select-button';
      options: Array<{ label: string; value: string }>;
    })
  | (WellGridColumnBase & { type: 'texture' });

// ─── Props / Emits ────────────────────────────────────────────────────────────

const props = defineProps<{
  /** Reactive array from the store (via deep-proxy or plain copy). */
  rows: Record<string, unknown>[];
  columns: WellGridColumn[];
  /** Label for the add-row button */
  addLabel?: string;
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

const uiStore = useUiStore();

// ─── Editor registry ──────────────────────────────────────────────────────────

function unitEditorFactory(unitType: 'length' | 'diameter') {
  return defineComponent({
    props: ['val', 'save', 'close'],
    setup: (p: any) => () => h(GridUnitEditor, { ...p, unitType }),
  });
}

function selectEditorFactory(options: Array<{ label: string; value: string }>) {
  return defineComponent({
    props: ['val', 'save', 'close'],
    setup: (p: any) => () => h(GridSelectEditor, { ...p, options }),
  });
}

function textureEditorFactory() {
  return defineComponent({
    props: ['val', 'save', 'close'],
    setup: (p: any) => () => h(GridTextureSelectEditor, p),
  });
}

const gridEditors = computed(() => {
  const editors: Editors = {
    noop: VGridVueEditor(
      defineComponent({
        props: ['val', 'save', 'close'],
        setup: (p: any) => {
          p.close();
          return () => null;
        },
      }),
    ),
    text: VGridVueEditor(GridTextEditor),
    number: VGridVueEditor(GridNumberEditor),
    color: VGridVueEditor(GridColorPickerEditor),
    length: VGridVueEditor(unitEditorFactory('length')),
    diameter: VGridVueEditor(unitEditorFactory('diameter')),
    texture: VGridVueEditor(textureEditorFactory()),
  };
  for (const col of props.columns) {
    if (col.type === 'select') {
      editors[`select_${col.prop}`] = VGridVueEditor(
        selectEditorFactory(col.options),
      );
    }
  }
  return editors;
});

const stretchCol = computed(() => props.columns.find(c => c.stretch) ?? null);
const stretchProp = computed(() => stretchCol.value?.prop ?? null);

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
    list.push(
      columnStretchPlugin(stretchProp.value, stretchCol.value?.minSize),
    );
  }
  return list;
});
// ─── Column kinds ──────────────────────────────────────────────────────────
// Declares how each column "kind" renders and edits, mirroring `gridEditors`.
// `resolveColumnKind` decides which kind a column declaration maps to.

type ColumnKind =
  | 'text'
  | 'number'
  | 'length'
  | 'diameter'
  | 'color'
  | 'select'
  | 'select-button'
  | 'formatted'
  | 'checkbox'
  | 'texture';

interface ColumnKindDef {
  editor?: (col: WellGridColumn) => string;
  numeric?: boolean;
  readonly?: boolean;
  cellProperties?: (col: WellGridColumn) => ColumnRegular['cellProperties'];
  cellTemplate?: (col: WellGridColumn) => ColumnRegular['cellTemplate'];
}

const columnKinds: Record<ColumnKind, ColumnKindDef> = {
  text: {},
  number: { numeric: true },
  length: {
    editor: () => 'length',
    numeric: true,
    cellTemplate: () => VGridVueTemplate(GridUnitCell, { unitType: 'length' }),
  },
  diameter: {
    editor: () => 'diameter',
    numeric: true,
    cellTemplate: () =>
      VGridVueTemplate(GridUnitCell, { unitType: 'diameter' }),
  },
  color: {
    editor: () => 'color',
    cellTemplate: () => VGridVueTemplate(GridColorCell),
  },
  select: {
    editor: col => `select_${col.prop}`,
    cellTemplate: col =>
      VGridVueTemplate(GridSelectCell, {
        options: (col as Extract<WellGridColumn, { type: 'select' }>).options,
      }),
  },
  formatted: {
    cellTemplate: col =>
      VGridVueTemplate(GridFormattedCell, { formatter: col.formatter }),
  },
  checkbox: {
    editor: () => 'noop',
    cellProperties: () => () => ({ class: 'well-grid-checkbox-cell' }),
    cellTemplate: col =>
      VGridVueTemplate(GridCheckboxCell, {
        prop: col.prop,
        onToggle: (rowIndex: number, prop: string, value: boolean) =>
          emit('change', rowIndex, prop, value),
      }),
  },
  'select-button': {
    editor: () => 'noop',
    cellProperties: () => () => ({ class: 'well-grid-checkbox-cell' }),
    cellTemplate: col =>
      VGridVueTemplate(GridSelectButtonCell, {
        prop: col.prop,
        options: (col as Extract<WellGridColumn, { type: 'select-button' }>)
          .options,
        onChange: (rowIndex: number, prop: string, value: unknown) =>
          emit('change', rowIndex, prop, value),
      }),
  },
  texture: {
    editor: () => 'texture',
    cellTemplate: () => VGridVueTemplate(GridTextureSelectCell),
  },
};

function resolveColumnKind(col: WellGridColumn): ColumnKind {
  if (col.type === 'texture') return 'texture';
  if (col.type === 'select') return 'select';
  if (col.type === 'select-button') return 'select-button';
  if (col.type === 'color') return 'color';
  if (col.type === 'checkbox') return 'checkbox';
  if (col.unitType) return col.unitType;
  if (col.formatter) return 'formatted';
  return col.type === 'number' ? 'number' : 'text';
}

const unitLabels: Record<'length' | 'diameter', () => string> = {
  length: () => uiStore.lengthUnit,
  diameter: () => uiStore.diameterUnit,
};

// ─── Column definitions ───────────────────────────────────────────────────────

const revoColumns = computed<ColumnRegular[]>(() => {
  const onDelete = (rowIndex: number) => emit('delete', rowIndex);

  const dataCols: ColumnRegular[] = props.columns.map(col => {
    const kind = columnKinds[resolveColumnKind(col)];
    const unit = col.unitType ? unitLabels[col.unitType]() : null;
    const readonly = col.readonly ?? kind.readonly ?? false;

    return {
      prop: col.prop,
      name: unit ? `${col.label} (${unit})` : col.label,
      autoSize: !col.size && !col.stretch,
      size: col.size,
      readonly,
      editor: readonly
        ? undefined
        : (kind.editor?.(col) ??
          col.editor ??
          (col.type === 'number' ? 'number' : 'text')),
      pin: col.pin,
      cellProperties:
        kind.cellProperties?.(col) ??
        (kind.numeric ? () => ({ class: 'num' }) : undefined),
      cellTemplate: kind.cellTemplate?.(col),
    };
  });

  const deleteCol: ColumnRegular = {
    prop: '_delete',
    name: '',
    size: 40,
    readonly: true,
    pin: 'colPinEnd',
    cellProperties: () => ({ class: 'well-grid-delete-cell' }),
    cellTemplate: VGridVueTemplate(GridDeleteCell, {
      requestDelete: onDelete,
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

function coerceCellValue(prop: string, val: unknown): unknown {
  const col = props.columns.find(c => c.prop === prop);
  if (col?.type === 'checkbox' && typeof val === 'string') {
    return val === 'true' || val === '1' || val.toLowerCase() === 'yes';
  }
  return val;
}

function handleAfterEdit(event: CustomEvent<AfterEditEvent>) {
  const detail = event.detail as Record<string, unknown>;

  // Single-cell edit: detail has rowIndex + prop + val
  if ('rowIndex' in detail) {
    const { rowIndex, prop, val } = detail as unknown as BeforeSaveDataDetails;
    emit('change', rowIndex, String(prop), coerceCellValue(String(prop), val));
    return;
  }

  // Block edit (paste, range clear, etc.): detail has data keyed by row index
  const blockData = detail.data as
    | Record<string, Record<string, unknown>>
    | undefined;
  if (!blockData) return;

  for (const [rowKey, rowData] of Object.entries(blockData)) {
    const rowIndex = Number(rowKey);
    for (const [prop, val] of Object.entries(rowData)) {
      emit('change', rowIndex, prop, coerceCellValue(prop, val));
    }
  }
}

function handleRowOrderChanged(
  event: CustomEvent<{ from: number; to: number }>,
) {
  console.log('Row order changed:', event.detail);
  emit('reorder', event.detail.from, event.detail.to);
}

// ─── Click-on-focused-cell → enter edit mode ───────────────────────────────
// `afterfocus` only fires when focus moves to a new cell. A click that
// triggers such a focus change is suppressed; a second click on the cell
// that's already focused enters edit mode for it.

const gridContainerRef = ref<HTMLElement | null>(null);
const focusedCell = ref<{
  rowIndex: number;
  colIndex: number;
  prop: ColumnProp;
} | null>(null);
let suppressNextClick = false;

function handleAfterFocus(event: CustomEvent<FocusAfterRenderEvent>) {
  const { rowIndex, colIndex, column } = event.detail;
  focusedCell.value = column ? { rowIndex, colIndex, prop: column.prop } : null;
  suppressNextClick = true;
}

function handleGridMousedown() {
  suppressNextClick = false;
}

function handleGridClick(event: MouseEvent) {
  if (suppressNextClick) {
    suppressNextClick = false;
    return;
  }
  const cell = focusedCell.value;
  if (!cell) return;

  const target = (event.target as HTMLElement).closest<HTMLElement>(
    '[data-rgrow][data-rgcol]',
  );
  if (!target) return;
  if (
    Number(target.dataset.rgrow) !== cell.rowIndex ||
    Number(target.dataset.rgcol) !== cell.colIndex
  ) {
    return;
  }

  const col = props.columns.find(c => c.prop === cell.prop);
  if (!col || col.readonly) return;

  const gridEl = gridContainerRef.value?.querySelector('revo-grid') as
    | HTMLRevoGridElement
    | undefined;
  gridEl?.setCellEdit(cell.rowIndex, cell.prop);
}
</script>

<template>
  <div class="well-data-grid-wrapper flex flex-col">
    <div
      v-show="rows.length > 0"
      ref="gridContainerRef"
      class="well-grid-container"
      @mousedown.capture="handleGridMousedown"
      @click="handleGridClick"
    >
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
          @afterfocus="handleAfterFocus"
          @roworderchanged="handleRowOrderChanged"
        />

        <template #fallback>
          <div
            class="well-grid-skeleton animate-pulse rounded bg-surface-100 w-full h-full"
          />
        </template>
      </ClientOnly>
    </div>

    <Button
      unstyled
      class="well-grid-add-btn"
      type="button"
      @click="emit('add')"
      :label="addLabel ?? 'Add row'"
    >
      <template #icon>
        <Icon name="ph:plus" />
      </template>
    </Button>
  </div>
</template>

<style scoped>
.well-data-grid-wrapper {
  --accent-soft: color-mix(in srgb, var(--color-primary-500) 12%, transparent);
  --color-primary-soft: color-mix(
    in srgb,
    var(--color-primary-500) 25%,
    transparent
  );
}

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
  --revo-grid-background: var(--color-surface-0);
  --revo-grid-foreground: var(--color-content-0);
  --revo-grid-text: var(--color-content-0);
  --revo-grid-divider: var(--color-surface-200);
  --revo-grid-border: var(--color-surface-200);
  --revo-grid-header-bg: var(--color-surface-50);
  --revo-grid-header-color: var(--color-content-500);
  --revo-grid-header-border: var(--color-surface-200);
  --revo-grid-cell-border: var(--color-surface-200);
  --revo-grid-focused-bg: var(--accent-soft);
  --revo-grid-row-hover: var(--accent-soft);
  --revo-grid-row-headers-bg: var(--color-surface-50);
  --revo-grid-row-headers-color: var(--color-content-500);
  --revo-grid-cell-disabled-bg: var(--color-surface-100);
  --revo-grid-primary: var(--color-primary-500);
  --revo-grid-primary-transparent: var(--color-primary-soft);
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

/* Row states — --accent-soft is tuned for legibility in both light and dark */
revo-grid .rgRow:hover .rgCell {
  background: var(--accent-soft);
}

revo-grid .rgRow.focused-rgRow .rgCell,
revo-grid .rgRow[selected] .rgCell {
  background: var(--accent-soft);
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

/* Checkbox columns — readonly for RevoGrid, but interactive via the cell
   template, so suppress the default "disabled" overlay. */
revo-grid .rgCell.disabled.well-grid-checkbox-cell {
  background-color: transparent;
  --revo-grid-cell-disabled-bg: transparent;
}

revo-grid .rgRow:hover .rgCell.disabled.well-grid-checkbox-cell {
  background-color: var(--accent-soft);
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
  box-shadow: inset 0 0 0 1.5px var(--color-focus-ring) !important;
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
  color: var(--color-content-0);
  background-color: currentColor;
  mask-image: url('/drag-handle.svg');
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
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

/* ── PrimeVue Select editor (enum columns) ───────────────────────────────── */

revogr-edit .well-cell-select.p-select {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 0;
  background: var(--color-surface-0);
  box-shadow: inset 0 0 0 1.5px var(--color-focus-ring);
  font-family: var(--font-mono);
  font-size: 11px;
}

revogr-edit .well-cell-select .p-select-label {
  padding: 0 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-content-0);
}

revogr-edit .well-cell-select .p-select-dropdown {
  width: 24px;
  color: var(--color-content-500);
}

revogr-edit .well-cell-texture-select .p-select-label {
  padding: 0 4px;
}

/* ── Color editor trigger ─────────────────────────────────────────────────── */

revogr-edit .well-cell-color-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  height: 100%;
  padding: 0 8px;
  box-shadow: inset 0 0 0 1.5px var(--color-focus-ring);
  background: var(--color-surface-0);
}

.well-cell-color-swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  border-radius: 3px;
  border: 1px solid var(--color-surface-300);
}

.well-cell-color-hex {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-content-0);
}

/* ── Add-row button ──────────────────────────────────────────────────────── */

.well-grid-add-btn {
  align-self: flex-start;
  margin-top: 10px;
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

.well-grid-add-btn:hover {
  background: var(--color-surface-100);
  color: var(--color-content-0);
  border-color: var(--color-content-0);
}

.well-grid-add-btn:active {
  transform: translateY(0.5px);
}

.well-grid-add-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--color-primary-soft);
  border-color: var(--color-primary-500);
}
</style>
