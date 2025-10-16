/**
 * Utility Functions / ฟังก์ชันยูทิลิตี้
 *
 * This file contains utility functions used throughout the application
 * ไฟล์นี้ประกอบด้วยฟังก์ชันยูทิลิตี้ที่ใช้ทั่วทั้งแอปพลิเคชัน
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines and merges Tailwind CSS classes
 * รวมและผสาน class ของ Tailwind CSS
 *
 * Purpose / จุดประสงค์:
 * - Combines multiple CSS class names into a single string
 *   รวม class CSS หลายตัวเข้าด้วยกันเป็นสตริงเดียว
 * - Automatically handles conditional classes
 *   จัดการ class แบบมีเงื่อนไขอัตโนมัติ
 * - Resolves conflicts between Tailwind classes (latest takes precedence)
 *   แก้ไขความขัดแย้งระหว่าง class ของ Tailwind (ตัวล่าสุดมีความสำคัญมากกว่า)
 *
 * How to use / วิธีใช้งาน:
 * ```tsx
 * // Basic usage / การใช้งานพื้นฐาน
 * cn("px-2 py-1", "bg-blue-500")
 * // Result: "px-2 py-1 bg-blue-500"
 *
 * // Conditional classes / class แบบมีเงื่อนไข
 * cn("px-2 py-1", isActive && "bg-blue-500")
 * // Result: "px-2 py-1 bg-blue-500" (if isActive is true)
 *
 * // Resolving conflicts / แก้ไขความขัดแย้ง
 * cn("px-2", "px-4")
 * // Result: "px-4" (latest class wins)
 * ```
 *
 * @param inputs - Variable number of class values (strings, objects, arrays)
 *                 จำนวนค่า class ที่ไม่จำกัด (สตริง, อ็อบเจ็กต์, อาเรย์)
 * @returns Merged class string / สตริง class ที่ผสานแล้ว
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
