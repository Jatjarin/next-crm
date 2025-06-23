import { createClient } from "@/lib/supabase/server"
import { BarChart3 } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// บังคับให้หน้านี้ดึงข้อมูลใหม่เสมอเมื่อถูกเปิด (ไม่ใช้ Cache)
// ซึ่งสำคัญมากสำหรับหน้ารายงาน
export const dynamic = "force-dynamic"

// 1. กำหนด Type ที่ถูกต้อง
type InvoiceItem = {
  description: string
  quantity: number
  unitPrice: number
}

type PaidInvoice = {
  items: InvoiceItem[]
  issue_date: string
}

// Helper function
const calculateTotal = (items: InvoiceItem[]): number =>
  items?.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  ) || 0

export default async function ReportsPage() {
  const supabase = await createClient()
  const currentYear = new Date().getFullYear()

  // 2. ดึงข้อมูลเฉพาะ Invoice ที่ชำระแล้ว (Paid) ในปีปัจจุบัน
  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("items, issue_date")
    .eq("status", "Paid")
    .gte("issue_date", `${currentYear}-01-01`)
    .lte("issue_date", `${currentYear}-12-31`)

  if (error) {
    return (
      <p className="p-8">
        เกิดข้อผิดพลาดในการโหลดข้อมูลสำหรับรายงาน: {error.message}
      </p>
    )
  }

  // 3. ประมวลผลข้อมูลเพื่อสร้างยอดขายรายเดือน
  const monthlySales = Array(12).fill(0) // สร้าง Array 12 ช่องสำหรับแต่ละเดือน

  // Cast invoices to the correct type
  const typedInvoices = (invoices || []) as PaidInvoice[]

  typedInvoices.forEach((invoice) => {
    const month = new Date(invoice.issue_date).getMonth() // getMonth() จะได้ค่า 0-11
    monthlySales[month] += calculateTotal(invoice.items)
  })

  // 4. หายอดขายสูงสุดเพื่อใช้ในการคำนวณความสูงของแท่งกราฟ
  const maxSales = Math.max(...monthlySales)
  const monthLabels = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ]

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">รายงาน</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            สรุปยอดขายรายเดือน
          </CardTitle>
          <CardDescription>
            กราฟแสดงยอดขายที่ชำระแล้วในแต่ละเดือนของปี {currentYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {maxSales > 0 ? (
            <div className="w-full h-80 flex items-end justify-around p-4 border-l border-b border-gray-200">
              {monthlySales.map((sales, index) => {
                const barHeight = maxSales > 0 ? (sales / maxSales) * 100 : 0
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center w-1/12 h-full justify-end"
                  >
                    <div
                      title={`ยอดขาย: ฿${sales.toLocaleString("en-US")}`}
                      className="w-3/4 bg-blue-500 hover:bg-blue-600 rounded-t-sm transition-all duration-300"
                      style={{ height: `${barHeight}%` }}
                    ></div>
                    <span className="mt-2 text-xs text-gray-500">
                      {monthLabels[index]}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              ยังไม่มีข้อมูลยอดขายสำหรับปีนี้
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
