import { getRequestConfig } from "next-intl/server"
import { cookies } from "next/headers"

export default getRequestConfig(async () => {
  // Provide a static locale, fetch a user setting,
  // read from `cookies()`, `headers()`, etc.
  const cookieLocale = (await cookies()).get("NEXT_LOCALE")?.value || "th"
  const locale = cookieLocale
  //const locale = "en"

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
