import { createClient } from "@/lib/supabase/server"
import {
  Card,
  CardContent,
  //CardDescription,
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
import Link from "next/link"

// --- Type Definitions ---
// More flexible type that can handle both object and array responses
type SupabaseLeaveRequest = {
  id: number
  start_date: string
  days_taken: number
  reason: string | null
  employees:
    | {
        full_name: string
        id: number
      }
    | {
        full_name: string
        id: number
      }[]
    | null
  leave_types:
    | {
        name: string
      }
    | {
        name: string
      }[]
    | null
}

// Processed type for our component
type LeaveRequest = {
  id: number
  start_date: string
  days_taken: number
  reason: string | null
  employees: {
    full_name: string
    id: number
  } | null
  leave_types: {
    name: string
  } | null
}

// --- Helper Functions ---
const formatDate = (dateString: string | null) => {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Transform Supabase result to our expected format
const transformLeaveRequest = (request: SupabaseLeaveRequest): LeaveRequest => {
  console.log("Transforming request:", request)

  // Handle employees - could be object, array, or null
  let employees = null
  if (request.employees) {
    if (Array.isArray(request.employees)) {
      employees = request.employees.length > 0 ? request.employees[0] : null
    } else {
      employees = request.employees
    }
  }

  // Handle leave_types - could be object, array, or null
  let leave_types = null
  if (request.leave_types) {
    if (Array.isArray(request.leave_types)) {
      leave_types =
        request.leave_types.length > 0 ? request.leave_types[0] : null
    } else {
      leave_types = request.leave_types
    }
  }

  return {
    id: request.id,
    start_date: request.start_date,
    days_taken: request.days_taken,
    reason: request.reason,
    employees,
    leave_types,
  }
}

export default async function LeaveHistoryPage() {
  const supabase = await createClient()

  // ดึงข้อมูลประวัติการลาทั้งหมด พร้อมข้อมูลพนักงานและประเภทการลาที่เกี่ยวข้อง
  const { data: leaveRequests, error } = await supabase
    .from("leave_requests")
    .select(
      `
        id,
        start_date,
        days_taken,
        reason,
        employees ( id, full_name ),
        leave_types ( name )
    `
    )
    .order("start_date", { ascending: false })

  if (error) {
    return <p className="p-8">เกิดข้อผิดพลาดในการโหลดข้อมูล: {error.message}</p>
  }

  // Debug: Log the raw data to see the actual structure
  console.log("Raw leaveRequests:", JSON.stringify(leaveRequests, null, 2))

  // Transform the data to match our expected types
  const typedLeaveRequests: LeaveRequest[] = (leaveRequests || []).map(
    transformLeaveRequest
  )

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">ประวัติการลา</h1>
        <p className="text-muted-foreground">
          รายการบันทึกการลาทั้งหมดของพนักงานในระบบ
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ประวัติการลาทั้งหมด</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>วันที่ลา</TableHead>
                <TableHead>พนักงาน</TableHead>
                <TableHead>ประเภทการลา</TableHead>
                <TableHead className="text-right">จำนวนวัน</TableHead>
                <TableHead>เหตุผล</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {typedLeaveRequests.length > 0 ? (
                typedLeaveRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{formatDate(request.start_date)}</TableCell>
                    <TableCell className="font-medium">
                      {request.employees ? (
                        <Link
                          href={`/employees/${request.employees.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {request.employees.full_name}
                        </Link>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>{request.leave_types?.name}</TableCell>
                    <TableCell className="text-right">
                      {request.days_taken} วัน
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {request.reason || "-"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    ยังไม่มีประวัติการลา
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
