import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import EditForm from "./EditForm"
import DeleteButton from "./DeleteButton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

type Props = {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ProductDetailPage(props: Props) {
  // Await params เพื่อดึงค่า id ออกมา
  const params = await props.params
  const { id } = params

  const supabase = await createClient()
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !product) {
    notFound()
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Link
            href="/products"
            className="text-sm text-muted-foreground hover:underline flex items-center mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับไปหน้ารายการสินค้า
          </Link>
          <h1 className="text-3xl font-bold">{product.name}</h1>
        </div>
        <DeleteButton productId={product.id} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายละเอียดสินค้า/บริการ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium text-gray-500">ราคา</p>
            <p className="text-xl font-semibold">
              ฿
              {Number(product.price).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-500">คำอธิบาย</p>
            <p>{product.description || "-"}</p>
          </div>
        </CardContent>
      </Card>

      <EditForm product={product} />
    </div>
  )
}
