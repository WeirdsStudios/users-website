"use client"

import { createBrowserClient } from "@supabase/ssr"
import { useEffect } from "react"

const RECOVERY_TYPES = new Set(["invite", "recovery"])

export default function AuthHashRedirect() {
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1))
    const type = hash.get("type")

    if (!type || !RECOVERY_TYPES.has(type)) return

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
      window.location.replace("/acceso?error=enlace-invalido")
      return
    }

    const supabase = createBrowserClient(url, key)

    void supabase.auth.getSession().then(({ data, error }) => {
      window.location.replace(
        data.session && !error
          ? "/cuenta/configurar"
          : "/acceso?error=enlace-invalido"
      )
    })
  }, [])

  return null
}
