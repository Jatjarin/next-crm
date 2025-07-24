import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import EditForm from "./EditForm"
import RecordLeaveButton from "./RecordLeaveButton" // Import ปุ่มบันทึกการลา
import DeleteButton from "./DeleteButton"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// --- Type Definitions ---
type Employee = {
  id: number
  full_name: string
  position: string | null
  start_date: string | null
}
type LeaveBalance = {
  id: number
  remaining_days: number
  leave_types: {
    id: number
    name: string
    default_days_per_year: number
  } | null
}

export default async function EmployeeDetailPage(props: {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Await params เพื่อดึงค่า id ออกมา
  const params = await props.params
  const { id } = params

  //export default async function EmployeeDetailPage({ params }: Props) {
  const supabase = await createClient()

  // ดึงข้อมูลพนักงานและยอดวันลาคงเหลือพร้อมกัน
  const [employeeRes, leaveBalancesRes] = await Promise.all([
    supabase.from("employees").select("*").eq("id", params.id).single(),
    supabase
      .from("leave_balances")
      .select("id, remaining_days, leave_types(name, default_days_per_year)")
      .eq("employee_id", id),
  ])

  const { data: employee, error: employeeError } = employeeRes
  const { data: leaveBalancesData, error: leaveBalancesError } =
    leaveBalancesRes

  if (employeeError || !employee) {
    notFound()
  }

  // Cast ข้อมูล leaveBalances ให้มี Type ที่ถูกต้อง
  const leaveBalances = (leaveBalancesData || []) as LeaveBalance[]

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Link
            href="/employees"
            className="text-sm text-muted-foreground hover:underline flex items-center mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับไปหน้ารายชื่อพนักงาน
          </Link>
          <h1 className="text-3xl font-bold">{employee.full_name}</h1>
          <p className="text-muted-foreground">
            {employee.position || "ไม่มีข้อมูลตำแหน่ง"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RecordLeaveButton
            employeeId={employee.id}
            leaveBalances={leaveBalances}
          />
          <DeleteButton employeeId={employee.id} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลพนักงาน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium text-gray-500">วันเริ่มงาน</p>
              <p className="text-lg font-semibold">
                {formatDate(employee.start_date)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ยอดวันลา</CardTitle>
            <CardDescription>สรุปจำนวนวันลาในปีนี้</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ประเภทการลา</TableHead>
                  <TableHead className="text-right">วันลาที่ได้รับ</TableHead>
                  <TableHead className="text-right">วันลาคงเหลือ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveBalances.length > 0 ? (
                  leaveBalances.map((balance) => (
                    <TableRow key={balance.id}>
                      <TableCell className="font-medium">
                        {balance.leave_types?.name}
                      </TableCell>
                      <TableCell className="text-right">
                        {balance.leave_types?.default_days_per_year} วัน
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {balance.remaining_days} วัน
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-muted-foreground"
                    >
                      ไม่พบข้อมูลวันลา
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <EditForm employee={employee as Employee} />
    </div>
  )
}
