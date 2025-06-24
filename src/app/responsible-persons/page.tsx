import { createClient } from "@/lib/supabase/server"
import ResponsiblePersonClientPage from "./ResponsiblePersonClientPage"

export default async function ResponsiblePersonsPage() {
  const supabase = await createClient()

  const { data: persons, error } = await supabase
    .from("responsible_persons")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return <p className="p-8">เกิดข้อผิดพลาดในการโหลดข้อมูล: {error.message}</p>
  }

  return <ResponsiblePersonClientPage initialPersons={persons || []} />
}
