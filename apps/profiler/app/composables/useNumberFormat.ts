import { formatNumber, type FormatNumberOptions } from '~/utils/formatNumber'

export const LOCALE_MAP: Record<string, string> = { en: 'en-US', pt: 'pt-BR' }

export function useNumberFormat() {
  const { locale } = useI18n()
  const resolvedLocale = computed(() => LOCALE_MAP[locale.value] ?? locale.value)

  function format(
    value: number | null | undefined,
    options?: Omit<FormatNumberOptions, 'locale'>,
  ): string {
    return formatNumber(value, { ...options, locale: resolvedLocale.value })
  }

  return { formatNumber: format, resolvedLocale }
}
