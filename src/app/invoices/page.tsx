import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
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
import { Badge } from "@/components/ui/badge"

// ฟังก์ชันสำหรับแปลงค่าสถานะเป็นภาษาไทยและสี
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

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
const calculateTotal = (items: any[]): number =>
  items?.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  ) || 0

export default async function InvoicesPage() {
  const supabase = await createClient()

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select(`id, invoice_number, issue_date, items, status, customers ( name )`)
    .order("issue_date", { ascending: false })

  if (error) {
    return <p className="p-8">เกิดข้อผิดพลาดในการโหลดข้อมูลใบแจ้งหนี้</p>
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">ใบแจ้งหนี้</h1>
        <Button asChild>
          <Link href="/invoices/new">
            <Plus size={20} className="mr-2" /> สร้างใบแจ้งหนี้ใหม่
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการใบแจ้งหนี้ทั้งหมด</CardTitle>
          <CardDescription>
            จัดการและติดตามสถานะใบแจ้งหนี้ของลูกค้าทั้งหมด
          </CardDescription>
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
              {invoices.map((invoice) => (
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
