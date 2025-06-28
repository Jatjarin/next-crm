import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import UpdateStatusButton from "./UpdateStatusButton"
import DeleteButton from "./DeleteButton"
import ConvertToInvoiceButton from "./ConvertToInvoiceButton"
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
import { Card, CardContent, CardHeader } from "@/components/ui/card"

// Type Definitions
type Customer = {
  id: number
  name: string
  address: string | null
  tax_id: string | null
}
type ResponsiblePerson = { name: string }
type QuotationItem = {
  description: string
  quantity: number
  unitPrice: number
}
type Quotation = {
  id: number
  quotation_number: string
  issue_date: string
  expiry_date: string
  items: QuotationItem[]
  status: string
  customers: Customer | null
  responsible_persons: ResponsiblePerson | null
}
// --- แก้ไขที่นี่: สร้าง Type สำหรับ props ของหน้า ---
// type Props = {
//   params: { id: string }
// }

// Helper Functions
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
    month: "long",
    day: "numeric",
  })
const calculateGrandTotal = (items: QuotationItem[]): number =>
  items?.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  ) || 0

export default async function QuotationDetailPage(props: {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await props.params
  const { id } = params
  const supabase = await createClient()

  // เราใช้ id จาก params ที่ได้รับมาโดยตรง
  const { data: quotationData, error } = await supabase
    .from("quotations")
    .select(`*, customers!left(*), responsible_persons!left(name)`)
    .eq("id", id)
    .single()

  if (error || !quotationData) {
    notFound()
  }
  const quotation = quotationData as Quotation
  const grandTotal = calculateGrandTotal(quotation.items)
  const subTotal = grandTotal / 1.07
  const vat = grandTotal - subTotal

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <Link
            href="/quotations"
            className="text-sm text-muted-foreground hover:underline flex items-center mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> กลับไปหน้ารายการใบเสนอราคา
          </Link>
          <h1 className="text-3xl font-bold">
            ใบเสนอราคา #{quotation.quotation_number}
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* --- เพิ่มปุ่ม Convert ที่นี่ --- */}
          {/* จะแสดงก็ต่อเมื่อสถานะเป็น "อนุมัติแล้ว" เท่านั้น */}
          {quotation.status === "Accepted" && (
            <ConvertToInvoiceButton quotationId={quotation.id} />
          )}
          <Button asChild variant="outline">
            <Link href={`/quotations/${quotation.id}/edit`}>
              <Pencil size={16} className="mr-2" /> แก้ไข
            </Link>
          </Button>
          <DeleteButton quotationId={quotation.id} />
          <UpdateStatusButton
            quotationId={quotation.id}
            currentStatus={quotation.status}
          />
        </div>
      </div>

      <Card className="p-8 md:p-12">
        <CardHeader className="p-0 mb-8">
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
              <p className="text-muted-foreground">
                16/7 ถ.สายตรอกนอง ต.ขลุง อ.ขลุง จ.จันทบุรี 22110
              </p>
            </div>
            <div className="text-right">
              <h1 className="text-4xl font-bold text-gray-800">QUOTATION</h1>
              <p className="text-muted-foreground">
                #{quotation.quotation_number}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex justify-between mb-8">
            <div>
              <p className="font-semibold text-muted-foreground">ลูกค้า:</p>
              <p className="text-lg font-semibold">
                {quotation.customers?.name}
              </p>
              <p className="text-muted-foreground">
                {quotation.customers?.address}
              </p>
              <p className="text-muted-foreground">
                เลขประจำตัวผู้เสียภาษี: {quotation.customers?.tax_id || "-"}
              </p>
            </div>
            <div className="text-right">
              <p>
                <strong>วันที่ออก:</strong> {formatDate(quotation.issue_date)}
              </p>
              <p>
                <strong>ยืนราคาถึงวันที่:</strong>{" "}
                {formatDate(quotation.expiry_date)}
              </p>
              <p className="mt-2">
                <strong>สถานะ:</strong> {getStatusBadge(quotation.status)}
              </p>
              <p className="mt-2">
                <strong>ผู้รับผิดชอบ:</strong>{" "}
                {quotation.responsible_persons?.name || "-"}
              </p>
            </div>
          </div>
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
              {quotation.items &&
                quotation.items.map((item, index) => (
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
        </CardContent>
      </Card>
    </div>
  )
}
