"use client"

import { useState, useEffect, useTransition } from "react"
import { createClient } from "@/lib/supabase/client"
import { updateSettings } from "./actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

// Type definition for settings
type Settings = {
  id: number
  company_name: string
  company_address: string
}

export default function SettingsPage() {
  const supabase = createClient()
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("id", 1)
        .single()

      if (error) {
        console.error("Error fetching settings:", error)
      } else if (data) {
        setSettings(data)
      }
      setIsLoading(false)
    }
    fetchSettings()
  }, [supabase])

  const handleFormSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await updateSettings(formData)
      if (result.success) {
        alert("บันทึกการตั้งค่าสำเร็จ!")
      } else {
        alert(`เกิดข้อผิดพลาด: ${result.error}`)
      }
    })
  }

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="p-8 text-center">ไม่สามารถโหลดข้อมูลการตั้งค่าได้</div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">ตั้งค่าระบบ</h1>
      <form action={handleFormSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลบริษัท</CardTitle>
            <CardDescription>
              ข้อมูลนี้จะถูกนำไปใช้ในใบแจ้งหนี้และเอกสารอื่นๆ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">ชื่อบริษัท</Label>
              <Input
                id="companyName"
                name="companyName"
                defaultValue={settings.company_name}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyAddress">ที่อยู่บริษัท</Label>
              <Textarea
                id="companyAddress"
                name="companyAddress"
                defaultValue={settings.company_address}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              บันทึกการเปลี่ยนแปลง
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
