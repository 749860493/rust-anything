export const LOCALES = [
  { code: 'en', flag: '🇬🇧', name: 'English', lang: 'en' },
  { code: 'tr', flag: '🇹🇷', name: 'Türkçe', lang: 'tr' },
  { code: 'uk', flag: '🇺🇦', name: 'Українська', lang: 'uk' },
  { code: 'zh', flag: '🇨🇳', name: '简体中文', lang: 'zh-Hans' },
  { code: 'zh-tw', flag: '🇹🇼', name: '繁體中文', lang: 'zh-Hant' },
  { code: 'de', flag: '🇩🇪', name: 'Deutsch', lang: 'de' },
  { code: 'fr', flag: '🇫🇷', name: 'Français', lang: 'fr' },
  { code: 'ru', flag: '🇷🇺', name: 'Русский', lang: 'ru' },
  { code: 'ja', flag: '🇯🇵', name: '日本語', lang: 'ja' },
  { code: 'ko', flag: '🇰🇷', name: '한국어', lang: 'ko' },
  { code: 'az', flag: '🇦🇿', name: 'Azərbaycanca', lang: 'az' },
  { code: 'uz', flag: '🇺🇿', name: 'Oʻzbekcha', lang: 'uz' },
  { code: 'kk', flag: '🇰🇿', name: 'Қазақша', lang: 'kk' },
  { code: 'ky', flag: '🇰🇬', name: 'Кыргызча', lang: 'ky' },
  { code: 'tk', flag: '🇹🇲', name: 'Türkmençe', lang: 'tk' },
  { code: 'tt', flag: '🌐', name: 'Татарча', lang: 'tt' },
  { code: 'ug', flag: '🌐', name: 'ئۇيغۇرچە', lang: 'ug', rtl: true },
  { code: 'pt', flag: '🇵🇹', name: 'Português', lang: 'pt' },
  { code: 'ar', flag: '🇸🇦', name: 'العربية', lang: 'ar', rtl: true },
  { code: 'fa', flag: '🇮🇷', name: 'فارسی', lang: 'fa', rtl: true },
  { code: 'vi', flag: '🇻🇳', name: 'Tiếng Việt', lang: 'vi' },
  { code: 'hi', flag: '🇮🇳', name: 'हिन्दी', lang: 'hi' },
  { code: 'es', flag: '🇪🇸', name: 'Español', lang: 'es' },
  { code: 'it', flag: '🇮🇹', name: 'Italiano', lang: 'it' },
  { code: 'id', flag: '🇮🇩', name: 'Bahasa Indonesia', lang: 'id' },
] as const

export type Locale = (typeof LOCALES)[number]['code']
export const DEFAULT_LOCALE: Locale = 'en'
const CODES = new Set<string>(LOCALES.map((l) => l.code))

export function localeOf(path: string): Locale {
  const first = path.split('/')[1] ?? ''
  return (CODES.has(first) && first !== DEFAULT_LOCALE ? first : DEFAULT_LOCALE) as Locale
}

export function stripLocale(path: string): string {
  const loc = localeOf(path)
  if (loc === DEFAULT_LOCALE) return path
  const rest = path.slice(loc.length + 1)
  return rest === '' ? '/' : rest
}

declare const __TRANSLATED_DOCS__: string[]
const TRANSLATED = new Set<string>(typeof __TRANSLATED_DOCS__ === 'undefined' ? [] : __TRANSLATED_DOCS__)

export function withLocale(path: string, locale: string): string {
  if (locale === DEFAULT_LOCALE || !path.startsWith('/')) return path
  if (path.startsWith('/docs/') && TRANSLATED.size > 0 && !TRANSLATED.has(`/${locale}${path}`)) return path
  return path === '/' ? `/${locale}` : `/${locale}${path}`
}

export function localeInfo(locale: string) {
  return LOCALES.find((l) => l.code === locale) ?? LOCALES[0]
}

export function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m)
}
