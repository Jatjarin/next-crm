"use client"

import { useState, useTransition } from "react"
import { updateEmployee } from "../actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil, Loader2 } from "lucide-react"

// Type Definitions
type Employee = {
  id: number
  full_name: string
  position: string | null
  start_date: string | null
}

interface Props {
  employee: Employee
}


export default function EditForm({ employee }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleFormSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateEmployee(employee.id, formData)
      if (result?.success) {
        alert("บันทึกข้อมูลพนักงานสำเร็จ!")
        setIsEditing(false) // ปิดฟอร์มเมื่อสำเร็จ
      } else {
        alert(`เกิดข้อผิดพลาด: ${result?.error}`)
      }
    })
  }

  if (!isEditing) {
    return (
      <div className="mt-6">
        <Button onClick={() => setIsEditing(true)}>
          <Pencil className="mr-2 h-4 w-4" />
          แก้ไขข้อมูลพนักงาน
        </Button>
      </div>
    )
  }

  return (
    <form action={handleFormSubmit}>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>แก้ไขข้อมูลพนักงาน</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="fullName">ชื่อ-นามสกุล</Label>
            <Input
              id="fullName"
              name="fullName"
              defaultValue={employee.full_name}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="position">ตำแหน่ง</Label>
            <Input
              id="position"
              name="position"
              defaultValue={employee.position ?? ""}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="startDate">วันเริ่มงาน</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={employee.start_date ?? ""}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsEditing(false)}
          >
            ยกเลิก
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            บันทึกการเปลี่ยนแปลง
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
