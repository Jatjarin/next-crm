import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import QuotationForm from "./QuotationForm" // เราจะสร้าง Component นี้ต่อไป
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditQuotationPage({ params }: Props) {
  const supabase = await createClient()
  const { id } = await params
  // ดึงข้อมูลทั้ง 3 ส่วนพร้อมกันเพื่อประสิทธิภาพสูงสุด
  const [quotationRes, customersRes, responsiblePersonsRes] = await Promise.all(
    [
      supabase.from("quotations").select("*").eq("id", id).single(),
      supabase.from("customers").select("id, name"),
      supabase.from("responsible_persons").select("id, name"),
    ]
  )

  const { data: quotation, error: quotationError } = quotationRes
  const { data: customers, error: customersError } = customersRes
  const { data: responsiblePersons, error: responsiblePersonsError } =
    responsiblePersonsRes

  if (quotationError || !quotation) {
    notFound()
  }

  if (customersError || responsiblePersonsError) {
    console.error(
      "Error fetching data:",
      customersError || responsiblePersonsError
    )
    return (
      <div className="p-8 text-center text-red-600">
        <p>เกิดข้อผิดพลาดในการโหลดข้อมูลที่จำเป็น</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <Link
        href={`/quotations/${quotation.id}`}
        className="text-sm text-muted-foreground hover:underline flex items-center mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        กลับไปหน้ารายละเอียดใบเสนอราคา
      </Link>
      <h1 className="text-3xl font-bold mb-6">
        แก้ไขใบเสนอราคา #{quotation.quotation_number}
      </h1>

      {/* ส่งข้อมูลทั้งหมดไปให้ฟอร์ม */}
      <QuotationForm
        customers={customers || []}
        responsiblePersons={responsiblePersons || []}
        quotation={quotation}
      />
    </div>
  )
}
