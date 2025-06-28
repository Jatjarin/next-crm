import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { Badge } from "@/components/ui/badge"

type QuotationItem = {
  quantity: number
  unitPrice: number
}

interface Quotation {
  id: number
  quotation_number: string
  issue_date: string
  items: QuotationItem[]
  status: string
  customers: { name: string } | null
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Accepted":
      return <Badge variant="success">อนุมัติแล้ว</Badge>
    case "Sent":
      return <Badge variant="default">ส่งแล้ว</Badge>
    case "Rejected":
      return <Badge variant="destructive">ไม่อนุมัติ</Badge>
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
const calculateTotal = (items: QuotationItem[]): number =>
  items?.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  ) || 0

export default async function QuotationsPage() {
  const supabase = await createClient()

  const { data: quotations, error } = await supabase
    .from("quotations")
    .select(
      `id, quotation_number, issue_date, items, status, customers!left(name)`
    )
    .order("issue_date", { ascending: false })

  if (error) {
    return <p className="p-8">เกิดข้อผิดพลาดในการโหลดข้อมูล: {error.message}</p>
  }
  //const typedInvoices = (invoices || []) as unknown as InvoiceWithCustomer[]
  const typedQuotations = (quotations || []) as unknown as Quotation[]

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">ใบเสนอราคา</h1>
        <Button asChild>
          <Link href="/quotations/new">
            <Plus size={20} className="mr-2" /> สร้างใบเสนอราคาใหม่
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการใบเสนอราคาทั้งหมด</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>เลขที่ใบเสนอราคา</TableHead>
                <TableHead>ลูกค้า</TableHead>
                <TableHead>วันที่ออก</TableHead>
                <TableHead className="text-right">ยอดรวม</TableHead>
                <TableHead className="text-center">สถานะ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {typedQuotations.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/quotations/${quote.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {quote.quotation_number}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {quote.customers?.name || "ไม่ระบุลูกค้า"}
                  </TableCell>
                  <TableCell>{formatDate(quote.issue_date)}</TableCell>
                  <TableCell className="text-right">
                    ฿
                    {calculateTotal(quote.items).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(quote.status)}
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
