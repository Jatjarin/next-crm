import { createClient } from "@/lib/supabase/server"
import { BarChart3, TrendingUp, Users, FileClock } from "lucide-react"
import {
  Card,
  CardContent,
  //CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// บังคับให้หน้านี้ดึงข้อมูลใหม่เสมอเมื่อถูกเปิด (ไม่ใช้ Cache)
export const dynamic = "force-dynamic"

// --- Type Definitions ---
type InvoiceItem = {
  description: string
  quantity: number
  unitPrice: number
}

type Invoice = {
  items: InvoiceItem[]
  issue_date: string
  status: string
  customers: {
    id: number
    name: string
  } | null
}

// --- Helper Function ---
const calculateTotal = (items: InvoiceItem[]): number =>
  items?.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  ) || 0

export default async function ReportsPage() {
  const supabase = await createClient()
  const currentYear = new Date().getFullYear()

  // 1. ดึงข้อมูล Invoice ทั้งหมดที่จำเป็นสำหรับการทำรายงาน
  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("items, issue_date, status, customers!inner(id, name)")
    .gte("issue_date", `${currentYear}-01-01`)
    .lte("issue_date", `${currentYear}-12-31`)

  if (error) {
    return (
      <p className="p-8">
        เกิดข้อผิดพลาดในการโหลดข้อมูลสำหรับรายงาน: {error.message}
      </p>
    )
  }

  const typedInvoices = (invoices || []) as Invoice[]

  // --- 2. ประมวลผลข้อมูลสำหรับสร้างรายงาน ---

  // ก. คำนวณยอดขายรายเดือน (สำหรับกราฟ)
  const monthlySales = Array(12).fill(0)
  typedInvoices
    .filter((inv) => inv.status === "Paid")
    .forEach((invoice) => {
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

  // ข. คำนวณข้อมูลสรุปในการ์ด
  const totalPaidRevenue = monthlySales.reduce((sum, sales) => sum + sales, 0)
  const paidInvoicesCount = typedInvoices.filter(
    (inv) => inv.status === "Paid"
  ).length
  const outstandingRevenue = typedInvoices
    .filter((inv) => inv.status === "Sent" || inv.status === "Overdue")
    .reduce((sum, inv) => sum + calculateTotal(inv.items), 0)

  // ค. คำนวณยอดขายตามลูกค้า (สำหรับตาราง Top Customers)
  const customerSales: { [key: string]: { name: string; total: number } } = {}
  typedInvoices
    .filter((inv) => inv.status === "Paid" && inv.customers)
    .forEach((invoice) => {
      const customerId = invoice.customers!.id
      if (!customerSales[customerId]) {
        customerSales[customerId] = { name: invoice.customers!.name, total: 0 }
      }
      customerSales[customerId].total += calculateTotal(invoice.items)
    })

  const topCustomers = Object.values(customerSales)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5) // แสดง 5 อันดับแรก

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">รายงานสรุป</h1>

      {/* การ์ดสรุปข้อมูล */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              ยอดขายรวม (ที่ชำระแล้ว)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ฿
              {totalPaidRevenue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              จาก {paidInvoicesCount} ใบแจ้งหนี้
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              ยอดรวมที่ยังไม่ชำระ
            </CardTitle>
            <FileClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ฿
              {outstandingRevenue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              จากใบแจ้งหนี้ที่ส่งแล้วและค้างชำระ
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* กราฟยอดขายรายเดือน */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              สรุปยอดขายรายเดือน ปี {currentYear}
            </CardTitle>
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

        {/* ตารางลูกค้าดีเด่น */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              ลูกค้าดีเด่น (ตามยอดขาย)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ลูกค้า</TableHead>
                  <TableHead className="text-right">ยอดขายรวม</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCustomers.map((customer, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {customer.name}
                    </TableCell>
                    <TableCell className="text-right">
                      ฿
                      {customer.total.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
