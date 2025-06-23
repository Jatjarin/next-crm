import { createClient } from "@/lib/supabase/server"
import ProductClientPage from "./ProductClientPage"

export default async function ProductsPage() {
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products:", error)
    return <p className="p-8">เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า</p>
  }

  return <ProductClientPage initialProducts={products || []} />
}
