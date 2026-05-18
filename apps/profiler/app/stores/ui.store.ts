import { defineStore } from 'pinia'
import type { LengthUnits, DiameterUnits } from '@welldot/core'

export type CoordinateFormat = 'DD' | 'DMS'

export const useUiStore = defineStore(
  'ui',
  () => {
    const lengthUnit = ref<LengthUnits>('m')
    const diameterUnit = ref<DiameterUnits>('mm')
    const coordinateFormat = ref<CoordinateFormat>('DD')

    return { lengthUnit, diameterUnit, coordinateFormat }
  },
  {
    persist: { key: 'welldot_ui' },
  },
)
