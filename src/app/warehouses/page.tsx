import { createClient } from "@/lib/supabase/server"
import WarehouseClientPage from "./WarehouseClientPage"

export default async function WarehousesPage() {
  const supabase = await createClient()

  const { data: warehouses, error } = await supabase
    .from("warehouses")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    return <p className="p-8">เกิดข้อผิดพลาดในการโหลดข้อมูล: {error.message}</p>
  }

  return <WarehouseClientPage initialWarehouses={warehouses || []} />
}
