/**
 * DeleteButton Component - ปุ่มลบพนักงาน
 *
 * คอมโพเนนต์สำหรับลบข้อมูลพนักงานโดยมีการยืนยันก่อนลบ
 * เพื่อป้องกันการลบข้อมูลโดยไม่ตั้งใจ
 *
 * @param employeeId - รหัสพนักงานที่ต้องการลบ
 *
 * การทำงาน:
 * 1. แสดงปุ่มลบสีแดง (destructive variant)
 * 2. เมื่อคลิกจะเปิด AlertDialog เพื่อยืนยันการลบ
 * 3. ถ้าผู้ใช้กดยืนยัน จะเรียกใช้ Server Action deleteEmployee
 * 4. หลังจากลบสำเร็จจะนำไปยังหน้ารายการพนักงาน
 *
 * หมายเหตุ: การกระทำนี้ไม่สามารถย้อนกลับได้ และอาจส่งผลกระทบต่อข้อมูลที่เกี่ยวข้อง
 * เช่น ประวัติการลา, การยืมอุปกรณ์สำนักงาน ฯลฯ
 */
"use client"

import { deleteEmployee } from "../actions"
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

export default function DeleteButton({ employeeId }: { employeeId: number }) {
  // ผูก employeeId เข้ากับ Server Action เพื่อใช้กับ form action
  const deleteEmployeeWithId = deleteEmployee.bind(null, employeeId)

  return (
    <AlertDialog>
      {/* ปุ่มลบสีแดงที่จะเปิด Dialog ยืนยันการลบ */}
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 size={16} className="mr-2" />
          ลบ
        </Button>
      </AlertDialogTrigger>
      {/* Dialog แสดงข้อความยืนยันการลบ */}
      <AlertDialogContent>
        <form action={deleteEmployeeWithId}>
          <AlertDialogHeader>
            <AlertDialogTitle>คุณแน่ใจหรือไม่?</AlertDialogTitle>
            <AlertDialogDescription>
              การกระทำนี้ไม่สามารถย้อนกลับได้
              ระบบจะทำการลบข้อมูลพนักงานนี้อย่างถาวร
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* ปุ่มยกเลิกการลบ */}
            <AlertDialogCancel type="button">ยกเลิก</AlertDialogCancel>
            {/* ปุ่มยืนยันการลบ - จะ submit form และเรียก Server Action */}
            <AlertDialogAction asChild>
              <Button type="submit" variant="destructive">
                ยืนยันการลบ
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
