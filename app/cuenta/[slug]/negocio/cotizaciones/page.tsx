import { QuoteBuilder } from "@/components/business/QuoteBuilder"
import { BusinessPageHeader, EmptyState, StatusBadge } from "@/components/business/BusinessUi"
import { getBusinessData, money, requireBusinessOrganization } from "@/lib/business-console"
import { createQuote, quoteStatus } from "../actions"

const labels: Record<string, string> = { draft: "Borrador", sent: "Enviada", accepted: "Aceptada", rejected: "Rechazada", expired: "Vencida", cancelled: "Cancelada" }

export default async function Quotes({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const organization = await requireBusinessOrganization(slug)
  const { customers, products, quotes } = await getBusinessData(organization.id)
  const activeCustomers = customers.filter((customer) => customer.status === "active")
  const activeProducts = products.filter((product) => product.status === "active")
  const create = createQuote.bind(null, slug)
  return <><BusinessPageHeader eyebrow="Operación comercial" title="Cotizaciones" description="Construye propuestas claras con precios tomados directamente de tu catálogo." />
    {!activeCustomers.length || !activeProducts.length ? <div className="mt-7"><EmptyState title="Aún no puedes cotizar" description="Necesitas al menos un cliente activo y un producto activo antes de crear la primera cotización." /></div> : <QuoteBuilder action={create} customers={activeCustomers} products={activeProducts} />}
    <section className="mt-10"><div className="flex items-end justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#5a8500]">Historial</p><h3 className="mt-2 text-2xl font-bold">Cotizaciones recientes</h3></div><span className="text-sm text-zinc-500">{quotes.length} registros</span></div><div className="mt-5 grid gap-3 lg:grid-cols-2">{quotes.map((quote) => { const actions = quote.status === "draft" ? [["Marcar enviada", "sent"], ["Cancelar", "cancelled"]] : quote.status === "sent" ? [["Aceptar", "accepted"], ["Rechazar", "rejected"], ["Vencer", "expired"]] : []; return <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm" key={quote.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">Cotización #{quote.quoteNumber}</p><p className="mt-1 text-sm text-zinc-500">{quote.customerName} · {quote.lineCount} {quote.lineCount === 1 ? "producto" : "productos"}</p></div><StatusBadge active={quote.status === "accepted" || quote.status === "sent"}>{labels[quote.status] ?? quote.status}</StatusBadge></div><div className="mt-5 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs text-zinc-500">Total</p><strong className="text-xl">{money(quote.totalCents)}</strong></div>{quote.validUntil ? <p className="text-sm text-zinc-500">Vence {quote.validUntil}</p> : null}</div>{actions.length ? <div className="mt-5 flex flex-wrap gap-3 border-t border-zinc-100 pt-4">{actions.map(([label, status]) => <form key={status} action={quoteStatus.bind(null, slug, quote.id, status)}><button className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50">{label}</button></form>)}</div> : null}</article> })}{!quotes.length ? <EmptyState title="Aún no hay cotizaciones" description="Crea tu primer borrador arriba. Después podrás enviarlo, aceptarlo o marcarlo como vencido." /> : null}</div></section>
  </>
}
