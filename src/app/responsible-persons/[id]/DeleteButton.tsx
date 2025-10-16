/**
 * DeleteButton Component - ปุ่มลบผู้รับผิดชอบ
 *
 * คอมโพเนนต์สำหรับลบข้อมูลผู้รับผิดชอบโดยมีการยืนยันก่อนลบ
 * เพื่อป้องกันการลบข้อมูลโดยไม่ตั้งใจ
 *
 * @param personId - รหัสผู้รับผิดชอบที่ต้องการลบ
 *
 * การทำงาน:
 * 1. แสดงปุ่มลบสีแดง (destructive variant)
 * 2. เมื่อคลิกจะเปิด AlertDialog เพื่อยืนยันการลบ
 * 3. ถ้าผู้ใช้กดยืนยัน จะเรียกใช้ Server Action deleteResponsiblePerson
 * 4. หลังจากลบสำเร็จจะนำไปยังหน้ารายการผู้รับผิดชอบ
 *
 * หมายเหตุ: การกระทำนี้ไม่สามารถย้อนกลับได้ และอาจส่งผลกระทบต่อข้อมูลลูกค้าที่เกี่ยวข้อง
 */
"use client"

import { deleteResponsiblePerson } from "../actions"
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

export default function DeleteButton({ personId }: { personId: number }) {
  // ผูก personId เข้ากับ Server Action เพื่อใช้กับ form action
  const deletePersonWithId = deleteResponsiblePerson.bind(null, personId)

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
        <form action={deletePersonWithId}>
          <AlertDialogHeader>
            <AlertDialogTitle>คุณแน่ใจหรือไม่?</AlertDialogTitle>
            <AlertDialogDescription>
              การกระทำนี้ไม่สามารถย้อนกลับได้
              ระบบจะทำการลบข้อมูลผู้รับผิดชอบนี้อย่างถาวร
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
