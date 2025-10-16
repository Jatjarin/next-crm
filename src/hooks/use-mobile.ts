/**
 * Mobile Detection Hook / Hook สำหรับตรวจจับอุปกรณ์มือถือ
 *
 * This file provides a React hook to detect if the user is on a mobile device
 * ไฟล์นี้จัดเตรียม React hook เพื่อตรวจจับว่าผู้ใช้อยู่บนอุปกรณ์มือถือหรือไม่
 */

import * as React from "react"

/**
 * Mobile breakpoint value (768px)
 * ค่า breakpoint สำหรับอุปกรณ์มือถือ (768px)
 *
 * - Screens below 768px are considered mobile
 *   หน้าจอที่เล็กกว่า 768px จะถือว่าเป็นอุปกรณ์มือถือ
 * - Screens 768px and above are considered desktop
 *   หน้าจอที่ 768px ขึ้นไปจะถือว่าเป็นเดสก์ท็อป
 */
const MOBILE_BREAKPOINT = 768

/**
 * Custom React hook to detect if user is on mobile device
 * Custom React hook เพื่อตรวจจับว่าผู้ใช้อยู่บนอุปกรณ์มือถือหรือไม่
 *
 * Purpose / จุดประสงค์:
 * - Detect if the viewport width is below mobile breakpoint
 *   ตรวจจับว่าความกว้างของวิวพอร์ตต่ำกว่า mobile breakpoint หรือไม่
 * - Automatically update when window is resized
 *   อัพเดทอัตโนมัติเมื่อหน้าต่างถูกปรับขนาด
 * - Provide responsive behavior based on screen size
 *   จัดเตรียมพฤติกรรมที่ตอบสนองตามขนาดหน้าจอ
 *
 * How to use / วิธีใช้งาน:
 * ```tsx
 * import { useIsMobile } from '@/hooks/use-mobile'
 *
 * function MyComponent() {
 *   const isMobile = useIsMobile()
 *
 *   return (
 *     <div>
 *       {isMobile ? (
 *         <MobileView />
 *       ) : (
 *         <DesktopView />
 *       )}
 *     </div>
 *   )
 * }
 *
 * // Conditional rendering / การแสดงผลแบบมีเงื่อนไข
 * function NavigationMenu() {
 *   const isMobile = useIsMobile()
 *
 *   return isMobile ? <HamburgerMenu /> : <FullMenu />
 * }
 * ```
 *
 * How it works / วิธีการทำงาน:
 * 1. Uses window.matchMedia to check viewport width
 *    ใช้ window.matchMedia เพื่อตรวจสอบความกว้างของวิวพอร์ต
 * 2. Listens for resize events to update state
 *    รับฟังอีเวนต์การปรับขนาดเพื่ออัพเดทสถานะ
 * 3. Returns true if viewport is below 768px
 *    คืนค่า true ถ้าวิวพอร์ตต่ำกว่า 768px
 * 4. Cleans up event listener on unmount
 *    ทำความสะอาด event listener เมื่อคอมโพเนนต์ถูก unmount
 *
 * @returns boolean - true if mobile, false if desktop
 *                    true ถ้าเป็นมือถือ, false ถ้าเป็นเดสก์ท็อป
 */
export function useIsMobile() {
  // Initialize state as undefined / เริ่มต้นสถานะเป็น undefined
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Create media query list / สร้างรายการ media query
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    // Handler function for viewport changes / ฟังก์ชันจัดการสำหรับการเปลี่ยนแปลงวิวพอร์ต
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Add event listener for changes / เพิ่ม event listener สำหรับการเปลี่ยนแปลง
    mql.addEventListener("change", onChange)

    // Set initial value / ตั้งค่าเริ่มต้น
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

    // Cleanup function / ฟังก์ชันทำความสะอาด
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Convert undefined to false / แปลง undefined เป็น false
  return !!isMobile
}
