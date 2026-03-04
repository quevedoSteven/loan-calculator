import { getRequestConfig } from "next-intl/server"

export const locales = ["en", "es"] as const
export type Locale = (typeof locales)[number]

export default getRequestConfig(async (request) => {
  const locale = request.locale
  
  const validLocale = locales.includes(locale as Locale) 
    ? (locale as Locale) 
    : "en"
  
  const messages = (await import(`./src/i18n/messages/${validLocale}.json`)).default
  
  return {
    locale: validLocale,
    messages
  }
})