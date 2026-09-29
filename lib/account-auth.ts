import "server-only"

import { cache } from "react"
import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export interface AccountIdentity {
  userId: string
  email: string
}

function staffEmails(): Set<string> {
  return new Set(
    (process.env.USERS_STAFF_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  )
}

export const getAccountIdentity = cache(async (): Promise<AccountIdentity | null> => {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.getClaims()
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : null
  const email = typeof data?.claims?.email === "string"
    ? data.claims.email.toLowerCase()
    : null
  if (error || !userId || !email) return null
  return { userId, email }
})

export async function requireAccountIdentity(): Promise<AccountIdentity> {
  const identity = await getAccountIdentity()
  if (!identity) redirect("/acceso?next=/cuenta")
  return identity
}

export async function requireStaffIdentity(): Promise<AccountIdentity> {
  const identity = await getAccountIdentity()
  if (!identity) redirect("/acceso?next=/crm")
  if (!staffEmails().has(identity.email)) redirect("/cuenta")
  return identity
}

export async function listAccountOrganizations() {
  const identity = await requireAccountIdentity()
  const supabase = await createSupabaseServerClient()
  const { data: memberships, error: membershipError } = await supabase
    .from("organization_members")
    .select("organization_id, role, created_at")
    .eq("user_id", identity.userId)
    .eq("status", "active")
  if (membershipError) throw new Error("No se pudieron cargar tus accesos.")
  if (!memberships?.length) return []

  const ids = memberships.map((membership) => membership.organization_id)
  const { data: organizations, error: organizationError } = await supabase
    .from("organizations")
    .select("id, name, slug, status")
    .in("id", ids)
  if (organizationError) throw new Error("No se pudieron cargar tus cuentas.")

  const byId = new Map((organizations ?? []).map((organization) => [organization.id, organization]))
  return memberships.flatMap((membership) => {
    const organization = byId.get(membership.organization_id)
    return organization ? [{ ...organization, role: membership.role }] : []
  })
}
