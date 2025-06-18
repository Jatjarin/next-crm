import { type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  // ฟังก์ชันนี้จะทำการอัปเดต session ของผู้ใช้ให้เป็นปัจจุบัน
  const { response, user } = await updateSession(request)

  const url = request.nextUrl.clone()

  // ถ้ายังไม่ล็อกอิน และพยายามเข้าหน้าที่ไม่ใช่หน้า Login
  if (!user && url.pathname !== "/login") {
    // ให้ redirect ไปยังหน้า Login
    url.pathname = "/login"
    return Response.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /auth (สำหรับ callback ของ Supabase)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
