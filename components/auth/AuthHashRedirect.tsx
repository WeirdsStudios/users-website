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
    let handled = false

    const continueToSetup = () => {
      if (handled) return
      handled = true
      window.location.replace("/cuenta/configurar")
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        session &&
        (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN")
      ) {
        continueToSetup()
      }
    })

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) continueToSetup()
    })

    const timeout = window.setTimeout(() => {
      if (!handled) window.location.replace("/acceso?error=enlace-invalido")
    }, 5_000)

    return () => {
      listener.subscription.unsubscribe()
      window.clearTimeout(timeout)
    }
  }, [])

  return null
}
