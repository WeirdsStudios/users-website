"use client"

import { useActionState } from "react"
import { signIn } from "./actions"

export default function AccessForm({
  next,
  initialMessage,
}: {
  next: "/cuenta" | "/crm"
  initialMessage?: string
}) {
  const [state, action, pending] = useActionState(signIn, { message: initialMessage })

  return (
    <form action={action} className="mt-8 space-y-5">
      <input type="hidden" name="next" value={next} />
      <label className="block text-sm font-medium">
        Correo
        <input
          className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-3"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </label>
      <label className="block text-sm font-medium">
        Contraseña
        <input
          className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-3"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>
      {state.message ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {state.message}
        </p>
      ) : null}
      <button
        className="w-full rounded-lg bg-black px-4 py-3 font-semibold text-white disabled:opacity-50"
        disabled={pending}
        type="submit"
      >
        {pending ? "Validando…" : "Entrar"}
      </button>
    </form>
  )
}
