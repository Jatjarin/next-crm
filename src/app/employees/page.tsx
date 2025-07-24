import { createClient } from "@/lib/supabase/server"
import EmployeeClientPage from "./EmployeeClientPage"

export default async function EmployeesPage() {
  const supabase = await createClient()

  const { data: employees, error } = await supabase
    .from("employees")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return (
      <p className="p-8">
        เกิดข้อผิดพลาดในการโหลดข้อมูลพนักงาน: {error.message}
      </p>
    )
  }

  return <EmployeeClientPage initialEmployees={employees || []} />
}
