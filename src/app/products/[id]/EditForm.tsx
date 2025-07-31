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
  low_stock_threshold: number // Add new field to type
  width: number | null
  length: number | null
  thickness: number | null
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
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="thickness">ความหนา (มม.)</Label>
              <Input
                id="thickness"
                name="thickness"
                type="number"
                step="0.01"
                defaultValue={product.thickness ?? 0}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="width">ความกว้าง (มม.)</Label>
              <Input
                id="width"
                name="width"
                type="number"
                step="0.01"
                defaultValue={product.width ?? 0}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="length">ความยาว (ม.)</Label>
              <Input
                id="length"
                name="length"
                type="number"
                step="0.01"
                defaultValue={product.length ?? 0}
              />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
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
            </div>
            <div className="space-y-1">
              <Label htmlFor="stock_quantity">จำนวนในสต็อก</Label>
              <Input
                id="stock_quantity"
                name="stock_quantity"
                type="number"
                defaultValue={product.stock_quantity}
                readOnly // Make this read-only as it's calculated automatically
                className="bg-gray-100"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="low_stock_threshold">จุดสั่งซื้อขั้นต่ำ</Label>
              <Input
                id="low_stock_threshold"
                name="low_stock_threshold"
                type="number"
                defaultValue={product.low_stock_threshold}
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
