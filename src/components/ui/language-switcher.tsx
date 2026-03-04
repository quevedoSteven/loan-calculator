"use client"

import { useRouter, usePathname } from "@/i18n/routing"
import { useLocale } from "next-intl"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()

  const changeLocale = (newLocale: string) => {
    // Use next-intl's built-in locale routing
    // pathname from @/i18n/routing does NOT include the locale prefix
    router.push(pathname, { locale: newLocale })
  }

  return (
    <Select value={locale} onValueChange={changeLocale}>
      <SelectTrigger className="w-[100px]">
        <SelectValue placeholder={locale} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="es">Español</SelectItem>
      </SelectContent>
    </Select>
  )
}