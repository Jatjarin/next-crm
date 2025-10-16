/**
 * Supabase Browser Client / Supabase Client สำหรับเบราว์เซอร์
 *
 * This file provides a Supabase client for use in browser/client-side code
 * ไฟล์นี้จัดเตรียม Supabase client สำหรับใช้งานในโค้ดฝั่งเบราว์เซอร์/ไคลเอนต์
 */

import { createBrowserClient } from "@supabase/ssr"

/**
 * Creates a Supabase client for browser/client-side usage
 * สร้าง Supabase client สำหรับใช้งานฝั่งเบราว์เซอร์/ไคลเอนต์
 *
 * Purpose / จุดประสงค์:
 * - Initialize Supabase client for client-side operations
 *   เริ่มต้น Supabase client สำหรับการทำงานฝั่งไคลเอนต์
 * - Handle authentication and data operations in the browser
 *   จัดการการยืนยันตัวตนและการทำงานกับข้อมูลในเบราว์เซอร์
 * - Automatically manages cookies for session handling
 *   จัดการคุกกี้อัตโนมัติสำหรับการจัดการเซสชัน
 *
 * How to use / วิธีใช้งาน:
 * ```tsx
 * import { createClient } from '@/lib/supabase/client'
 *
 * // In a React component or client-side code
 * // ในคอมโพเนนต์ React หรือโค้ดฝั่งไคลเอนต์
 * const supabase = createClient()
 *
 * // Fetch data / ดึงข้อมูล
 * const { data, error } = await supabase
 *   .from('customers')
 *   .select('*')
 *
 * // Insert data / เพิ่มข้อมูล
 * const { data, error } = await supabase
 *   .from('customers')
 *   .insert({ name: 'John' })
 * ```
 *
 * Environment Variables Required / ตัวแปรสภาพแวดล้อมที่จำเป็น:
 * - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
 *                              URL ของโปรเจกต์ Supabase ของคุณ
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anonymous key
 *                                   คีย์ anonymous ของ Supabase ของคุณ
 *
 * @returns Supabase browser client instance / อินสแตนซ์ของ Supabase browser client
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
