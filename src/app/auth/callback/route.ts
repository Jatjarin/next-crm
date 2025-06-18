// src/app/auth/callback/route.ts
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // ส่งผู้ใช้กลับไปหน้า Dashboard หลังจากล็อกอินสำเร็จ
  return NextResponse.redirect(`${origin}/customers`)
}
