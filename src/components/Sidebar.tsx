"use client" // ต้องเป็น Client Component เพื่อให้สามารถใช้ usePathname hook ได้

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart2,
  LogOut,
  Package,
  UserCheck,
  Settings,
  ClipboardList,
} from "lucide-react"
import { logout } from "./actions"
import { Button } from "@/components/ui/button"
// import { cn } from "@/lib/utils"

// สร้าง Array ของ Navigation Items เพื่อให้จัดการง่ายขึ้น
const navItems = [
  { href: "/", label: "แดชบอร์ด", icon: LayoutDashboard },
  { href: "/customers", label: "ลูกค้า", icon: Users },
  { href: "/invoices", label: "ใบแจ้งหนี้", icon: FileText },
  { href: "/quotations", label: "ใบเสนอราคา", icon: ClipboardList },
  { href: "/products", label: "สินค้า", icon: Package },
  { href: "/responsible-persons", label: "ผู้รับผิดชอบ", icon: UserCheck },
  { href: "/reports", label: "รายงาน", icon: BarChart2 },
  { href: "/settings", label: "ตั้งค่า", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden h-screen w-64 flex-col border-r bg-background md:flex">
      <div className="border-b p-4">
        <h1 className="text-2xl font-bold">MyCRM</h1>
      </div>
      <div className="flex flex-1 flex-col gap-y-7 p-4">
        <nav className="flex flex-col gap-y-1">
          {navItems.map((item) => {
            // --- แก้ไข Logic การตรวจสอบ Active State ที่นี่ ---
            // ตรวจสอบทั้งหน้าที่ตรงกันพอดี (เช่น /invoices)
            // และหน้าที่เป็น sub-route (เช่น /invoices/123)
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Button
                key={item.label}
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href={item.href} prefetch={false}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            )
          })}
        </nav>
        <div className="mt-auto">
          <form action={logout}>
            <Button variant="ghost" className="w-full justify-start">
              <LogOut className="mr-2 h-4 w-4" />
              ออกจากระบบ
            </Button>
          </form>
        </div>
      </div>
    </aside>
  )
}
