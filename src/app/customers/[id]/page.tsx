import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import EditForm from "./EditForm"
import DeleteButton from "./DeleteButton"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default async function CustomerDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: customer, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", params.id)
    .single()

  if (error || !customer) {
    notFound()
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Link
            href="/customers"
            className="text-sm text-muted-foreground hover:underline flex items-center mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับไปหน้ารายชื่อลูกค้า
          </Link>
          <h1 className="text-3xl font-bold">{customer.name}</h1>
          <p className="text-muted-foreground">
            ผู้รับผิดชอบ: {customer.responsible_person || "-"}
          </p>
        </div>
        <DeleteButton customerId={customer.id} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลติดต่อ</CardTitle>
          <CardDescription>
            รายละเอียดการติดต่อและข้อมูลทางภาษีของลูกค้า
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-500">
                เลขประจำตัวผู้เสียภาษี
              </p>
              <p>{customer.tax_id || "-"}</p>
            </div>
            <div>
              <p className="font-medium text-gray-500">เบอร์โทร</p>
              <p>{customer.phone || "-"}</p>
            </div>
            <div>
              <p className="font-medium text-gray-500">LINE ID</p>
              <p>{customer.line_id || "-"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="font-medium text-gray-500">ที่อยู่</p>
              <p>{customer.address || "-"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditForm customer={customer} />
    </div>
  )
}
