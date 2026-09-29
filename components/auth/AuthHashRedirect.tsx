"use client"

import { createBrowserClient } from "@supabase/ssr"
import { useEffect } from "react"

const RECOVERY_TYPES = new Set(["invite", "recovery"])

export default function AuthHashRedirect() {
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1))
    const type = hash.get("type")
    const accessToken = hash.get("access_token")
    const refreshToken = hash.get("refresh_token")

    if (!type || !RECOVERY_TYPES.has(type)) return

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
      window.location.replace("/acceso?error=enlace-invalido")
      return
    }

    // The default Supabase recovery email redirects with tokens in the URL
    // fragment. Set the session ourselves instead of depending on the SDK's
    // automatic hash listener, which can finish after this component mounts.
    const supabase = createBrowserClient(url, key, {
      auth: { detectSessionInUrl: false },
    })
    let handled = false

    const continueToSetup = () => {
      if (handled) return
      handled = true
      window.location.replace("/cuenta/configurar")
    }

    void (async () => {
      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        if (!error && data.session) {
          continueToSetup()
          return
        }
      }

      // Keep the fallback for existing sessions (for example, a magic link
      // opened in a tab that already completed the hash exchange).
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        continueToSetup()
        return
      }

      window.location.replace("/acceso?error=enlace-invalido")
    })()

    return undefined
  }, [])

  return null
}
