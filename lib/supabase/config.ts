export function getSupabaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!value) throw new Error("NEXT_PUBLIC_SUPABASE_URL no está configurada.")
  return value
}

export function getSupabasePublicKey(): string {
  const value =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!value) {
    throw new Error("Falta NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.")
  }
  return value
}

export function getSupabaseSecretKey(): string {
  const value =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!value) throw new Error("Falta SUPABASE_SECRET_KEY.")
  return value
}
