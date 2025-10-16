/**
 * DeleteInvoiceButton Component - ปุ่มลบใบแจ้งหนี้
 *
 * คอมโพเนนต์สำหรับลบใบแจ้งหนี้โดยมีการยืนยันก่อนลบ
 * เพื่อป้องกันการลบข้อมูลโดยไม่ตั้งใจ
 *
 * @param invoiceId - รหัสใบแจ้งหนี้ที่ต้องการลบ
 *
 * การทำงาน:
 * 1. แสดงปุ่มลบสีแดง (destructive variant)
 * 2. เมื่อคลิกจะเปิด AlertDialog เพื่อยืนยันการลบ
 * 3. ถ้าผู้ใช้กดยืนยัน จะเรียกใช้ Server Action deleteInvoice
 * 4. หลังจากลบสำเร็จจะนำไปยังหน้ารายการใบแจ้งหนี้
 *
 * หมายเหตุ: การกระทำนี้ไม่สามารถย้อนกลับได้
 */
"use client"

import { deleteInvoice } from "../actions"
import { Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
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

export default function DeleteInvoiceButton({
  invoiceId,
}: {
  invoiceId: number
}) {
  // ผูก invoiceId เข้ากับ Server Action เพื่อใช้กับ form action
  const deleteInvoiceWithId = deleteInvoice.bind(null, invoiceId)
  const t = useTranslations("DeleteDialog")
  return (
    <AlertDialog>
      {/* ปุ่มลบสีแดงที่จะเปิด Dialog ยืนยันการลบ */}
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 size={16} className="mr-2" />
          {t("deleteInvoice")}
        </Button>
      </AlertDialogTrigger>
      {/* Dialog แสดงข้อความยืนยันการลบ */}
      <AlertDialogContent>
        <form action={deleteInvoiceWithId}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("description")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* ปุ่มยกเลิกการลบ */}
            <AlertDialogCancel type="button">{t("cancel")}</AlertDialogCancel>
            {/* ปุ่มยืนยันการลบ - จะ submit form และเรียก Server Action */}
            <AlertDialogAction asChild>
              <Button type="submit" variant="destructive">
                {t("confirm")}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
