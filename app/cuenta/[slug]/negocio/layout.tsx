import { notFound } from "next/navigation"
import { requireBusinessOrganization } from "@/lib/business-console"
import { BusinessSidebar } from "./BusinessSidebar"

export default async function BusinessLayout({ children, params }: { children: React.ReactNode; params: Promise<{slug:string}> }) {
  const { slug } = await params
  let organization
  try { organization = await requireBusinessOrganization(slug) } catch { notFound() }
  return <main className="min-h-screen bg-zinc-100 text-zinc-950 lg:flex"><BusinessSidebar businessName={organization.name} slug={slug} /><div className="min-w-0 flex-1"><header className="flex min-h-20 items-center justify-between border-b border-zinc-200 bg-white px-5 sm:px-8"><div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5a8500]">USERS · Administración</p><p className="mt-1 text-sm text-zinc-500">Operación de {organization.name}</p></div><span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">Sistema activo</span></header><section className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10 lg:py-9">{children}</section></div></main>
}
