/**
 * UpdateStatusButton Component - ปุ่มอัปเดตสถานะใบแจ้งหนี้
 *
 * คอมโพเนนต์สำหรับเปลี่ยนสถานะของใบแจ้งหนี้ตามขั้นตอนการทำงาน:
 * - Draft (ฉบับร่าง) -> Sent (ส่งแล้ว) -> Paid (ชำระแล้ว)
 *
 * @param invoiceId - รหัสใบแจ้งหนี้ที่ต้องการอัปเดตสถานะ
 * @param currentStatus - สถานะปัจจุบันของใบแจ้งหนี้
 *
 * พฤติกรรม:
 * - ถ้าสถานะเป็น "Draft" จะแสดงปุ่ม "ส่งแล้ว"
 * - ถ้าสถานะเป็น "Sent" จะแสดงปุ่ม "ชำระแล้ว"
 * - ถ้าสถานะเป็น "Paid" จะแสดงข้อความยืนยันว่าชำระเงินเรียบร้อยแล้ว
 */
"use client"

import { updateInvoiceStatus } from "../actions"
import { useTransition } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, Send, Loader2 } from "lucide-react"

interface Props {
  invoiceId: number
  currentStatus: string
}

export default function UpdateStatusButton({
  invoiceId,
  currentStatus,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const t = useTranslations("UpdateStatusBUtton")

  /**
   * ฟังก์ชันจัดการการอัปเดตสถานะใบแจ้งหนี้
   *
   * @param newStatus - สถานะใหม่ที่ต้องการเปลี่ยน
   *
   * ขั้นตอนการทำงาน:
   * 1. เรียกใช้ Server Action updateInvoiceStatus
   * 2. ตรวจสอบผลลัพธ์จากการอัปเดต
   * 3. ถ้าสำเร็จจะ refresh หน้าเพื่อแสดงข้อมูลใหม่
   * 4. ถ้าไม่สำเร็จจะแสดงข้อความ error
   */
  const handleUpdateStatus = (newStatus: string) => {
    startTransition(async () => {
      const result = await updateInvoiceStatus(invoiceId, newStatus)
      if (result?.message === "Success") {
        router.refresh()
      } else {
        alert(result?.message || t("errorUpdate"))
      }
    })
  }

  // ถ้าสถานะเป็น "Paid" แสดงข้อความยืนยันว่าชำระเงินเรียบร้อยแล้ว
  // ไม่แสดงปุ่มเพราะไม่สามารถเปลี่ยนสถานะต่อได้
  if (currentStatus === "Paid") {
    return (
      <span className="text-green-600 font-bold flex items-center h-10 px-4">
        <CheckCircle size={20} className="mr-2" /> {t("paidSuccess")}
      </span>
    )
  }

  return (
    <div className="flex gap-2">
      {/* ถ้าสถานะเป็น "Draft" แสดงปุ่ม "ส่งแล้ว" เพื่อเปลี่ยนเป็นสถานะ "Sent" */}
      {currentStatus === "Draft" && (
        <Button onClick={() => handleUpdateStatus("Sent")} disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send size={16} className="mr-2" />
          )}
          {isPending ? t("saving") : t("sentSuccess")}
        </Button>
      )}
      {/* ถ้าสถานะไม่ใช่ "Draft" แสดงปุ่ม "ชำระแล้ว" เพื่อเปลี่ยนเป็นสถานะ "Paid" */}
      {currentStatus !== "Draft" && (
        <Button
          onClick={() => handleUpdateStatus("Paid")}
          disabled={isPending}
          variant="success"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle size={16} className="mr-2" />
          )}
          {isPending ? t("saving") : t("paid")}
        </Button>
      )}
    </div>
  )
}
