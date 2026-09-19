import Link from "next/link"
import { siteConfig } from "@/lib/site-config"
import { getWhatsAppLink } from "@/lib/whatsapp"

/**
 * La escalera comercial: Web Activa → Plataforma → App a medida.
 *
 * NO SON PAQUETES. Cada nivel es un punto de partida, y por eso cada tarjeta
 * lleva su `notIncluded` visible en vez de esconderlo en una nota legal: un
 * "desde" sin límite declarado se lee como lista de funciones incluidas, y
 * después hay que desdecirlo en la primera llamada.
 *
 * Los datos vienen de `siteConfig.offers`; aquí no se escribe ninguna cifra.
 *
 * Web Activa va marcada como punto de entrada porque es donde empieza la
 * mayoría, no porque los otros dos sean "premium": el nivel correcto lo define
 * el problema del negocio, no el presupuesto.
 */
export default function Niveles() {
  const [webActiva, plataforma, app] = siteConfig.offers

  return (
    <section
      id="niveles"
      aria-labelledby="niveles-titulo"
      className="bg-[#0A0A0A] text-white py-12 lg:py-20 border-t border-[#1A1A1A]"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="font-mono text-[10px] sm:text-[11px] tracking-[0.18em] uppercase text-[#4cfc0f]">
            Por dónde entrar
          </span>
          <h2
            id="niveles-titulo"
            className="text-[1.6rem] sm:text-3xl lg:text-[2.5rem] font-bold leading-[1.15] mt-3 text-balance tracking-tight"
          >
            Tres niveles, según hasta dónde tenga que llegar
          </h2>
          <p className="text-[#B0B0B0] text-[15px] lg:text-lg mt-4 leading-relaxed">
            No son paquetes cerrados. Cada uno es un punto de partida: el precio
            final sale del alcance que definimos contigo.
          </p>
        </div>

        <ul className="grid lg:grid-cols-3 gap-px bg-[#1F1F1F] border border-[#1F1F1F] mt-8 lg:mt-12">
          {[webActiva, plataforma, app].map((offer, i) => {
            const entry = i === 0
            return (
              <li
                key={offer.id}
                className={`flex flex-col p-5 sm:p-6 lg:p-7 ${entry ? "bg-[#0E0E0E]" : "bg-[#0A0A0A]"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#8A8A8A]">
                    0{i + 1}
                  </span>
                  {entry && (
                    <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#4cfc0f] border border-[#4cfc0f]/30 px-2 py-1">
                      Punto de entrada
                    </span>
                  )}
                </div>

                <h3 className="text-xl lg:text-2xl font-bold mt-4 tracking-tight">{offer.name}</h3>

                <p className="flex items-baseline gap-1.5 mt-3">
                  <span className="font-mono text-[11px] text-[#8A8A8A]">Desde</span>
                  <span className="text-2xl lg:text-[1.75rem] font-bold tnum text-white">
                    {siteConfig.pricing.offerLabel(offer.id)}
                  </span>
                </p>

                <p className="text-[#B0B0B0] text-sm mt-4 leading-relaxed">{offer.forWhom}</p>
                <p className="text-[#8A8A8A] text-sm mt-2.5 leading-relaxed">{offer.solves}</p>

                <ul className="mt-5 space-y-2 flex-1">
                  {offer.scope.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span
                        className="font-mono text-[#4cfc0f] text-xs leading-5 shrink-0"
                        aria-hidden="true"
                      >
                        +
                      </span>
                      <span className="text-[#D4D4D4] text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>

                {/* El límite del "desde", a la vista y no en letra chica. */}
                <p className="text-[#8A8A8A] text-[13px] mt-5 pt-4 border-t border-[#1F1F1F] leading-relaxed">
                  {offer.notIncluded}
                </p>

                {/* Referencia de tamaño con trabajo real. Dice "alcance
                    comparable", no "esto fue un X": estos proyectos se
                    entregaron antes de que existiera la escalera. */}
                {offer.comparableCase && (
                  <p className="font-mono text-[11px] text-[#8A8A8A] mt-3">
                    Alcance comparable:{" "}
                    <Link
                      href={`/proyectos/${offer.comparableCase.slug}`}
                      className="text-[#4cfc0f] hover:underline underline-offset-4"
                    >
                      {offer.comparableCase.name}
                    </Link>
                  </p>
                )}
              </li>
            )
          })}
        </ul>

        <div className="flex flex-col sm:flex-row gap-3 mt-8 lg:mt-10">
          <Link
            href="/analisis"
            className="group bg-[#4cfc0f] text-black font-bold px-6 py-4 text-[15px] inline-flex items-center justify-center gap-2.5 transition-all hover:shadow-[0_0_32px_rgba(76,252,15,0.4)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Ver qué nivel necesito
            <span className="transition-transform group-hover:translate-x-0.5" aria-hidden="true">→</span>
          </Link>
          <a
            href={getWhatsAppLink("hero")}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-[#2E2E2E] text-white font-semibold px-6 py-4 text-[15px] inline-flex items-center justify-center gap-2.5 transition-colors hover:border-[#4cfc0f] hover:text-[#4cfc0f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4cfc0f]"
          >
            Contar mi caso por WhatsApp
          </a>
        </div>

        {/* Política de infraestructura: decidida, no ambigua. */}
        <p className="text-[#8A8A8A] text-[13px] mt-6 max-w-2xl leading-relaxed">
          {siteConfig.infrastructure.includedFirstYear} en Web Activa.{" "}
          {siteConfig.infrastructure.clarification}
        </p>
      </div>
    </section>
  )
}
