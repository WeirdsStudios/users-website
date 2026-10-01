import { QuoteBuilder } from "@/components/business/QuoteBuilder"
import { BusinessPageHeader, EmptyState, StatusBadge } from "@/components/business/BusinessUi"
import { getBusinessData, money, requireBusinessOrganization } from "@/lib/business-console"
import { createSale, saleStatus } from "../actions"

export default async function Sales({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const organization = await requireBusinessOrganization(slug)
  const { customers, products, sales } = await getBusinessData(organization.id)
  const activeCustomers = customers.filter((customer) => customer.status === "active")
  const activeProducts = products.filter((product) => product.status === "active")
  const create = createSale.bind(null, slug)
  return <><BusinessPageHeader eyebrow="Operación comercial" title="Ventas" description="Registra operaciones terminadas desde tu catálogo. Las anulaciones conservan siempre el historial." />
    {!activeProducts.length ? <div className="mt-7"><EmptyState title="Primero agrega un producto" description="Necesitas un producto activo en tu catálogo antes de registrar una venta." /></div> : <QuoteBuilder action={create} customers={activeCustomers} mode="sale" products={activeProducts} />}
    <section className="mt-10"><div className="flex items-end justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#5a8500]">Historial</p><h3 className="mt-2 text-2xl font-bold">Ventas recientes</h3></div><span className="text-sm text-zinc-500">{sales.length} registros</span></div><div className="mt-5 grid gap-3 lg:grid-cols-2">{sales.map((sale) => <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm" key={sale.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">Venta #{sale.saleNumber}</p><p className="mt-1 text-sm text-zinc-500">{sale.customerName ?? "Venta de mostrador"} · {sale.lineCount} {sale.lineCount === 1 ? "producto" : "productos"}</p></div><StatusBadge active={sale.status === "completed"}>{sale.status === "completed" ? "Completada" : sale.status === "voided" ? "Anulada" : "Reembolsada"}</StatusBadge></div><div className="mt-5 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs text-zinc-500">Total</p><strong className="text-xl">{money(sale.totalCents)}</strong></div>{sale.paymentMethod ? <p className="text-sm text-zinc-500">{sale.paymentMethod}</p> : null}</div>{sale.status === "completed" ? <div className="mt-5 flex gap-3 border-t border-zinc-100 pt-4"><form action={saleStatus.bind(null, slug, sale.id, "voided")}><button className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50">Anular venta</button></form><form action={saleStatus.bind(null, slug, sale.id, "refunded")}><button className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50">Marcar reembolsada</button></form></div> : null}</article>)}{!sales.length ? <EmptyState title="Aún no hay ventas" description="Registra la primera operación arriba. Verás su total, cliente y forma de pago en este historial." /> : null}</div></section>
  </>
}
