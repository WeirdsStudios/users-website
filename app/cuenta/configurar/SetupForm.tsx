"use client"

import { useActionState } from "react"
import { finishAccountSetup, type SetupActionState } from "./actions"

const initialState: SetupActionState = {}

export default function SetupForm() {
  const [state, action, pending] = useActionState(finishAccountSetup, initialState)
  return (
    <form action={action} className="mt-8 space-y-5">
      <label className="block text-sm font-medium">
        Crea una contraseña
        <input
          className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-3"
          minLength={12}
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
      </label>
      <label className="block text-sm font-medium">
        Confirma la contraseña
        <input
          className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-3"
          minLength={12}
          name="confirmation"
          type="password"
          autoComplete="new-password"
          required
        />
      </label>
      {state.message ? <p className="text-sm text-red-700" role="alert">{state.message}</p> : null}
      <button
        className="w-full rounded-lg bg-black px-4 py-3 font-semibold text-white disabled:opacity-50"
        disabled={pending}
        type="submit"
      >
        {pending ? "Activando…" : "Activar mi cuenta"}
      </button>
    </form>
  )
}
