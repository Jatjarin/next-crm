/**
 * DeleteButton Component - ปุ่มลบใบเสนอราคา
 *
 * คอมโพเนนต์สำหรับลบใบเสนอราคาโดยมีการยืนยันก่อนลบ
 * เพื่อป้องกันการลบข้อมูลโดยไม่ตั้งใจ
 *
 * @param quotationId - รหัสใบเสนอราคาที่ต้องการลบ
 *
 * การทำงาน:
 * 1. แสดงปุ่มลบสีแดง (destructive variant)
 * 2. เมื่อคลิกจะเปิด AlertDialog เพื่อยืนยันการลบ
 * 3. ถ้าผู้ใช้กดยืนยัน จะเรียกใช้ Server Action deleteQuotation
 * 4. หลังจากลบสำเร็จจะนำไปยังหน้ารายการใบเสนอราคา
 *
 * หมายเหตุ: การกระทำนี้ไม่สามารถย้อนกลับได้
 */
"use client"

import { deleteQuotation } from "../actions"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
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

export default function DeleteButton({ quotationId }: { quotationId: number }) {
  const t = useTranslations("DeleteDialog")
  // ผูก quotationId เข้ากับ Server Action เพื่อใช้กับ form action
  const deleteQuotationWithId = deleteQuotation.bind(null, quotationId)

  return (
    <AlertDialog>
      {/* ปุ่มลบสีแดงที่จะเปิด Dialog ยืนยันการลบ */}
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 size={16} className="mr-2" />
          {t("deleteQuotation")}
        </Button>
      </AlertDialogTrigger>
      {/* Dialog แสดงข้อความยืนยันการลบ */}
      <AlertDialogContent>
        <form action={deleteQuotationWithId}>
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
