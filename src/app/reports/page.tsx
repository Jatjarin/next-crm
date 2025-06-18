import { createClient } from "@/lib/supabase/server"
import { BarChart3 } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// บังคับให้หน้านี้เป็น Dynamic Rendering เสมอ (ไม่ใช้ Cache)
export const dynamic = "force-dynamic"

const calculateTotal = (items: any[]): number =>
  items?.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  ) || 0

export default async function ReportsPage() {
  const supabase = await createClient()
  const currentYear = new Date().getFullYear()

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("items, issue_date")
    .eq("status", "Paid")
    .gte("issue_date", `${currentYear}-01-01`)
    .lte("issue_date", `${currentYear}-12-31`)

  if (error) {
    return <p className="p-8">เกิดข้อผิดพลาดในการโหลดข้อมูลสำหรับรายงาน</p>
  }

  const monthlySales = Array(12).fill(0)
  invoices.forEach((invoice) => {
    const month = new Date(invoice.issue_date).getMonth()
    monthlySales[month] += calculateTotal(invoice.items)
  })

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
