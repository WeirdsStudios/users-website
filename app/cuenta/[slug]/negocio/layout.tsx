import Link from "next/link"
import { notFound } from "next/navigation"
import { requireBusinessOrganization } from "@/lib/business-console"

export default async function BusinessLayout({ children, params }: { children: React.ReactNode; params: Promise<{slug:string}> }) {
  const { slug } = await params
  let organization
  try { organization = await requireBusinessOrganization(slug) } catch { notFound() }
  const items = [["Resumen", `/cuenta/${slug}/negocio`], ["Catálogo", `/cuenta/${slug}/negocio/catalogo`], ["Clientes", `/cuenta/${slug}/negocio/clientes`], ["Cotizaciones", `/cuenta/${slug}/negocio/cotizaciones`], ["Ventas", `/cuenta/${slug}/negocio/ventas`]]
  return <main className="min-h-screen bg-zinc-100 text-zinc-950"><header className="border-b border-zinc-200 bg-white"><div className="mx-auto max-w-6xl px-5 py-5"><Link href={`/cuenta/${slug}`} className="text-sm text-zinc-500 underline underline-offset-4">← Portal de {organization.name}</Link><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><div><p className="font-mono text-xs uppercase tracking-[.18em] text-[#5a8500]">USERS · Administración</p><h1 className="mt-1 text-xl font-bold">{organization.name}</h1></div><nav className="flex flex-wrap gap-2">{items.map(([label, href])=><Link key={href} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-zinc-100" href={href}>{label}</Link>)}</nav></div></div></header><section className="mx-auto max-w-6xl px-5 py-8">{children}</section></main>
}
