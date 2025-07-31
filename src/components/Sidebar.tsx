"use client"

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
  ClipboardList,
  Settings,
  UserCog,
  History,
  ChevronRight,
  Warehouse,
} from "lucide-react"
import { logout } from "./actions"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
//import { cn } from "@/lib/utils"

// 1. ปรับโครงสร้าง navItems
const navItems = [
  { href: "/", label: "แดชบอร์ด", icon: LayoutDashboard },
  { href: "/customers", label: "ลูกค้า", icon: Users },
  { href: "/quotations", label: "ใบเสนอราคา", icon: ClipboardList },
  { href: "/invoices", label: "ใบแจ้งหนี้", icon: FileText },
  { href: "/products", label: "สินค้า", icon: Package },
  { href: "/warehouses", label: "คลังสินค้า", icon: Warehouse },
  { href: "/responsible-persons", label: "ผู้รับผิดชอบ", icon: UserCheck },
  // --- สร้างเมนูหลักสำหรับ HRM ---
  {
    label: "พนักงาน",
    icon: UserCog,
    // --- เพิ่มเมนูย่อยที่นี่ ---
    submenus: [
      { href: "/employees", label: "รายชื่อพนักงาน", icon: UserCog },
      {
        href: "/employees/leave-history",
        label: "ประวัติการลา",
        icon: History,
      },
    ],
  },
  { href: "/reports", label: "รายงาน", icon: BarChart2 },
  { href: "/settings", label: "ตั้งค่า", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden h-screen w-64 flex-col border-r bg-background md:flex">
      <div className="border-b p-4">
        <h1 className="text-2xl font-bold">EAZY Erp</h1>
      </div>
      <div className="flex flex-1 flex-col gap-y-7 p-4">
        <nav className="flex flex-col gap-y-1">
          {navItems.map((item) =>
            // 2. ตรวจสอบว่ามีเมนูย่อยหรือไม่
            item.submenus ? (
              <Collapsible
                key={item.label}
                defaultOpen={pathname.startsWith("/employees")}
              >
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start">
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                    <ChevronRight className="ml-auto h-4 w-4 transition-transform [&[data-state=open]]:rotate-90" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 pt-1 pl-6">
                  {item.submenus.map((submenu) => {
                    const isSubmenuActive = pathname === submenu.href
                    return (
                      <Button
                        key={submenu.label}
                        variant={isSubmenuActive ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        asChild
                      >
                        <Link href={submenu.href} prefetch={false}>
                          {submenu.label}
                        </Link>
                      </Button>
                    )
                  })}
                </CollapsibleContent>
              </Collapsible>
            ) : (
              // 3. ถ้าไม่มีเมนูย่อย ให้แสดงผลแบบเดิม
              <Button
                key={item.label}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href={item.href} prefetch={false}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            )
          )}
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
