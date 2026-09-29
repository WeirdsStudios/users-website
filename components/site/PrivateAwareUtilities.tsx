"use client"

import { usePathname } from "next/navigation"
import Analytics from "@/components/analytics/Analytics"
import ConsentBanner from "@/components/consent/ConsentBanner"
import SupportWidget from "@/components/support/SupportWidget"
import WhatsAppButton from "@/components/site/WhatsAppButton"

const PRIVATE_PREFIXES = ["/acceso", "/auth", "/crm", "/cuenta"]

export default function PrivateAwareUtilities() {
  const pathname = usePathname()
  if (PRIVATE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return null
  }

  return (
    <>
      <SupportWidget />
      <WhatsAppButton />
      <Analytics />
      <ConsentBanner />
    </>
  )
}
