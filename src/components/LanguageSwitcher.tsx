"use client"

//import { useLocale } from "next-intl"
import { useRouter } from "next/navigation" // ใช้ hook มาตรฐานจาก Next.js
import { useEffect, useState, useTransition } from "react"
//import { switchLocale } from "@/app/actions" // Import Server Action ที่เราสร้าง
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

export default function LanguageSwitcher() {
  const [locale, setLocale] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    const cookieLocale =
      document.cookie
        .split(";")
        .find((item) => item.startsWith("NEXT_LOCALE="))
        ?.split("=")[1] || "th"
    if (cookieLocale) {
      setLocale(cookieLocale)
    } else {
      const browserLocale = navigator.language.slice(0, 2)
      setLocale(browserLocale)
      document.cookie = `NEXT_LOCALE=${browserLocale}; path=/`
      router.refresh()
    }
  }, [router])

  //const locale = useLocale()
  //const pathname = usePathname()
  //const [isPending, startTransition] = useTransition()
  const [isPending] = useTransition()

  const handleLocaleChange = (newLocale: string) => {
    // startTransition(() => {
    //   switchLocale(newLocale, pathname)
    // })
    setLocale(newLocale)
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/`
    router.refresh()
  }

  const getDisplayName = (localeCode: string) => {
    switch (localeCode) {
      case "en":
        return "English"
      case "th":
        return "ไทย"
      case "ru":
        return "Русский"
      default:
        return localeCode
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start"
          disabled={isPending}
        >
          <Globe className="mr-2 h-4 w-4" />
          {getDisplayName(locale)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => handleLocaleChange("th")}
          disabled={isPending}
        >
          ไทย
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLocaleChange("en")}
          disabled={isPending}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLocaleChange("ru")}
          disabled={isPending}
        >
          Русский
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
