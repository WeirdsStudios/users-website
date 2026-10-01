import type { ReactNode } from "react"

export function BusinessPageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#5a8500]">{eyebrow}</p><h2 className="mt-2 text-3xl font-bold tracking-tight">{title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">{description}</p></div>{action}</header>
}

export function StatusBadge({ active, children }: { active: boolean; children: ReactNode }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${active ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-600"}`}>{children}</span>
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-5 py-10 text-center"><p className="font-medium">{title}</p><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">{description}</p></div>
}
