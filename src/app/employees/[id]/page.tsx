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

type SupabaseLeaveBalance = {
  id: number
  remaining_days: number
  leave_type_id?: number
  // Supabase might return this as either an object or array depending on the relationship
  leave_types:
    | {
        id: number
        name: string
        default_days_per_year: number
      }
    | {
        id: number
        name: string
        default_days_per_year: number
      }[]
    | null
}

type LeaveBalance = {
  id: number
  remaining_days: number
  leave_type_id?: number
  // Our normalized version - always a single object
  leave_types: {
    id: number
    name: string
    default_days_per_year: number
  } | null
}

// Type for transformed leave balance (to match RecordLeaveButton expectation)
type TransformedLeaveBalance = {
  id: number
  remaining_days: number
  leave_types: {
    id: number
    name: string
    default_days_per_year: number
  } | null
}

// --- Define Props interface for better type safety ---
interface PageProps {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function EmployeeDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // ดึงข้อมูลพนักงานและยอดวันลาคงเหลือพร้อมกัน
  const [employeeRes, leaveBalancesRes] = await Promise.all([
    supabase.from("employees").select("*").eq("id", id).single(),
    supabase
      .from("leave_balances")
      .select(
        "id, remaining_days, leave_type_id, leave_types(id, name, default_days_per_year)"
      )
      .eq("employee_id", id),
  ])

  const { data: employee, error: employeeError } = employeeRes
  const { data: leaveBalancesData, error: leaveBalancesError } =
    leaveBalancesRes

  if (employeeError || !employee) {
    notFound()
  }
  if (leaveBalancesError || !leaveBalancesData) {
    console.error("Leave balances error:", leaveBalancesError)
    notFound()
  }

  // Cast ข้อมูล leaveBalances ให้มี Type ที่ถูกต้อง และ normalize ข้อมูล
  const rawLeaveBalances = (leaveBalancesData || []) as SupabaseLeaveBalance[]

  // Normalize the data - handle both array and object cases
  const leaveBalances: LeaveBalance[] = rawLeaveBalances.map((balance) => ({
    id: balance.id,
    remaining_days: balance.remaining_days,
    leave_type_id: balance.leave_type_id,
    leave_types: Array.isArray(balance.leave_types)
      ? balance.leave_types.length > 0
        ? balance.leave_types[0]
        : null
      : balance.leave_types,
  }))

  // Debug: Log the data to see what we're getting
  console.log("Leave balances data:", JSON.stringify(leaveBalances, null, 2))

  // Transform leaveBalances to match RecordLeaveButton's expected type
  const transformedLeaveBalances: TransformedLeaveBalance[] = leaveBalances.map(
    (balance) => ({
      id: balance.id,
      remaining_days: balance.remaining_days,
      leave_types: balance.leave_types || null,
    })
  )

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
            leaveBalances={transformedLeaveBalances}
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
            {/* Debug section - remove this after fixing */}
            <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
              <strong>Debug:</strong> Found {leaveBalances.length} leave balance
              records
            </div>

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
                  leaveBalances.map((balance) => {
                    // Since Supabase returns the joined 'leave_types' as a single object
                    const leaveType = balance.leave_types

                    // Debug info for each row
                    console.log(`Balance ${balance.id}:`, {
                      leave_types: balance.leave_types,
                      leaveType,
                      leave_type_id: balance.leave_type_id,
                    })

                    return (
                      <TableRow key={balance.id}>
                        <TableCell className="font-medium">
                          {leaveType?.name ??
                            `N/A (ID: ${balance.leave_type_id || "unknown"})`}
                        </TableCell>
                        <TableCell className="text-right">
                          {leaveType
                            ? `${leaveType.default_days_per_year} วัน`
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {balance.remaining_days} วัน
                        </TableCell>
                      </TableRow>
                    )
                  })
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
