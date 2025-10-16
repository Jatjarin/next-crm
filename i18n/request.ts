/**
 * Internationalization (i18n) Request Configuration / การกำหนดค่าคำขอสำหรับการจัดการหลายภาษา
 *
 * This file configures locale detection and message loading for next-intl
 * ไฟล์นี้กำหนดค่าการตรวจจับภาษาและการโหลดข้อความสำหรับ next-intl
 */

import { getRequestConfig } from "next-intl/server"
import { cookies } from "next/headers"

/**
 * Configures internationalization settings for each request
 * กำหนดค่าการตั้งค่าหลายภาษาสำหรับแต่ละคำขอ
 *
 * Purpose / จุดประสงค์:
 * - Detect user's preferred language from cookies
 *   ตรวจจับภาษาที่ผู้ใช้ต้องการจากคุกกี้
 * - Load appropriate translation messages
 *   โหลดข้อความแปลที่เหมาะสม
 * - Support multiple languages (Thai and English)
 *   รองรับหลายภาษา (ไทยและอังกฤษ)
 * - Provide default language fallback
 *   จัดเตรียมภาษาเริ่มต้นสำหรับสำรอง
 *
 * How it works / วิธีการทำงาน:
 * 1. Reads locale preference from "NEXT_LOCALE" cookie
 *    อ่านการตั้งค่าภาษาจากคุกกี้ "NEXT_LOCALE"
 * 2. Falls back to Thai ("th") if no cookie is set
 *    ใช้ภาษาไทย ("th") หากไม่มีการตั้งค่าคุกกี้
 * 3. Dynamically imports translation messages from messages folder
 *    นำเข้าข้อความแปลแบบไดนามิกจากโฟลเดอร์ messages
 * 4. Returns configuration object for next-intl
 *    คืนค่าอ็อบเจ็กต์การกำหนดค่าสำหรับ next-intl
 *
 * Supported Languages / ภาษาที่รองรับ:
 * - "th" - Thai (default) / ภาษาไทย (ค่าเริ่มต้น)
 * - "en" - English / ภาษาอังกฤษ
 *
 * Translation Files Location / ที่อยู่ไฟล์แปล:
 * - messages/th.json - Thai translations / แปลภาษาไทย
 * - messages/en.json - English translations / แปลภาษาอังกฤษ
 *
 * How to change language / วิธีเปลี่ยนภาษา:
 * ```tsx
 * // Set locale cookie / ตั้งค่าคุกกี้ภาษา
 * document.cookie = 'NEXT_LOCALE=en; path=/'
 *
 * // Or use server action / หรือใช้ server action
 * import { cookies } from 'next/headers'
 *
 * async function setLocale(locale: string) {
 *   const cookieStore = await cookies()
 *   cookieStore.set('NEXT_LOCALE', locale)
 * }
 * ```
 *
 * @returns Configuration object with locale and messages
 *          อ็อบเจ็กต์การกำหนดค่าพร้อมภาษาและข้อความ
 */
export default getRequestConfig(async () => {
  // Read locale from cookie, fallback to Thai if not set
  // อ่านภาษาจากคุกกี้ ใช้ภาษาไทยหากไม่มีการตั้งค่า
  const cookieLocale = (await cookies()).get("NEXT_LOCALE")?.value || "th"
  const locale = cookieLocale

  // Alternative: Force specific locale / ทางเลือก: บังคับใช้ภาษาเฉพาะ
  //const locale = "en"

  return {
    locale, // Current language code / รหัสภาษาปัจจุบัน
    messages: (await import(`../messages/${locale}.json`)).default, // Translation messages / ข้อความแปล
  }
})
