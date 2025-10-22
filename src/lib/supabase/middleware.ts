/**
 * Supabase Middleware / Middleware สำหรับ Supabase
 *
 * This file handles session management in Next.js middleware
 * ไฟล์นี้จัดการเซสชันใน Next.js middleware
 */

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Updates and manages user session in Next.js middleware
 * อัพเดทและจัดการเซสชันผู้ใช้ใน Next.js middleware
 *
 * Purpose / จุดประสงค์:
 * - Refresh user authentication session on each request
 *   รีเฟรชเซสชันการยืนยันตัวตนของผู้ใช้ในทุกคำขอ
 * - Update authentication cookies automatically
 *   อัพเดทคุกกี้การยืนยันตัวตนอัตโนมัติ
 * - Provide user information for route protection
 *   จัดเตรียมข้อมูลผู้ใช้สำหรับการป้องกันเส้นทาง
 * - Handle cookie operations in middleware context
 *   จัดการการทำงานของคุกกี้ในบริบทของ middleware
 *
 * How to use / วิธีใช้งาน:
 * ```tsx
 * // In middleware.ts / ใน middleware.ts
 * import { updateSession } from '@/lib/supabase/middleware'
 *
 * export async function middleware(request: NextRequest) {
 *   const { response, user } = await updateSession(request)
 *
 *   // Check if user is authenticated / ตรวจสอบว่าผู้ใช้ยืนยันตัวตนหรือไม่
 *   if (!user) {
 *     return NextResponse.redirect(new URL('/login', request.url))
 *   }
 *
 *   return response
 * }
 * ```
 *
 * Cookie Operations / การทำงานของคุกกี้:
 * - get: Retrieve cookie value from request
 *        ดึงค่าคุกกี้จากคำขอ
 * - set: Set cookie in both request and response
 *        ตั้งค่าคุกกี้ทั้งในคำขอและการตอบกลับ
 * - remove: Clear cookie from request and response
 *           ล้างคุกกี้จากคำขอและการตอบกลับ
 *
 * @param request - Next.js request object / อ็อบเจ็กต์คำขอของ Next.js
 * @returns Object containing response and user data
 *          อ็อบเจ็กต์ที่ประกอบด้วยการตอบกลับและข้อมูลผู้ใช้
 * @returns response - NextResponse object to return / อ็อบเจ็กต์ NextResponse ที่จะคืนค่า
 * @returns user - Current authenticated user or null / ผู้ใช้ที่ยืนยันตัวตนปัจจุบันหรือ null
 */
export async function updateSession(request: NextRequest) {
  // Create initial response / สร้างการตอบกลับเริ่มต้น
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Initialize Supabase server client / เริ่มต้น Supabase server client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Get cookie from request / ดึงคุกกี้จากคำขอ
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        // Set cookie in request and response / ตั้งค่าคุกกี้ในคำขอและการตอบกลับ
        set(name: string, value: string, options: CookieOptions) {
          // Ensure cookies work properly in production
          const cookieOptions = {
            ...options,
            sameSite: "lax" as const,
            secure: process.env.NODE_ENV === "production",
            path: "/",
          };
          request.cookies.set({ name, value, ...cookieOptions });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...cookieOptions });
        },
        // Remove cookie from request and response / ลบคุกกี้จากคำขอและการตอบกลับ
        remove(name: string, options: CookieOptions) {
          const cookieOptions = {
            ...options,
            maxAge: 0,
            path: "/",
          };
          request.cookies.set({ name, value: "", ...cookieOptions });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: "", ...cookieOptions });
        },
      },
    },
  );

  // Retrieve current authenticated user / ดึงข้อมูลผู้ใช้ที่ยืนยันตัวตนปัจจุบัน
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
