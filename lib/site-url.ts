export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    "http://localhost:3000"
  const withProtocol = raw.startsWith("http") ? raw : `https://${raw}`
  return withProtocol.replace(/\/$/, "")
}
