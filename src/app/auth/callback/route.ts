// src/app/auth/callback/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Error exchanging code for session:", error);
        return NextResponse.redirect(
          `${origin}/login?message=Authentication failed`,
        );
      }
    } catch (error) {
      console.error("Unexpected error during authentication:", error);
      return NextResponse.redirect(
        `${origin}/login?message=Authentication error`,
      );
    }
  }

  // ส่งผู้ใช้กลับไปหน้า Dashboard หลังจากล็อกอินสำเร็จ
  return NextResponse.redirect(`${origin}/customers`);
}
