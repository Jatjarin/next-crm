"use client"

import { useState, useEffect, useTransition } from "react"
import { addProduct } from "./actions"
import { Plus, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation" // 1. Import useRouter

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Product = {
  id: number
  name: string
  description: string | null
  price: number
  stock_quantity: number // เพิ่ม field สต็อก
  width: number | null
  length: number | null
  thickness: number | null
}

interface Props {
  initialProducts: Product[]
}

export default function ProductClientPage({ initialProducts }: Props) {
  const [products, setProducts] = useState(initialProducts)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter() // 2. Initialize router

  useEffect(() => {
    setProducts(initialProducts)
  }, [initialProducts])

  const handleFormSubmit = (formData: FormData) => {
    startTransition(async () => {
      await addProduct(formData)
      setIsDialogOpen(false)
    })
  }

  // 3. สร้างฟังก์ชันสำหรับจัดการการคลิก
  const handleRowClick = (productId: number) => {
    router.push(`/products/${productId}`)
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">สินค้า</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={20} className="mr-2" /> เพิ่มสินค้าใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>เพิ่มสินค้า</DialogTitle>
              <DialogDescription>
                กรอกข้อมูลเพื่อเพิ่มรายการลงในระบบ
              </DialogDescription>
            </DialogHeader>
            <form action={handleFormSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    ชื่อ
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    คำอธิบาย
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {/* Corrected Order: Thickness, Width, Length */}
                  <div className="space-y-2">
                    <Label htmlFor="thickness">ความหนา (มม.)</Label>
                    <Input
                      id="thickness"
                      name="thickness"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      defaultValue={0}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="width">ความกว้าง (มม.)</Label>
                    <Input
                      id="width"
                      name="width"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      defaultValue={0}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="length">ความยาว (ม.)</Label>
                    <Input
                      id="length"
                      name="length"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      defaultValue={0}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    ราคา
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={0}
                    className="col-span-3"
                    required
                  />
                </div>
                {/* --- เพิ่มช่องกรอกสต็อก --- */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock_quantity" className="text-right">
                    จำนวนในสต็อก
                  </Label>
                  <Input
                    id="stock_quantity"
                    name="stock_quantity"
                    className="col-span-3"
                    type="number"
                    defaultValue={0}
                    required
                  />
                </div>
                {/* New Field for Low Stock Threshold */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="low_stock_threshold" className="text-right">
                    จุดสั่งซื้อขั้นต่ำ
                  </Label>
                  <Input
                    id="low_stock_threshold"
                    name="low_stock_threshold"
                    className="col-span-3"
                    type="number"
                    defaultValue={0}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  บันทึก
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการสินค้าทั้งหมด</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อสินค้า/บริการ</TableHead>
                <TableHead>ขนาด (นxกxย) มม.</TableHead>{" "}
                {/* Corrected: Added this header */}
                <TableHead>คำอธิบาย</TableHead>
                <TableHead className="text-right">จำนวน</TableHead>
                <TableHead className="text-right">ราคา</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                // 4. เพิ่ม onClick และ className ให้กับ TableRow
                <TableRow
                  key={product.id}
                  className="cursor-pointer"
                  onClick={() => handleRowClick(product.id)}
                >
                  <TableCell className="font-medium">{product.name}</TableCell>
                  {/* Corrected: Added this cell to display dimensions */}
                  <TableCell className="text-muted-foreground">
                    {`${product.thickness ?? "-"} x ${product.width ?? "-"} x ${
                      product.length ?? "-"
                    }`}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.description}
                  </TableCell>
                  {/* --- เพิ่มการแสดงผลสต็อก --- */}
                  <TableCell className="text-center">
                    {product.stock_quantity}
                  </TableCell>
                  <TableCell className="text-right">
                    ฿
                    {Number(product.price).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
