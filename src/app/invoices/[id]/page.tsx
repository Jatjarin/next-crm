import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import UpdateStatusButton from "./UpdateStatusButton"
import PrintButton from "./PrintButton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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

// Helper functions
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
    month: "long",
    day: "numeric",
  })
const calculateTotal = (items: any[]): number =>
  items?.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  ) || 0

export default async function InvoiceDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select(`*, customers (*)`)
    .eq("id", params.id)
    .single()

  if (error || !invoice) {
    notFound()
  }

  const subTotal = calculateTotal(invoice.items)
  const vat = subTotal * 0.07
  const grandTotal = subTotal + vat

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <Link
            href="/invoices"
            className="text-sm text-muted-foreground hover:underline flex items-center mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับไปหน้ารายการ Invoice
          </Link>
          <h1 className="text-3xl font-bold">
            ใบแจ้งหนี้ #{invoice.invoice_number}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* <PrintButton invoiceNumber={invoice.invoice_number} /> */}
          <UpdateStatusButton
            invoiceId={invoice.id}
            currentStatus={invoice.status}
          />
        </div>
      </div>

      {/* เพิ่ม id="printable-area" ให้กับ Card เพื่อให้ปุ่ม Export หาเจอ */}
      <Card id="printable-area" className="p-8 md:p-12">
        <CardHeader className="p-0 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <Image
                src="/logo512.jpg"
                alt="Company Logo"
                width={100}
                height={100}
                className="mb-2"
              />
              <h2 className="text-xl font-bold mb-1">
                บริษัท สัก วู้ดเวิร์ค จำกัด
              </h2>
              <p className="text-muted-foreground">
                16/7 ถ.สายตรอกนอง ต.ขลุง อ.ขลุง จ.จันทบุรี 22110
              </p>
            </div>
            <div className="text-right">
              <h1 className="text-5xl font-bold text-gray-800">INVOICE</h1>
              <p className="text-muted-foreground">#{invoice.invoice_number}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex justify-between mb-8">
            <div>
              <p className="font-semibold text-muted-foreground">ลูกค้า:</p>
              <Link
                href={`/customers/${invoice.customers?.id}`}
                className="text-blue-600 hover:underline text-lg font-semibold"
              >
                {invoice.customers?.name}
              </Link>
              <p className="text-muted-foreground">
                {invoice.customers?.address}
              </p>
            </div>
            <div className="text-right">
              <p>
                <strong>วันที่ออก:</strong> {formatDate(invoice.issue_date)}
              </p>
              <p>
                <strong>ครบกำหนดชำระ:</strong> {formatDate(invoice.due_date)}
              </p>
              <p className="mt-2">
                <strong>สถานะ:</strong> {getStatusBadge(invoice.status)}
              </p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รายการ</TableHead>
                <TableHead className="text-center">จำนวน</TableHead>
                <TableHead className="text-right">ราคา/หน่วย</TableHead>
                <TableHead className="text-right">รวม</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items &&
                invoice.items.map((item: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {item.description}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {Number(item.unitPrice).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      {(
                        (item.quantity || 0) * (item.unitPrice || 0)
                      ).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          <div className="flex justify-end mt-4">
            <div className="w-full max-w-sm space-y-2">
              <div className="flex justify-between">
                <span>ยอดรวม</span>
                <span>
                  ฿
                  {subTotal.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>VAT (7%)</span>
                <span>
                  ฿{vat.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>ยอดรวมทั้งสิ้น</span>
                <span>
                  ฿
                  {grandTotal.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
