/**
 * ConvertToInvoiceButton Component - ปุ่มแปลงใบเสนอราคาเป็นใบแจ้งหนี้
 *
 * คอมโพเนนต์สำหรับแปลงใบเสนอราคาที่อนุมัติแล้วให้เป็นใบแจ้งหนี้
 * โดยจะคัดลอกข้อมูลทั้งหมดจากใบเสนอราคาไปยังใบแจ้งหนี้ใหม่
 *
 * @param quotationId - รหัสใบเสนอราคาที่ต้องการแปลง
 *
 * การทำงาน:
 * 1. แสดง confirmation dialog ให้ผู้ใช้ยืนยัน
 * 2. เรียกใช้ Server Action createInvoiceFromQuotation
 * 3. คัดลอกข้อมูลลูกค้า รายการสินค้า และรายละเอียดอื่นๆ
 * 4. นำทางไปยังหน้าใบแจ้งหนี้ใหม่ที่สร้างขึ้น
 *
 * หมายเหตุ: ปุ่มนี้มักจะแสดงเฉพาะเมื่อใบเสนอราคามีสถานะ "Accepted"
 */
"use client"

import { createInvoiceFromQuotation } from "@/app/invoices/actions"
import { Button } from "@/components/ui/button"
import { FilePlus2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useTransition } from "react"

interface Props {
  quotationId: number
}

export default function ConvertToInvoiceButton({ quotationId }: Props) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const t = useTranslations("ConvertToInvoiceButton")

  /**
   * ฟังก์ชันจัดการการแปลงใบเสนอราคาเป็นใบแจ้งหนี้
   *
   * ขั้นตอนการทำงาน:
   * 1. แสดง confirmation dialog ให้ผู้ใช้ยืนยันการแปลง
   * 2. เรียกใช้ Server Action เพื่อสร้างใบแจ้งหนี้ใหม่
   * 3. ถ้าสำเร็จ นำทางไปยังหน้ารายละเอียดของใบแจ้งหนี้ใหม่
   * 4. ถ้าไม่สำเร็จ แสดงข้อความ error
   */
  const handleConvert = () => {
    // ขอยืนยันจากผู้ใช้ก่อนดำเนินการแปลง
    if (!confirm("คุณต้องการแปลงใบเสนอราคานี้เป็นใบแจ้งหนี้ใช่หรือไม่?")) {
      return
    }

    startTransition(async () => {
      const result = await createInvoiceFromQuotation(quotationId)
      if (result.success && result.newInvoiceId) {
        // สำเร็จ: นำทางไปยังหน้าใบแจ้งหนี้ที่เพิ่งสร้าง
        router.push(`/invoices/${result.newInvoiceId}`)
      } else {
        // ไม่สำเร็จ: แสดงข้อความ error
        alert(`เกิดข้อผิดพลาด: ${result.error}`)
      }
    })
  }

  return (
    <Button onClick={handleConvert} disabled={isPending} variant="success">
      {/* แสดงไอคอน Loading ขณะกำลังแปลงเอกสาร */}
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FilePlus2 className="mr-2 h-4 w-4" />
      )}
      {/* แสดงข้อความตามสถานะการทำงาน */}
      {isPending ? t("convertToInvoiceStatus") : t("convertToInvoice")}
    </Button>
  )
}
