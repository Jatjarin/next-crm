/**
 * Next.js Configuration File / ไฟล์การกำหนดค่า Next.js
 *
 * This file contains all configuration settings for the Next.js application
 * ไฟล์นี้ประกอบด้วยการตั้งค่าทั้งหมดสำหรับแอปพลิเคชัน Next.js
 */

/* eslint-disable @typescript-eslint/no-require-imports */
import type { NextConfig } from "next";
//import createNextIntlPlugin from "next-intl/plugin"
const createNextIntlPlugin = require("next-intl/plugin");

/**
 * Next.js Configuration Object / อ็อบเจ็กต์การกำหนดค่า Next.js
 *
 * Important Configuration Settings / การตั้งค่าที่สำคัญ:
 */
const nextConfig: NextConfig = {
  /**
   * Output Mode / โหมดการส่งออก
   *
   * Purpose / จุดประสงค์:
   * - "standalone" enables building a standalone version of the app
   *   "standalone" เปิดใช้งานการสร้างแอปแบบ standalone
   * - Optimized for Docker and containerized deployments
   *   ปรับให้เหมาะสมสำหรับ Docker และการ deploy แบบ containerized
   * - Includes only necessary files for production
   *   รวมเฉพาะไฟล์ที่จำเป็นสำหรับ production
   * - Reduces deployment size and complexity
   *   ลดขนาดและความซับซ้อนของการ deploy
   */
  output: "standalone",

  /**
   * ESLint Configuration / การกำหนดค่า ESLint
   *
   * Purpose / จุดประสงค์:
   * - Disable ESLint during production builds
   *   ปิด ESLint ระหว่างการ build สำหรับ production
   * - Allows build to succeed even with linting errors
   *   อนุญาตให้ build สำเร็จแม้มี linting errors
   */
  eslint: {
    ignoreDuringBuilds: true,
  },

  /**
   * TypeScript Configuration / การกำหนดค่า TypeScript
   *
   * Purpose / จุดประสงค์:
   * - Disable TypeScript type checking during builds
   *   ปิดการตรวจสอบ type ระหว่างการ build
   */
  typescript: {
    ignoreBuildErrors: true,
  },

  /**
   * Image Configuration / การกำหนดค่ารูปภาพ
   *
   * Purpose / จุดประสงค์:
   * - Configure allowed external image sources
   *   กำหนดค่าแหล่งรูปภาพภายนอกที่อนุญาต
   * - Enable Next.js Image Optimization for remote images
   *   เปิดใช้งาน Image Optimization ของ Next.js สำหรับรูปภาพระยะไกล
   * - Secure image loading from trusted sources
   *   โหลดรูปภาพอย่างปลอดภัยจากแหล่งที่เชื่อถือได้
   */
  images: {
    /**
     * Remote Patterns / รูปแบบแหล่งข้อมูลระยะไกล
     *
     * Configuration for Supabase Storage / การกำหนดค่าสำหรับ Supabase Storage:
     * - Allows loading images from Supabase Storage
     *   อนุญาตให้โหลดรูปภาพจาก Supabase Storage
     * - Enables Next.js Image component optimization
     *   เปิดใช้งานการปรับรูปภาพของ Next.js Image component
     * - Improves image loading performance and quality
     *   ปรับปรุงประสิทธิภาพและคุณภาพการโหลดรูปภาพ
     */
    remotePatterns: [
      {
        protocol: "https", // HTTPS protocol required / ต้องใช้โปรโตคอล HTTPS
        hostname: "bzwysgttfziejgznhhep.supabase.co", // Your Supabase project hostname / hostname ของโปรเจกต์ Supabase ของคุณ
        port: "", // Empty string means default port (443 for HTTPS) / สตริงว่างหมายถึงพอร์ตเริ่มต้น (443 สำหรับ HTTPS)
        pathname: "/storage/v1/object/public/**", // Allow all public storage paths / อนุญาตทุกเส้นทางของ public storage
      },
    ],
  },
};

/**
 * Next-intl Plugin Integration / การผสานรวม Next-intl Plugin
 *
 * Purpose / จุดประสงค์:
 * - Wraps Next.js config with internationalization support
 *   ห่อการกำหนดค่า Next.js ด้วยการรองรับหลายภาษา
 * - Enables routing based on locale (language)
 *   เปิดใช้งานการจัดการเส้นทางตามภาษา
 * - Provides translation utilities throughout the app
 *   จัดเตรียมเครื่องมือแปลทั่วทั้งแอป
 *
 * How it works / วิธีการทำงาน:
 * 1. Creates plugin instance with no parameters
 *    สร้าง plugin instance โดยไม่มีพารามิเตอร์
 * 2. Wraps nextConfig with i18n capabilities
 *    ห่อ nextConfig ด้วยความสามารถ i18n
 * 3. Enables locale-based routing automatically
 *    เปิดใช้งานการจัดการเส้นทางตามภาษาอัตโนมัติ
 *
 * Configuration Location / ที่อยู่การกำหนดค่า:
 * - i18n/request.ts - Locale detection and message loading
 *                     การตรวจจับภาษาและการโหลดข้อความ
 * - messages/th.json - Thai translations
 *                      การแปลภาษาไทย
 * - messages/en.json - English translations
 *                      การแปลภาษาอังกฤษ
 */
const withNextIntl = createNextIntlPlugin();

/**
 * Export wrapped configuration / ส่งออกการกำหนดค่าที่ห่อแล้ว
 *
 * This exports the Next.js config enhanced with internationalization
 * นี่คือการส่งออกการกำหนดค่า Next.js ที่เสริมด้วยการจัดการหลายภาษา
 */
export default withNextIntl(nextConfig);

// Alternative: Export without i18n / ทางเลือก: ส่งออกโดยไม่มี i18n
//export default nextConfig
