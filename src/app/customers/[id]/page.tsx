import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import EditForm from "./EditForm"
import DeleteButton from "./DeleteButton"
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
import { ArrowLeft } from "lucide-react"

// --- 1. Type Definitions ---
type InvoiceItem = {
  description: string
  quantity: number
  unitPrice: number
}

type Invoice = {
  id: number
  customer_id: number
  invoice_number: string
  issue_date: string
  due_date: string
  items: InvoiceItem[]
  status: string
  created_at: string
}

// --- Helper Functions ---
const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
const calculateTotal = (items: InvoiceItem[]): number =>
  items?.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  ) || 0
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

// --- ลบ type definition ออกไปใช้ inline แทน ---
export default async function CustomerDetailPage(props: {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Await params เพื่อดึงค่า id ออกมา
  const params = await props.params
  const { id } = params

  const supabase = await createClient()

  const { data: customer, error } = await supabase
    .from("customers")
    .select(
      `
        *,
        invoices ( * )
    `
    )
    .eq("id", id)
    .single()

  if (error || !customer) {
    console.error(error)
    notFound()
  }

  // Type assertion เพื่อให้ TypeScript เข้าใจโครงสร้างที่ซ้อนกัน
  const typedCustomer = customer as typeof customer & { invoices: Invoice[] }

  // --- แก้ไขที่นี่: ระบุ Type ของ a และ b ให้ชัดเจน ---
  const sortedInvoices =
    typedCustomer.invoices?.sort(
      (a: Invoice, b: Invoice) =>
        new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime()
    ) || []

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Link
            href="/customers"
            className="text-sm text-muted-foreground hover:underline flex items-center mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับไปหน้ารายชื่อลูกค้า
          </Link>
          <h1 className="text-3xl font-bold">{typedCustomer.name}</h1>
          <p className="text-muted-foreground">
            ผู้รับผิดชอบ: {typedCustomer.responsible_person || "-"}
          </p>
        </div>
        <DeleteButton customerId={typedCustomer.id} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลติดต่อ</CardTitle>
          <CardDescription>
            รายละเอียดการติดต่อและข้อมูลทางภาษีของลูกค้า
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-500">
                เลขประจำตัวผู้เสียภาษี
              </p>
              <p>{typedCustomer.tax_id || "-"}</p>
            </div>
            <div>
              <p className="font-medium text-gray-500">เบอร์โทร</p>
              <p>{typedCustomer.phone || "-"}</p>
            </div>
            <div>
              <p className="font-medium text-gray-500">LINE ID</p>
              <p>{typedCustomer.line_id || "-"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="font-medium text-gray-500">ที่อยู่</p>
              <p>{typedCustomer.address || "-"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ประวัติใบแจ้งหนี้</CardTitle>
          <CardDescription>
            รายการใบแจ้งหนี้ทั้งหมดของลูกค้ารายนี้
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>เลขที่ Invoice</TableHead>
                <TableHead>วันที่ออก</TableHead>
                <TableHead className="text-right">ยอดรวม</TableHead>
                <TableHead className="text-center">สถานะ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedInvoices.length > 0 ? (
                sortedInvoices.map((invoice: Invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {invoice.invoice_number}
                      </Link>
                    </TableCell>
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
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    ไม่พบข้อมูลใบแจ้งหนี้
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EditForm customer={typedCustomer} />
    </div>
  )
}
