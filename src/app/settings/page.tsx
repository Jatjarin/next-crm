"use client"

import { useState, useEffect, useTransition } from "react"
import { createClient } from "@/lib/supabase/client" // ใช้ client component
import { updateSettings, uploadLogo } from "./actions"
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
import Image from "next/image"

// Type definition for settings
type Settings = {
  id: number
  company_name: string
  company_address: string
  logo_url: string
}

export default function SettingsPage() {
  const supabase = createClient()
  const [settings, setSettings] = useState<Settings | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("id", 1)
        .single()

      if (data) {
        setSettings(data)
        if (data.logo_url) {
          // สร้าง Public URL สำหรับโลโก้
          const {
            data: { publicUrl },
          } = supabase.storage.from("logos").getPublicUrl(data.logo_url)
          setLogoPreview(publicUrl)
        }
      }
    }
    fetchSettings()
  }, [supabase])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleFormSubmit = async (formData: FormData) => {
    startTransition(async () => {
      let logoPath = settings?.logo_url || ""

      // 1. ถ้ามีการเลือกไฟล์โลโก้ใหม่ ให้อัปโหลดก่อน
      if (logoFile) {
        const uploadFormData = new FormData()
        uploadFormData.append("logo", logoFile)
        const result = await uploadLogo(uploadFormData)

        if (result.error) {
          alert(`Upload failed: ${result.error}`)
          return
        }
        if (result.filePath) {
          logoPath = result.filePath
        }
      }

      // 2. เพิ่ม path ของโลโก้ลงใน formData ก่อนส่งไปอัปเดต
      formData.set("logoUrl", logoPath)

      // 3. เรียกใช้ action เพื่ออัปเดตข้อมูล
      const result = await updateSettings(formData)
      if (result.success) {
        alert("บันทึกการตั้งค่าสำเร็จ!")
      } else {
        alert(`เกิดข้อผิดพลาด: ${result.error}`)
      }
    })
  }

  if (!settings) {
    return (
      <div className="p-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
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
            <div className="space-y-2">
              <Label htmlFor="logo">โลโก้บริษัท</Label>
              {logoPreview && (
                <div className="mt-2">
                  <Image
                    src={logoPreview}
                    alt="Logo Preview"
                    width={150}
                    height={150}
                    className="object-contain border rounded-md"
                  />
                </div>
              )}
              <Input
                id="logo"
                name="logo"
                type="file"
                onChange={handleFileChange}
                accept="image/png, image/jpeg"
              />
              <p className="text-sm text-muted-foreground">
                แนะนำให้ใช้ไฟล์ .png พื้นหลังโปร่งใส
              </p>
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
