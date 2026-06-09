<script setup lang="ts">
import { metersToFeet, feetToMeters, mmToInches, inchesToMm } from '@welldot/core'

const props = defineProps<{
  val?: unknown
  save: (value: any, preventFocus?: boolean) => void
  close: (focusNext?: boolean) => void
  unitType: 'length' | 'diameter'
}>()

const uiStore = useUiStore()

const displayUnit = computed(() =>
  props.unitType === 'length' ? uiStore.lengthUnit : uiStore.diameterUnit,
)

const suffix = computed(() => ` ${displayUnit.value}`)

function toDisplay(canonical: number): number {
  if (props.unitType === 'length') {
    return uiStore.lengthUnit === 'ft' ? metersToFeet(canonical) : canonical
  }
  return uiStore.diameterUnit === 'inches' ? mmToInches(canonical) : canonical
}

function toCanonical(display: number): number {
  if (props.unitType === 'length') {
    return uiStore.lengthUnit === 'ft' ? feetToMeters(display) : display
  }
  return uiStore.diameterUnit === 'inches' ? inchesToMm(display) : display
}

const numRef = ref<{ $el: HTMLElement } | null>(null)

const raw =
  props.val !== undefined && props.val !== null && props.val !== ''
    ? Number(props.val)
    : 0

const localValue = ref<number | null>(toDisplay(raw))

onMounted(() =>
  nextTick(() => {
    const el = numRef.value?.$el
    ;(el?.querySelector('input') as HTMLInputElement | null)?.focus()
  }),
)

function commit() {
  if (localValue.value === null) return
  props.save(toCanonical(localValue.value))
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.stopPropagation()
    commit()
  } else if (e.key === 'Escape') {
    e.stopPropagation()
    props.close()
  }
}

function update(value: number) {
  localValue.value = value
  commit()
}
</script>

<template>
  <InputNumber
    ref="numRef"
    :model-value="localValue"
    @update:model-value="update"
    :max-fraction-digits="4"
    :suffix="suffix"
    :pt="{
      root: 'well-cell-input-number',
      pcInput: { root: 'well-cell-input well-cell-input-number text-right' },
    }"
    @keydown="onKeydown"
  />
</template>
