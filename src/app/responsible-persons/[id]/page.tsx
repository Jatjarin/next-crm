import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import EditForm from "./EditForm"
import DeleteButton from "./DeleteButton"
import {
  Card,
  CardContent,
  //CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

// type Props = {
//   params: { id: string }
// }

export default async function ResponsiblePersonDetailPage(props: {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Await params เพื่อดึงค่า id ออกมา
  const params = await props.params
  const { id } = params

  const supabase = await createClient()
  const { data: person, error } = await supabase
    .from("responsible_persons")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !person) {
    notFound()
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Link
            href="/responsible-persons"
            className="text-sm text-muted-foreground hover:underline flex items-center mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับไปหน้ารายชื่อผู้รับผิดชอบ
          </Link>
          <h1 className="text-3xl font-bold">{person.name}</h1>
        </div>
        <DeleteButton personId={person.id} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลการติดต่อ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium text-gray-500">อีเมล</p>
            <p className="text-lg font-semibold">{person.email || "-"}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500">เบอร์โทร</p>
            <p className="text-lg font-semibold">{person.phone || "-"}</p>
          </div>
        </CardContent>
      </Card>

      <EditForm person={person} />
    </div>
  )
}
