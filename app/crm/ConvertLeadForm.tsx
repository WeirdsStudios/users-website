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
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-black"
          defaultValue={businessName}
          maxLength={120}
          name="organizationName"
          required
        />
      </label>
      <label className="text-xs font-medium text-zinc-600">
        Propietario
        <input
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-black"
          defaultValue={ownerEmail}
          name="ownerEmail"
          type="email"
          required
        />
      </label>
      <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
        <button
          className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
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
