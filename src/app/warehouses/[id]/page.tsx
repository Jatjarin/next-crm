import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import WarehouseDetailPageClient from "./WarehouseDetailPageClient" // We will create this next

// type Props = {
//   params: { id: string }
// }
export default async function WarehouseDetailPage(props: {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Await params เพื่อดึงค่า id ออกมา
  const params = await props.params
  const { id } = params

  const supabase = await createClient()

  // Fetch warehouse details and the products within it in parallel
  const [warehouseRes, inventoryRes] = await Promise.all([
    supabase.from("warehouses").select("*").eq("id", id).single(),
    supabase
      .from("product_inventories")
      .select(
        `
        quantity,
        products (
          id,
          name,
          description,
          price
        )
      `
      )
      .eq("warehouse_id", id)
      .order("quantity", { ascending: false }),
  ])

  const { data: warehouse, error: warehouseError } = warehouseRes
  const { data: inventory, error: inventoryError } = inventoryRes

  if (warehouseError || !warehouse || inventoryError) {
    console.error({ warehouseError, inventoryError })
    notFound()
  }

  // The query returns `products` as an object, so we need to process the data
  const productsInWarehouse = inventory
    .map((item) => {
      // Ensure that item.products is not null before processing
      if (!item.products) {
        return null
      }
      return {
        ...(item.products as unknown as {
          id: number
          name: string
          description: string | null
          price: number
        }),
        quantity: item.quantity,
      }
    })
    .filter(Boolean) as {
    id: number
    name: string
    description: string | null
    price: number
    quantity: number
  }[]

  return (
    <WarehouseDetailPageClient
      warehouse={warehouse}
      productsInWarehouse={productsInWarehouse}
    />
  )
}
