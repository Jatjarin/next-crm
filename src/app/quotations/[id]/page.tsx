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

// --- Type Definitions ---
type Settings = {
  company_name: string
  company_address: string
}
type Customer = {
  id: number
  name: string
  address: string | null
  tax_id: string | null
}
type ResponsiblePerson = {
  name: string
}
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
  price_tier: string | null
  customers: Customer | null
  responsible_persons: ResponsiblePerson | null
}
// type Props = {
//   params: Promise<{ id: string }>
// }

// --- Helper Functions ---
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
const getPriceTierLabel = (tier: string | null) => {
  switch (tier) {
    case "R":
      return "Retail price"
    case "W":
      return "Whole Price"
    case "N":
      return "Non-Stock Resellers Price"
    case "S":
      return "Special price"
    default:
      return "-"
  }
}

// export default async function QuotationDetailPage({ params }: Props) {
export default async function QuotationDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  // const { params } = prop
  const params = await props.params
  const { id } = params
  const supabase = await createClient()

  // --- แก้ไขที่นี่: ดึงข้อมูล Settings มาพร้อมกัน ---
  const [quotationRes, settingsRes] = await Promise.all([
    supabase
      .from("quotations")
      .select(`*, customers!left(*), responsible_persons!left(name)`)
      .eq("id", id)
      .single(),
    supabase
      .from("settings")
      .select("company_name, company_address")
      .eq("id", 1)
      .single(),
  ])

  const { data: quotationData, error: quotationError } = quotationRes
  const { data: settingsData, error: settingsError } = settingsRes

  // --- เพิ่มการจัดการ Error ที่นี่ ---
  // หากดึงข้อมูล settings ไม่สำเร็จ ให้แสดงใน console แต่ยังคง render หน้าต่อไปได้
  if (settingsError) {
    console.error("Could not fetch company settings:", settingsError)
  }

  if (quotationError || !quotationData) {
    notFound()
  }
  const quotation = quotationData as Quotation
  const settings = settingsData as Settings // สร้างตัวแปร settings

  const grandTotal = calculateGrandTotal(quotation.items)
  const subTotal = grandTotal / 1.07
  const vat = grandTotal - subTotal

  return (
    <div className="bg-gray-100 p-4 sm:p-8 min-h-screen">
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex justify-between items-start">
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
      </div>

      {/* --- แก้ไขที่นี่: ใช้ Card Component --- */}
      <Card className="w-full max-w-4xl mx-auto">
        <div className="p-8 md:p-12">
          <CardHeader className="p-0 mb-8 border-b pb-8">
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
                  {settings.company_name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {settings.company_address}
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
            <section className="mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="font-semibold text-muted-foreground">ลูกค้า:</p>
                  <p className="text-lg font-semibold">
                    {quotation.customers?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {quotation.customers?.address}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    เลขประจำตัวผู้เสียภาษี: {quotation.customers?.tax_id || "-"}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p>
                    <strong>วันที่ออก:</strong>{" "}
                    {formatDate(quotation.issue_date)}
                  </p>
                  <p>
                    <strong>ยืนราคาถึงวันที่:</strong>{" "}
                    {formatDate(quotation.expiry_date)}
                  </p>
                  <p className="mt-2">
                    <strong>สถานะ:</strong> {getStatusBadge(quotation.status)}
                  </p>
                </div>
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
            </section>
            <section className="flex justify-between items-end">
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-muted-foreground">
                  ผู้รับผิดชอบ:
                </p>
                <p className="font-semibold">
                  {quotation.responsible_persons?.name || "-"}
                </p>
                <p className="font-semibold text-muted-foreground mt-2">
                  ประเภทราคา:
                </p>
                <p className="font-semibold">
                  {getPriceTierLabel(quotation.price_tier)}
                </p>
              </div>
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
            </section>
          </CardContent>
        </div>
      </Card>
    </div>
  )
}
