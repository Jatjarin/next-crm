/**
 * DeleteButton Component - ปุ่มลบลูกค้า
 *
 * คอมโพเนนต์สำหรับลบข้อมูลลูกค้าโดยมีการยืนยันก่อนลบ
 * เพื่อป้องกันการลบข้อมูลโดยไม่ตั้งใจ
 *
 * @param customerId - รหัสลูกค้าที่ต้องการลบ
 *
 * การทำงาน:
 * 1. แสดงปุ่มลบสีแดง (destructive variant)
 * 2. เมื่อคลิกจะเปิด AlertDialog เพื่อยืนยันการลบ
 * 3. ถ้าผู้ใช้กดยืนยัน จะเรียกใช้ Server Action deleteCustomer
 * 4. หลังจากลบสำเร็จจะนำไปยังหน้ารายการลูกค้า
 *
 * หมายเหตุ: การกระทำนี้ไม่สามารถย้อนกลับได้ และอาจส่งผลกระทบต่อเอกสารที่เกี่ยวข้อง
 */
"use client"

import { deleteCustomer } from "../actions"
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

export default function DeleteButton({ customerId }: { customerId: number }) {
  const t = useTranslations("DeleteDialog")
  // ผูก customerId เข้ากับ Server Action เพื่อใช้กับ form action
  const deleteCustomerWithId = deleteCustomer.bind(null, customerId)

  return (
    <AlertDialog>
      {/* ปุ่มลบสีแดงที่จะเปิด Dialog ยืนยันการลบ */}
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 size={16} className="mr-2" />
          {t("deleteCustomer")}
        </Button>
      </AlertDialogTrigger>
      {/* Dialog แสดงข้อความยืนยันการลบ */}
      <AlertDialogContent>
        <form action={deleteCustomerWithId}>
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
