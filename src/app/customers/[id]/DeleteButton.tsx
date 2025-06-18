"use client"

import { deleteCustomer } from "../actions"
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

export default function DeleteButton({ customerId }: { customerId: number }) {
  const deleteCustomerWithId = deleteCustomer.bind(null, customerId)

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 size={16} className="mr-2" />
          ลบลูกค้า
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form action={deleteCustomerWithId}>
          <AlertDialogHeader>
            <AlertDialogTitle>คุณแน่ใจหรือไม่?</AlertDialogTitle>
            <AlertDialogDescription>
              การกระทำนี้ไม่สามารถย้อนกลับได้
              ระบบจะทำการลบข้อมูลลูกค้าและใบแจ้งหนี้ทั้งหมดที่เกี่ยวข้องอย่างถาวร
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">ยกเลิก</AlertDialogCancel>
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
