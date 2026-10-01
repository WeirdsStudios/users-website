import type { ReactNode } from "react"
import { signOut } from "@/app/acceso/actions"
import { CrmSidebar } from "./CrmSidebar"

export function CrmShell({
  email,
  title,
  description,
  children,
}: {
  email: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <main id="contenido" className="min-h-screen bg-[#f6f6f7] text-zinc-950">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <CrmSidebar email={email} />
        <section className="min-w-0 flex-1">
          <header className="flex min-h-[69px] items-center justify-between border-b border-zinc-200 bg-white px-5 py-4 sm:px-8 lg:px-10">
            <div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#568000]">USERS · CRM INTERNO</p><p className="mt-1 text-sm text-zinc-500">Administración de clientes y operación</p></div>
            <form action={signOut}><button className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950" type="submit">Salir</button></form>
          </header>
          <div className="px-5 py-8 sm:px-8 lg:px-10">
            <header className="mb-8 max-w-4xl"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#568000]">Vista de operación</p><h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">{description}</p></header>
          {children}
          </div>
        </section>
      </div>
    </main>
  )
}

export function CrmCard({ children }: { children: ReactNode }) {
  return <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-200/40 sm:p-6">{children}</section>
}

export function CrmEmpty({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-zinc-300 bg-white px-5 py-8 text-sm leading-6 text-zinc-500">{children}</p>
}

export function CrmField({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  defaultValue,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  placeholder?: string
  defaultValue?: string
}) {
  return (
    <label className="grid gap-1 text-xs font-medium text-zinc-700">
      {label}
      <input
        className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm font-normal text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        type={type}
      />
    </label>
  )
}

export function CrmSelect({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string
  name: string
  options: ReadonlyArray<readonly [string, string]>
  defaultValue?: string
}) {
  return (
    <label className="grid gap-1 text-xs font-medium text-zinc-700">
      {label}
      <select className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm font-normal text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10" defaultValue={defaultValue} name={name}>
        {options.map(([value, optionLabel]) => <option key={value} value={value}>{optionLabel}</option>)}
      </select>
    </label>
  )
}

export function CrmSubmit({ children = "Guardar" }: { children?: ReactNode }) {
  return <button className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2" type="submit">{children}</button>
}
