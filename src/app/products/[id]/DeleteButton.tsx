/**
 * DeleteButton Component - ปุ่มลบสินค้า
 *
 * คอมโพเนนต์สำหรับลบข้อมูลสินค้าโดยมีการยืนยันก่อนลบ
 * เพื่อป้องกันการลบข้อมูลโดยไม่ตั้งใจ
 *
 * @param productId - รหัสสินค้าที่ต้องการลบ
 *
 * การทำงาน:
 * 1. แสดงปุ่มลบสีแดง (destructive variant)
 * 2. เมื่อคลิกจะเปิด AlertDialog เพื่อยืนยันการลบ
 * 3. ถ้าผู้ใช้กดยืนยัน จะเรียกใช้ Server Action deleteProduct
 * 4. หลังจากลบสำเร็จจะนำไปยังหน้ารายการสินค้า
 *
 * หมายเหตุ: การกระทำนี้ไม่สามารถย้อนกลับได้
 */
"use client"
import { useTranslations } from "next-intl"
import { deleteProduct } from "../actions"
import { Trash2 } from "lucide-react"
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

export default function DeleteButton({ productId }: { productId: number }) {
  // ผูก productId เข้ากับ Server Action เพื่อใช้กับ form action
  const deleteProductWithId = deleteProduct.bind(null, productId)
  const t = useTranslations("DeleteDialog")
  const tCommon = useTranslations("Common")
  return (
    <AlertDialog>
      {/* ปุ่มลบสีแดงที่จะเปิด Dialog ยืนยันการลบ */}
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 size={16} className="mr-2" />
          {t("deleteProduct")}
        </Button>
      </AlertDialogTrigger>
      {/* Dialog แสดงข้อความยืนยันการลบ */}
      <AlertDialogContent>
        <form action={deleteProductWithId}>
          <AlertDialogHeader>
            <AlertDialogTitle>{tCommon("areYouSure")}</AlertDialogTitle>
            <AlertDialogDescription>
              {tCommon("actionCannotBeUndone")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* ปุ่มยกเลิกการลบ */}
            <AlertDialogCancel type="button">
              {tCommon("cancel")}
            </AlertDialogCancel>
            {/* ปุ่มยืนยันการลบ - จะ submit form และเรียก Server Action */}
            <AlertDialogAction asChild>
              <Button type="submit" variant="destructive">
                {tCommon("confirmDelete")}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
