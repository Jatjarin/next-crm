"use client"

import { useState } from "react"
import { updateProduct } from "../actions"
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
import { Textarea } from "@/components/ui/textarea"
import { Pencil } from "lucide-react"

type Product = {
  id: number
  name: string
  description: string | null
  price: number
  stock_quantity: number // เพิ่ม field สต็อก
}

interface Props {
  product: Product
}

export default function EditForm({ product }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const updateProductWithId = updateProduct.bind(null, product.id)

  if (!isEditing) {
    return (
      <div className="mt-6">
        <Button onClick={() => setIsEditing(true)}>
          <Pencil className="mr-2 h-4 w-4" />
          แก้ไขข้อมูลสินค้า
        </Button>
      </div>
    )
  }

  return (
    <form action={updateProductWithId}>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>แก้ไขข้อมูลสินค้า</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">ชื่อสินค้า/บริการ</Label>
            <Input id="name" name="name" defaultValue={product.name} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="description">คำอธิบาย</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={product.description ?? ""}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="price">ราคา</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              defaultValue={product.price}
              required
            />
            {/* --- เพิ่มช่องแก้ไขสต็อก --- */}
            <div className="space-y-1">
              <Label htmlFor="stock_quantity">จำนวนในสต็อก</Label>
              <Input
                id="stock_quantity"
                name="stock_quantity"
                type="number"
                defaultValue={product.stock_quantity}
                required
              />
            </div>
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
