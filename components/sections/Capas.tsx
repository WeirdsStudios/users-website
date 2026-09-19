import Link from "next/link"
import { getSolution } from "@/lib/solutions"

/**
 * Las tres capas de cualquier proyecto USERS: presencia, función y control.
 *
 * QUÉ SUSTITUYE
 * Antes aquí vivía "Tres frentes del mismo negocio digital" (presencia,
 * operación, clientes). Esa división describía *áreas del negocio* y servía
 * como índice de /soluciones, donde sigue vigente. Pero no decía lo que ahora
 * es la posición comercial de USERS: que una web nuestra no es un folleto.
 *
 * QUÉ DICE AHORA
 * Presencia + Función + Control es el principio de producto, no una lista de
 * servicios. Las tres capas están en todos los niveles —Web Activa, Plataforma
 * y App a medida—; lo que cambia entre niveles es hasta dónde llegan la
 * función y el control, y eso lo cuenta la sección siguiente.
 *
 * Los enlaces a /soluciones se conservan: cada capa lleva a las páginas que
 * responden esa intención de búsqueda.
 */
const capas = [
  {
    id: "presencia",
    number: "01",
    name: "Presencia",
    claim: "Lo que ve tu cliente.",
    body:
      "El lugar al que llega quien te buscó en Google, escaneó tu tarjeta o vio tu Instagram. Construido para explicar el negocio y generar contacto, no solo para verse bien.",
    solutions: ["desarrollo-web"],
  },
  {
    id: "funcion",
    number: "02",
    name: "Función",
    claim: "Algo útil que puede hacer ahí mismo.",
    body:
      "Cotizar, reservar, pedir, consultar o dejar una solicitud completa. Es la parte que te devuelve el tiempo que hoy se va en contestar lo mismo por mensaje.",
    solutions: ["cotizadores-digitales", "portales-para-clientes"],
  },
  {
    id: "control",
    number: "03",
    name: "Control",
    claim: "Lo que tú administras.",
    body:
      "Tu panel: las solicitudes que entran, el contenido clave y la actividad del sitio. Sin depender de nosotros para cada cambio.",
    solutions: ["software-a-medida", "punto-de-venta-a-medida"],
  },
]

export default function Capas() {
  return (
    <section id="como-funciona" aria-labelledby="capas-titulo" className="bg-[#F7F7F5] py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="font-mono text-[10px] sm:text-[11px] tracking-[0.18em] uppercase text-[#0A0A0A]/50">
            Cómo construimos
          </span>
          <h2
            id="capas-titulo"
            className="text-[1.6rem] sm:text-3xl lg:text-[2.5rem] font-bold leading-[1.15] mt-3 text-balance tracking-tight"
          >
            Una web que se ve, hace y se administra
          </h2>
          <p className="text-[#4A4A4A] text-[15px] lg:text-lg mt-4 leading-relaxed">
            Todo proyecto que entregamos tiene estas tres capas. Lo que cambia
            de un proyecto a otro es hasta dónde llegan las dos últimas.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#E2E2DE] border border-[#E2E2DE] mt-8 lg:mt-12">
          {capas.map((capa) => (
            <article key={capa.id} className="bg-[#F7F7F5] p-5 sm:p-6 lg:p-7 flex flex-col">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] tracking-[0.18em] text-[#1F7A00]">
                  {capa.number}
                </span>
                <span className="h-px flex-1 bg-[#D8D8D2]" aria-hidden="true" />
              </div>

              <h3 className="text-xl lg:text-2xl font-bold mt-4 tracking-tight">{capa.name}</h3>
              <p className="text-[#0A0A0A] text-[15px] font-semibold mt-2 leading-snug">
                {capa.claim}
              </p>
              <p className="text-[#4A4A4A] text-sm mt-3 leading-relaxed flex-1">{capa.body}</p>

              <ul className="flex flex-wrap gap-1.5 mt-5">
                {capa.solutions.map((slug) => {
                  const solution = getSolution(slug)
                  if (!solution) return null
                  return (
                    <li key={slug}>
                      <Link
                        href={`/soluciones/${solution.slug}`}
                        className="inline-flex items-center gap-1.5 border border-[#D8D8D2] bg-white px-2.5 py-1.5 text-[13px] text-[#0A0A0A] transition-colors hover:border-[#1F7A00] hover:text-[#1F7A00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F7A00]"
                      >
                        {solution.name}
                        <span aria-hidden="true">→</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </article>
          ))}
        </div>

        <Link
          href="/soluciones"
          className="inline-flex items-center gap-2 mt-8 text-sm font-semibold text-[#0A0A0A] border-b border-[#0A0A0A]/25 pb-0.5 transition-colors hover:text-[#1F7A00] hover:border-[#1F7A00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F7A00]"
        >
          Ver todas las soluciones
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  )
}
