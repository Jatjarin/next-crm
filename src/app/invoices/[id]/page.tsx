import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import UpdateStatusButton from "./UpdateStatusButton"
import InvoicePrintDropdown from "./InvoicePrintDropdown"
import DeleteInvoiceButton from "./DeleteInvoiceButton"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Pencil } from "lucide-react"

// --- Type Definitions ---
type Customer = {
  id: number
  name: string
  address: string | null
  tax_id: string | null
  responsible_person: string | null
}
type InvoiceItem = {
  description: string
  quantity: number
  unitPrice: number
}
type Invoice = {
  id: number
  invoice_number: string
  issue_date: string
  due_date: string
  items: InvoiceItem[]
  status: string
  customers: Customer | null
}
// type Props = {
//   params: { id: string }
// }

// --- Helper Functions ---
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
const calculateGrandTotal = (items: InvoiceItem[]): number =>
  items?.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  ) || 0

export default async function InvoiceDetailPage(props: {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Await params เพื่อดึงค่า id ออกมา
  const params = await props.params
  const { id } = params

  const supabase = await createClient()
  const { data: invoiceData, error } = await supabase
    .from("invoices")
    .select(`*, customers!left(*)`)
    .eq("id", id)
    .single()

  if (error || !invoiceData) {
    notFound()
  }

  const invoice = invoiceData as Invoice

  const grandTotal = calculateGrandTotal(invoice.items)
  const subTotal = grandTotal / 1.07
  const vat = grandTotal - subTotal

  return (
    <div className="bg-gray-100 p-4 sm:p-8 min-h-screen">
      {/* --- ส่วนควบคุม (จะถูกซ่อนตอนพิมพ์) --- */}
      <div className="no-print max-w-4xl mx-auto mb-6">
        <div className="flex justify-between items-start">
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
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <InvoicePrintDropdown invoiceNumber={invoice.invoice_number} />
            <Button asChild variant="outline">
              <Link href={`/invoices/${invoice.id}/edit`}>
                <Pencil size={16} className="mr-2" /> แก้ไข
              </Link>
            </Button>
            <DeleteInvoiceButton invoiceId={invoice.id} />
            <UpdateStatusButton
              invoiceId={invoice.id}
              currentStatus={invoice.status}
            />
          </div>
        </div>
      </div>

      {/* --- ส่วนของใบแจ้งหนี้ (A4 Layout) --- */}
      <div
        id="printable-area"
        className="w-full max-w-4xl mx-auto bg-white p-12 shadow-lg rounded-md border"
      >
        <header className="mb-8 pb-8 border-b">
          <div className="flex justify-between items-start">
            <div>
              <Image
                src="/logo512.png"
                alt="Company Logo"
                width={100}
                height={100}
                className="mb-2"
              />
              <h2 className="text-xl font-bold mb-1">
                บริษัท สัก วู้ดเวิร์ค จำกัด
              </h2>
              <p className="text-sm text-muted-foreground">
                16/7 ถ.สายตรอกนอง ต.ขลุง อ.ขลุง จ.จันทบุรี 22110
              </p>
            </div>
            <div className="text-right">
              <h1 className="text-4xl font-bold text-gray-800 invoice-title-text">
                INVOICE
              </h1>
              <p className="text-muted-foreground">#{invoice.invoice_number}</p>
              <div className="mt-4 space-y-1 text-sm">
                <p className="invoice-issue-date flex justify-between gap-4">
                  <strong>วันที่ออก:</strong>{" "}
                  <span>{formatDate(invoice.issue_date)}</span>
                </p>
                <p className="invoice-due-date flex justify-between gap-4">
                  <strong>ครบกำหนดชำระ:</strong>{" "}
                  <span>{formatDate(invoice.due_date)}</span>
                </p>
                <div className="mt-2 invoice-status flex justify-between gap-4">
                  <strong>สถานะ:</strong>{" "}
                  <span>{getStatusBadge(invoice.status)}</span>
                </div>
              </div>
            </div>
          </div>
        </header>
        <section className="mb-8">
          <div className="space-y-1">
            <p className="font-semibold text-muted-foreground">ลูกค้า:</p>
            <p className="text-lg font-semibold customer-name">
              {invoice.customers?.name}
            </p>
            <p className="text-sm text-muted-foreground customer-address">
              {invoice.customers?.address}
            </p>
            <p className="text-sm text-muted-foreground customer-tax-id">
              เลขประจำตัวผู้เสียภาษี: {invoice.customers?.tax_id || "-"}
            </p>
            <p className="text-sm text-muted-foreground customer-responsible-person">
              ผู้รับผิดชอบ: {invoice.customers?.responsible_person || "-"}
            </p>
          </div>
        </section>
        <section className="mb-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รายการ</TableHead>
                <TableHead className="text-center">จำนวน</TableHead>
                <TableHead className="text-right">
                  ราคา/หน่วย (รวม VAT)
                </TableHead>
                <TableHead className="text-right">รวม</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items &&
                invoice.items.map((item, index) => (
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
                      {(item.quantity * item.unitPrice).toLocaleString(
                        "en-US",
                        { minimumFractionDigits: 2 }
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </section>
        <section>
          <div className="flex justify-end mt-4">
            <div className="w-full max-w-sm space-y-2">
              <div className="flex justify-between">
                <span>ยอดรวมก่อนภาษี</span>
                <span>
                  ฿
                  {subTotal.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>ภาษีมูลค่าเพิ่ม (7%)</span>
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
        </section>
      </div>
    </div>
  )
}
