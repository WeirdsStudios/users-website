"use client"

import { useActionState } from "react"
import { convertLeadToClient, type ConvertLeadState } from "./actions"

const initialState: ConvertLeadState = {}

export default function ConvertLeadForm({
  leadId,
  businessName,
  ownerEmail,
}: {
  leadId: string
  businessName: string
  ownerEmail: string
}) {
  const action = convertLeadToClient.bind(null, leadId)
  const [state, formAction, pending] = useActionState(action, initialState)

  return (
    <form action={formAction} className="mt-5 grid gap-3 sm:grid-cols-2">
      <label className="text-xs font-medium text-zinc-600">
        Organización
        <input
          className="mt-1.5 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm text-black outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
          defaultValue={businessName}
          maxLength={120}
          name="organizationName"
          required
        />
      </label>
      <label className="text-xs font-medium text-zinc-600">
        Propietario
        <input
          className="mt-1.5 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm text-black outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
          defaultValue={ownerEmail}
          name="ownerEmail"
          type="email"
          required
        />
      </label>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button
          className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
          disabled={pending}
          type="submit"
        >
          {pending ? "Creando…" : "Convertir e invitar"}
        </button>
        {state.message ? (
          <p className={state.ok ? "text-sm text-emerald-700" : "text-sm text-red-700"} role="status">
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  )
}
