"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeft } from "lucide-react"

type Warehouse = {
  id: number
  name: string
  address: string | null
}

type ProductInWarehouse = {
  id: number
  name: string
  description: string | null
  price: number
  quantity: number
}

interface Props {
  warehouse: Warehouse
  productsInWarehouse: ProductInWarehouse[]
}

export default function WarehouseDetailPageClient({
  warehouse,
  productsInWarehouse,
}: Props) {
  const router = useRouter()

  const handleRowClick = (productId: number) => {
    router.push(`/products/${productId}`)
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <Link
          href="/warehouses"
          className="text-sm text-muted-foreground hover:underline flex items-center mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          กลับไปหน้ารายการคลังสินค้า
        </Link>
        <h1 className="text-3xl font-bold">{warehouse.name}</h1>
        <p className="text-muted-foreground">
          {warehouse.address || "ไม่มีข้อมูลที่อยู่"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>สินค้าในคลังนี้</CardTitle>
          <CardDescription>
            รายการสินค้าทั้งหมดที่จัดเก็บใน {warehouse.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อสินค้า</TableHead>
                <TableHead>คำอธิบาย</TableHead>
                <TableHead className="text-right">จำนวนคงเหลือ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productsInWarehouse.length > 0 ? (
                productsInWarehouse.map((product) => (
                  <TableRow
                    key={product.id}
                    className="cursor-pointer"
                    onClick={() => handleRowClick(product.id)}
                  >
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground truncate max-w-xs">
                      {product.description || "-"}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {product.quantity} ชิ้น
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground h-24"
                  >
                    ไม่พบสินค้าในคลังนี้
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
