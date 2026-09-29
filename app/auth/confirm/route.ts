import type { EmailOtpType } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

function safeNext(value: string | null): string {
  return value?.startsWith("/") && !value.startsWith("//")
    ? value
    : "/cuenta/configurar"
}

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash")
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null
  const redirectTo = request.nextUrl.clone()
  redirectTo.search = ""

  if (tokenHash && type) {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (!error) {
      redirectTo.pathname = safeNext(request.nextUrl.searchParams.get("next"))
      return NextResponse.redirect(redirectTo)
    }
  }

  redirectTo.pathname = "/acceso"
  redirectTo.searchParams.set("error", "enlace-invalido")
  return NextResponse.redirect(redirectTo)
}
