import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import InvoiceForm from "./InvoiceForm"

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditInvoicePage({ params }: Props) {
  const supabase = await createClient()
  // แก้ไข: await params ใน Next.js 15+
  const { id } = await params

  // ดึงข้อมูล Invoice และ Customers มาพร้อมกัน
  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("*, customers(*)")
    .eq("id", id)
    .single()

  const { data: customers, error: customersError } = await supabase
    .from("customers")
    .select("id, name")

  // ตรวจสอบ Error ของ Invoice ก่อน
  if (invoiceError || !invoice) {
    notFound()
  }

  // --- เพิ่มการจัดการ Error ที่นี่ ---
  // ถ้าดึงรายชื่อลูกค้าไม่สำเร็จ ให้แสดงข้อความแจ้งเตือน
  if (customersError) {
    console.error("Error fetching customers for edit page:", customersError)
    return (
      <div className="p-8 text-center text-red-600">
        <p>เกิดข้อผิดพลาดในการโหลดรายชื่อลูกค้า</p>
        <p className="text-sm">{customersError.message}</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        แก้ไขใบแจ้งหนี้ #{invoice.invoice_number}
      </h1>
      <InvoiceForm
        customers={customers || []}
        products={[]} // ในอนาคตสามารถดึงข้อมูลสินค้ามาใส่ที่นี่ได้
        invoice={invoice}
      />
    </div>
  )
}
