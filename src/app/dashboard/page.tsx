import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Users, Wallet, Hourglass, FileWarning } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const calculateTotal = (items: any[]): number =>
  items?.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  ) || 0
const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
const getStatusBadge = (status: string) => {
  switch (status) {
    case "Paid":
      return <Badge variant="success">ชำระแล้ว</Badge>
    case "Sent":
      return <Badge variant="default">ส่งแล้ว</Badge>
    case "Overdue":
      return <Badge variant="destructive">ค้างชำระ</Badge>
    case "Draft":
    default:
      return <Badge variant="secondary">ฉบับร่าง</Badge>
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const [customerData, invoiceData] = await Promise.all([
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase
      .from("invoices")
      .select(
        "id, invoice_number, items, status, issue_date, customers ( name )"
      )
      .order("issue_date", { ascending: false }),
  ])

  const { count: customerCount } = customerData
  const { data: invoices, error: invoiceError } = invoiceData

  if (invoiceError) {
    return <p className="p-8">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
  }

  const totalRevenue = invoices
    .filter((inv) => inv.status === "Paid")
    .reduce((sum, inv) => sum + calculateTotal(inv.items), 0)

  const outstandingRevenue = invoices
    .filter((inv) => inv.status === "Sent" || inv.status === "Overdue")
    .reduce((sum, inv) => sum + calculateTotal(inv.items), 0)

  const overdueInvoicesCount = invoices.filter(
    (inv) => inv.status === "Overdue"
  ).length
  const recentInvoices = invoices.slice(0, 5)

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">แดชบอร์ด</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ลูกค้าทั้งหมด</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">จำนวนลูกค้าในระบบ</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รายรับทั้งหมด</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ฿{totalRevenue.toLocaleString("en-US")}
            </div>
            <p className="text-xs text-muted-foreground">ยอดรวมที่ชำระแล้ว</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ยอดรอชำระ</CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ฿{outstandingRevenue.toLocaleString("en-US")}
            </div>
            <p className="text-xs text-muted-foreground">ยอดรวมที่ยังไม่ชำระ</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ค้างชำระ</CardTitle>
            <FileWarning className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueInvoicesCount}</div>
            <p className="text-xs text-muted-foreground">
              จำนวนใบแจ้งหนี้ที่เลยกำหนด
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ใบแจ้งหนี้ล่าสุด</CardTitle>
          <CardDescription>รายการใบแจ้งหนี้ 5 รายการล่าสุด</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>เลขที่ Invoice</TableHead>
                <TableHead>ลูกค้า</TableHead>
                <TableHead>วันที่ออก</TableHead>
                <TableHead className="text-right">ยอดรวม</TableHead>
                <TableHead className="text-center">สถานะ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {invoice.invoice_number}
                    </Link>
                  </TableCell>
                  <TableCell>{invoice.customers?.name || "N/A"}</TableCell>
                  <TableCell>{formatDate(invoice.issue_date)}</TableCell>
                  <TableCell className="text-right">
                    ฿
                    {calculateTotal(invoice.items).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(invoice.status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
