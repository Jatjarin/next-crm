import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import UpdateStatusButton from "./UpdateStatusButton"
import { deleteInvoice } from "../actions"
import { Button } from "@/components/ui/button"
// import PrintButton from "./PrintButton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"

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

// interface Item {
//   quantity: number
//   unitPrice: number
// }
interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
}

// This function now calculates the total price based on VAT-inclusive unit prices.
const calculateGrandTotal = (items: InvoiceItem[]): number =>
  items?.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  ) || 0

// --- แก้ไขที่นี่: เปลี่ยนเป็น Promise format ---
export default async function InvoiceDetailPage(props: {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Await params เพื่อดึงค่า id ออกมา
  const params = await props.params
  const { id } = params

  const supabase = await createClient()
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select(`*, customers (*)`)
    .eq("id", id) // ใช้ id ที่ await มาแล้ว
    .single()

  if (error || !invoice) {
    notFound()
  }

  // --- แก้ไข Logic การคำนวณราคาที่นี่ ---
  // 1. ยอดรวมทั้งสิ้น คือผลรวมของ (จำนวน * ราคาที่รวม VAT แล้ว)
  const grandTotal = calculateGrandTotal(invoice.items)
  // 2. คำนวณย้อนกลับเพื่อหายอดก่อนภาษี
  const subTotal = grandTotal / 1.07
  // 3. คำนวณภาษีจากส่วนต่าง
  const vat = grandTotal - subTotal

  // ผูก ID กับฟังก์ชันล่วงหน้า
  const deleteInvoiceWithId = deleteInvoice.bind(null, invoice.id)

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
          {/* ปุ่มแก้ไข */}
          <Button asChild variant="outline">
            <Link href={`/invoices/${invoice.id}/edit`}>
              <Pencil size={16} className="mr-2" /> แก้ไข
            </Link>
          </Button>

          {/* ปุ่มลบ */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 size={16} className="mr-2" />
                ลบ
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <form action={deleteInvoiceWithId}>
                <AlertDialogHeader>
                  <AlertDialogTitle>คุณแน่ใจหรือไม่?</AlertDialogTitle>
                  <AlertDialogDescription>
                    การกระทำนี้ไม่สามารถย้อนกลับได้
                    ระบบจะทำการลบใบแจ้งหนี้นี้อย่างถาวร
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel type="button">ยกเลิก</AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button type="submit" variant="destructive">
                      ยืนยันการลบ
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </form>
            </AlertDialogContent>
          </AlertDialog>
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
                invoice.items.map((item: InvoiceItem, index: number) => (
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
              <div className="w-full max-w-sm space-y-2">
                {/* --- แก้ไขป้ายกำกับที่นี่ --- */}
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
