import {
  feetToMeters,
  inchesToMm,
  metersToFeet,
  mmToInches,
} from '@welldot/core';

export function useUnitDisplay(unitType: 'length' | 'diameter') {
  const uiStore = useUiStore();

  const unit = computed(() =>
    unitType === 'length' ? uiStore.lengthUnit : uiStore.diameterUnit,
  );

  function toDisplay(canonical: number): number {
    if (unitType === 'length') {
      return uiStore.lengthUnit === 'ft' ? metersToFeet(canonical) : canonical;
    }
    return uiStore.diameterUnit === 'inches'
      ? mmToInches(canonical)
      : canonical;
  }

  function toCanonical(display: number): number {
    if (unitType === 'length') {
      return uiStore.lengthUnit === 'ft' ? feetToMeters(display) : display;
    }
    return uiStore.diameterUnit === 'inches' ? inchesToMm(display) : display;
  }

  return { unit, toDisplay, toCanonical };
}
