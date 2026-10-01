import { redirect } from "next/navigation"

/** La cuenta y la operación comparten una sola aplicación. */
export default async function OrganizationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  redirect(`/cuenta/${slug}/negocio`)
}
