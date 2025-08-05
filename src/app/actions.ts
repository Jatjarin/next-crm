"use server"

import { createClient } from "@/lib/supabase/server"
//import { Cookie } from "next/font/google"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

/**
 * Sets a cookie to change the application's locale and reloads the page.
 * @param locale The new locale to set (e.g., 'en', 'th', 'ru').
 * @param path The current path to redirect back to.
 */
export async function switchLocale(locale: string, path: string) {
  // This function correctly gets a mutable cookie store in a Server Action.
  //cookies().set("NEXT_LOCALE", locale)
  //const cookie = new Cookie("NEXT_LOCALE", locale);
  const cookie = await cookies()
  cookie.set("NEXT_LOCALE", locale, { maxAge: 3153600 })
  //cookie.set({ maxAge: 3153600});
  redirect(path)
}
//console.log("COOKIES ACTION", locales )

/**
 * Signs the user out from Supabase and redirects to the login page.
 */
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect("/login")
}
