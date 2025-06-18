import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  // เรียกใช้ cookies() เพียงครั้งเดียวที่นี่ เพื่อเก็บค่าไว้ในตัวแปร
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // จากนั้นให้นำตัวแปร cookieStore มาใช้ในฟังก์ชัน get, set, remove
        // โค้ดส่วนนี้จะใช้ cookieStore.get() ไม่ใช่ cookies().get()
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
