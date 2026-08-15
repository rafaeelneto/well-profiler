export function useHydrodynamicEventTypes() {
  const { t } = useI18n();

  const typeOptions = computed(() => [
    {
      value: 'spot_measurement',
      label: t('editor.hidrodinamica.eventTypes.spot_measurement'),
      icon: 'ph:drop-duotone',
    },
    {
      value: 'constant_rate',
      label: t('editor.hidrodinamica.eventTypes.constant_rate'),
      icon: 'ph:clock-duotone',
    },
    {
      value: 'step_drawdown',
      label: t('editor.hidrodinamica.eventTypes.step_drawdown'),
      icon: 'ph:chart-bar-duotone',
    },
    {
      value: 'airlift',
      label: t('editor.hidrodinamica.eventTypes.airlift'),
      icon: 'ph:fan-duotone',
    },
    {
      value: 'recovery_only',
      label: t('editor.hidrodinamica.eventTypes.recovery_only'),
      icon: 'ph:arrow-up-duotone',
    },
  ]);

  const measurementMethodOptions = computed(() => [
    {
      value: 'electric_probe',
      label: t('editor.hidrodinamica.measurementMethods.electric_probe'),
    },
    {
      value: 'pressure_transducer',
      label: t('editor.hidrodinamica.measurementMethods.pressure_transducer'),
    },
    {
      value: 'air_line',
      label: t('editor.hidrodinamica.measurementMethods.air_line'),
    },
    { value: 'tape', label: t('editor.hidrodinamica.measurementMethods.tape') },
  ]);

  function eventTypeLabel(type: string): string {
    return typeOptions.value.find(o => o.value === type)?.label ?? type;
  }

  function eventTypeSeverity(type: string): string {
    const map: Record<string, string> = {
      spot_measurement: 'info',
      constant_rate: 'primary',
      step_drawdown: 'secondary',
      airlift: 'warn',
      recovery_only: 'success',
    };
    return map[type] ?? 'secondary';
  }

  function measurementMethodLabel(method?: string): string {
    return (
      measurementMethodOptions.value.find(o => o.value === method)?.label ??
      method ??
      ''
    );
  }

  return {
    typeOptions,
    measurementMethodOptions,
    eventTypeLabel,
    eventTypeSeverity,
    measurementMethodLabel,
  };
}
