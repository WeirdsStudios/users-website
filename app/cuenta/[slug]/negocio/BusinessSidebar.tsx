"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navigation = [
  { label: "Resumen", icon: "▦", suffix: "" },
  { label: "Catálogo", icon: "◇", suffix: "/catalogo" },
  { label: "Clientes", icon: "◎", suffix: "/clientes" },
  { label: "Cotizaciones", icon: "◫", suffix: "/cotizaciones" },
  { label: "Ventas", icon: "↗", suffix: "/ventas" },
]

export function BusinessSidebar({ businessName, slug }: { businessName: string; slug: string }) {
  const pathname = usePathname()
  const base = `/cuenta/${slug}/negocio`
  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-zinc-800 bg-zinc-950 text-zinc-100 lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r">
      <div className="border-b border-zinc-800 px-5 py-6">
        <Link className="inline-flex items-center gap-2" href={`/cuenta/${slug}`}>
          <span className="grid size-8 place-items-center rounded-lg bg-[#4cfc0f] text-xs font-black text-zinc-950">U</span>
          <span className="font-mono text-xs font-bold tracking-[0.16em] text-zinc-300">USERS OS</span>
        </Link>
        <div className="mt-7 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-zinc-800 text-sm font-bold text-[#4cfc0f]">{businessName.slice(0, 1).toUpperCase()}</span>
          <div className="min-w-0"><p className="truncate text-sm font-semibold">{businessName}</p><p className="mt-0.5 text-xs text-zinc-400">Panel de administración</p></div>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 py-4 lg:flex-col lg:overflow-visible" aria-label="Administración del negocio">
        <p className="hidden px-3 pb-2 pt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500 lg:block">Operación</p>
        {navigation.map((item) => {
          const href = `${base}${item.suffix}`
          const active = item.suffix ? pathname.startsWith(href) : pathname === base || pathname === `${base}/`
          return <Link className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active ? "bg-[#4cfc0f] text-zinc-950" : "text-zinc-300 hover:bg-zinc-800 hover:text-white"}`} href={href} key={href}><span className="grid size-5 place-items-center text-base">{item.icon}</span>{item.label}</Link>
        })}
      </nav>
      <div className="mt-auto hidden border-t border-zinc-800 p-4 lg:block"><Link className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white" href={`/cuenta/${slug}`}>← Volver a mi portal</Link></div>
    </aside>
  )
}
