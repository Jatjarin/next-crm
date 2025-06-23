"use client"

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
  const deleteProductWithId = deleteProduct.bind(null, productId)

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 size={16} className="mr-2" />
          ลบสินค้า
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form action={deleteProductWithId}>
          <AlertDialogHeader>
            <AlertDialogTitle>คุณแน่ใจหรือไม่?</AlertDialogTitle>
            <AlertDialogDescription>
              การกระทำนี้ไม่สามารถย้อนกลับได้
              ระบบจะทำการลบข้อมูลสินค้านี้อย่างถาวร
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
