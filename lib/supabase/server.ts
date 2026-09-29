import "server-only"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getSupabasePublicKey, getSupabaseUrl } from "./config"

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(getSupabaseUrl(), getSupabasePublicKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Server Components cannot write cookies. proxy.ts refreshes them.
        }
      },
    },
  })
}
