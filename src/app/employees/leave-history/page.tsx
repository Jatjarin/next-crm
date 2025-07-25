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
// Raw type from Supabase query
type SupabaseLeaveRequest = {
  id: number
  start_date: string
  days_taken: number
  reason: string | null
  employees:
    | {
        full_name: string
        id: number
      }[]
    | null // Supabase returns arrays for joins
  leave_types:
    | {
        name: string
      }[]
    | null // Supabase returns arrays for joins
}
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

// interface PageProps {
//   params: Promise<{ id: string }>
//   searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
// }

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
const transformLeaveRequest = (
  request: SupabaseLeaveRequest
): LeaveRequest => ({
  id: request.id,
  start_date: request.start_date,
  days_taken: request.days_taken,
  reason: request.reason,
  employees: request.employees?.[0] || null, // Take first element from array
  leave_types: request.leave_types?.[0] || null, // Take first element from array
})

//export default async function LeaveHistoryPage({ params }: PageProps) {
//const { id } = await params
export default async function LeaveHistoryPage() {
  const supabase = await createClient()

  // export default async function LeaveHistoryPage() {
  //   const supabase = await createClient()

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
