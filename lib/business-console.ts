import "server-only"

import { listAccountOrganizations } from "@/lib/account-auth"
import { createAdminClient } from "@/lib/supabase-admin"

export type BusinessProduct = { id: string; name: string; sku: string | null; description: string | null; priceCents: number; offerPriceCents: number | null; status: "active" | "archived" }
export type BusinessCustomer = { id: string; name: string; email: string | null; phone: string | null; notes: string | null; status: "active" | "archived" }
export type BusinessQuote = { id: string; quoteNumber: number; customerName: string; status: string; totalCents: number; validUntil: string | null; lineCount: number }
export type BusinessSale = { id: string; saleNumber: number; customerName: string | null; status: string; totalCents: number; paymentMethod: string | null; lineCount: number }
type ProductRow = { id:string; name:string; sku:string|null; description:string|null; price_cents:number; offer_price_cents:number|null; status:"active"|"archived" }
type CustomerRow = { id:string; name:string; email:string|null; phone:string|null; notes:string|null; status:"active"|"archived" }
type QuoteRow = { id:string; quote_number:number; status:string; total_cents:number; valid_until:string|null; customer:{name:string}[]|null; lines:{id:string}[]|null }
type SaleRow = { id:string; sale_number:number; status:string; total_cents:number; payment_method:string|null; customer:{name:string}[]|null; lines:{id:string}[]|null }

export function money(cents: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(cents / 100)
}

export async function requireBusinessOrganization(slug: string) {
  const organizations = await listAccountOrganizations()
  const organization = organizations.find((item) => item.slug === slug)
  if (!organization) throw new Error("No tienes acceso a este negocio.")
  return organization
}

export async function getBusinessData(organizationId: string) {
  const db = createAdminClient()
  const [productsResult, customersResult, quotesResult, salesResult] = await Promise.all([
    db.from("business_products").select("id,name,sku,description,price_cents,offer_price_cents,status").eq("organization_id", organizationId).order("status").order("name"),
    db.from("business_customers").select("id,name,email,phone,notes,status").eq("organization_id", organizationId).order("status").order("name"),
    db.from("business_quotes").select("id,quote_number,status,total_cents,valid_until,customer:business_customers(name),lines:business_quote_lines(id)").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(100),
    db.from("business_sales").select("id,sale_number,status,total_cents,payment_method,customer:business_customers(name),lines:business_sale_lines(id)").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(100),
  ])
  if (productsResult.error || customersResult.error || quotesResult.error || salesResult.error) throw new Error("No se pudo cargar la operación del negocio.")
  const products: BusinessProduct[] = ((productsResult.data ?? []) as ProductRow[]).map((r) => ({ id: r.id, name: r.name, sku: r.sku, description: r.description, priceCents: r.price_cents, offerPriceCents: r.offer_price_cents, status: r.status }))
  const customers: BusinessCustomer[] = ((customersResult.data ?? []) as CustomerRow[]).map((r) => ({ id: r.id, name: r.name, email: r.email, phone: r.phone, notes: r.notes, status: r.status }))
  const quotes: BusinessQuote[] = ((quotesResult.data ?? []) as QuoteRow[]).map((r) => ({ id: r.id, quoteNumber: r.quote_number, customerName: r.customer?.[0]?.name ?? "Cliente", status: r.status, totalCents: r.total_cents, validUntil: r.valid_until, lineCount: r.lines?.length ?? 0 }))
  const sales: BusinessSale[] = ((salesResult.data ?? []) as SaleRow[]).map((r) => ({ id: r.id, saleNumber: r.sale_number, customerName: r.customer?.[0]?.name ?? null, status: r.status, totalCents: r.total_cents, paymentMethod: r.payment_method, lineCount: r.lines?.length ?? 0 }))
  return { products, customers, quotes, sales }
}

export function text(value: FormDataEntryValue | null, max: number, required = false) {
  if (typeof value !== "string") return required ? null : null
  const cleaned = value.trim()
  if (!cleaned) return required ? null : null
  return cleaned.length <= max ? cleaned : null
}

export function amount(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !/^\d+(\.\d{1,2})?$/.test(value.trim().replace(/,/g, ""))) return null
  const cents = Math.round(Number(value.trim().replace(/,/g, "")) * 100)
  return Number.isSafeInteger(cents) && cents >= 0 && cents <= 100000000 ? cents : null
}

export function productLines(formData: FormData) {
  const lines: { productId: string; quantity: number }[] = []
  for (const id of [...new Set(formData.getAll("product_id").filter((item): item is string => typeof item === "string" && /^[0-9a-f-]{36}$/i.test(item)))]) {
    const raw = formData.get(`quantity_${id}`)
    if (typeof raw !== "string" || !raw.trim()) continue
    const normalized = raw.trim().replace(",", ".")
    if (!/^\d+(\.\d{1,3})?$/.test(normalized)) return null
    const quantity = Number(normalized)
    if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 100000) return null
    lines.push({ productId: id, quantity })
  }
  return lines.length ? lines : null
}
