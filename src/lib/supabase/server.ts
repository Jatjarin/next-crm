import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// ฟังก์ชันนี้จำเป็นต้องเป็น async เพื่อรอข้อมูลจาก cookies()
export async function createClient() {
  // เราจำเป็นต้อง await cookies() เพื่อให้ได้ cookie store มาใช้งาน
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            // Ensure cookies work in production with proper settings
            cookieStore.set({
              name,
              value,
              ...options,
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
              path: "/",
            });
          } catch (error) {
            console.error("Error setting cookie:", error);
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({
              name,
              value: "",
              ...options,
              maxAge: 0,
              path: "/",
            });
          } catch (error) {
            console.error("Error removing cookie:", error);
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
}
