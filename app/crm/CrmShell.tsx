import Link from "next/link"
import type { ReactNode } from "react"
import { signOut } from "@/app/acceso/actions"

const navigation = [
  ["Resumen", "/crm"],
  ["Leads", "/crm/leads"],
  ["Empresas y contactos", "/crm/empresas"],
  ["Oportunidades", "/crm/oportunidades"],
  ["Proyectos y tareas", "/crm/proyectos"],
  ["Cotizaciones y facturas", "/crm/cotizaciones"],
  ["Portal de clientes", "/crm/clientes"],
] as const

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
    <main id="contenido" className="min-h-screen bg-zinc-100 text-zinc-950">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <aside className="border-b border-zinc-200 bg-white px-5 py-6 lg:w-64 lg:border-b-0 lg:border-r">
          <Link className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-500" href="/crm">
            USERS · Operación
          </Link>
          <nav aria-label="Navegación del CRM" className="mt-6 flex gap-2 overflow-x-auto lg:flex-col">
            {navigation.map(([label, href]) => (
              <Link
                className="shrink-0 rounded-lg px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100 hover:text-black"
                href={href}
                key={href}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-7 border-t border-zinc-200 pt-5 text-xs text-zinc-500">
            <p className="break-all">{email}</p>
            <form action={signOut} className="mt-3">
              <button className="underline underline-offset-4" type="submit">Salir</button>
            </form>
          </div>
        </aside>
        <section className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10">
          <header className="mb-8">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#5a8500]">USERS · CRM</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">{description}</p>
          </header>
          {children}
        </section>
      </div>
    </main>
  )
}

export function CrmCard({ children }: { children: ReactNode }) {
  return <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">{children}</section>
}

export function CrmEmpty({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-6 text-sm text-zinc-500">{children}</p>
}

export function CrmField({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <label className="grid gap-1 text-xs font-medium text-zinc-700">
      {label}
      <input
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-normal text-zinc-950"
        name={name}
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
      <select className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-normal text-zinc-950" defaultValue={defaultValue} name={name}>
        {options.map(([value, optionLabel]) => <option key={value} value={value}>{optionLabel}</option>)}
      </select>
    </label>
  )
}

export function CrmSubmit({ children = "Guardar" }: { children?: ReactNode }) {
  return <button className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800" type="submit">{children}</button>
}
