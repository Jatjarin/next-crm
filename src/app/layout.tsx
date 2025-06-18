import type { Metadata } from "next"
import { Sarabun } from "next/font/google" // แนะนำให้ใช้ Font ที่รองรับภาษาไทย
import "./globals.css"
import Sidebar from "@/components/Sidebar"
import { createClient } from "@/lib/supabase/server"

// ตั้งค่า Font
const sarabun = Sarabun({
  subsets: ["latin", "thai"],
  weight: ["400", "700"],
})

export const metadata: Metadata = {
  title: "MyCRM with Next.js",
  description: "CRM and Invoicing Application",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // สร้างการเชื่อมต่อ Supabase บน Server
  const supabase = await createClient()
  // ดึงข้อมูลผู้ใช้ปัจจุบันเพื่อตรวจสอบสถานะการล็อกอิน
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <html lang="th">
      <body className={sarabun.className}>
        {user ? (
          // --- Layout สำหรับผู้ใช้ที่ล็อกอินแล้ว ---
          <div className="flex bg-gray-100 font-sans">
            <Sidebar />
            <main className="flex-1">{children}</main>
          </div>
        ) : (
          // --- Layout สำหรับผู้ใช้ที่ยังไม่ได้ล็อกอิน (เช่น หน้า Login) ---
          <div className="bg-gray-100 font-sans">{children}</div>
        )}
      </body>
    </html>
  )
}
