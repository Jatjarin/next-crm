"use client"

import { useState } from "react"
import { updateResponsiblePerson } from "../actions"
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
import { Pencil } from "lucide-react"

type Person = {
  id: number
  name: string
  email: string | null
  phone: string | null
}

interface Props {
  person: Person
}

export default function EditForm({ person }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const updatePersonWithId = updateResponsiblePerson.bind(null, person.id)

  if (!isEditing) {
    return (
      <div className="mt-6">
        <Button onClick={() => setIsEditing(true)}>
          <Pencil className="mr-2 h-4 w-4" />
          แก้ไขข้อมูล
        </Button>
      </div>
    )
  }

  return (
    <form action={updatePersonWithId}>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>แก้ไขข้อมูลผู้รับผิดชอบ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">ชื่อ-นามสกุล</Label>
            <Input id="name" name="name" defaultValue={person.name} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">อีเมล</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={person.email ?? ""}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone">เบอร์โทร</Label>
            <Input id="phone" name="phone" defaultValue={person.phone ?? ""} />
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
          <Button type="submit">บันทึกการเปลี่ยนแปลง</Button>
        </CardFooter>
      </Card>
    </form>
  )
}
