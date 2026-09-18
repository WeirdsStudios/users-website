/**
 * Quién responde por el proyecto.
 *
 * QUÉ PASÓ ANTES
 * Esta sección presentaba cinco personas y una promesa de varias disciplinas
 * sentadas en la misma mesa. El 8 de septiembre se editó tres veces seguidas:
 *   · 094b5c1 — dejó el roster en una sola persona (Haza Munguía).
 *   · aa99b5f — vació antetítulo, título y texto, porque hablaban de un equipo
 *               que ya no correspondía al roster de una persona.
 *   · 1e90298 — intentó comentar la sección entera para ocultarla. Los
 *               comentarios de bloque no se anidan: el que abrió en la línea 13
 *               se cerró en el primer delimitador que encontró, se comió el
 *               `export default` y dejó una llave sin cerrar. El build quedó
 *               roto y producción se quedó sirviendo la versión anterior, con
 *               un encabezado vacío en la home.
 *
 * QUÉ SE HACE AHORA
 * Se respeta la decisión que el historial muestra —una sola persona— y se le da
 * una sección propia en vez de una celda suelta dentro de una retícula pensada
 * para seis. No se reponen las otras cuatro personas: no consta que sigan
 * formando parte de USERS, y afirmarlo sería exactamente el tipo de promesa que
 * el resto del sitio evita.
 *
 * QUÉ SE PUEDE AFIRMAR
 * Solo lo verificable: el nombre público, el rol y la frase de enfoque que ya
 * venían del propio archivo. Sin años de experiencia, sin biografía, sin
 * certificaciones y sin colaboradores inventados.
 *
 * Avatar gráfico con iniciales sobre rejilla técnica, no fotografía: las
 * imágenes que había antes eran de stock y no correspondían a esta persona.
 */

const FOUNDER = {
  name: "Haza Munguía",
  role: "Estrategia y desarrollo",
  focus: "Traduce el problema del negocio en qué se construye y en qué orden.",
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

export default function Equipo() {
  return (
    <section
      id="equipo"
      aria-labelledby="equipo-titulo"
      className="bg-[#0A0A0A] text-white py-12 lg:py-20 border-t border-[#1A1A1A]"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-10 xl:gap-14 lg:items-center">
          {/* ── Narrativa ── */}
          <div className="lg:col-span-7">
            <span className="font-mono text-[10px] sm:text-[11px] tracking-[0.18em] uppercase text-[#4cfc0f]">
              Quién responde por tu proyecto
            </span>
            <h2
              id="equipo-titulo"
              className="text-[1.6rem] sm:text-3xl lg:text-[2.5rem] font-bold leading-[1.15] mt-3 text-balance tracking-tight"
            >
              Hablas directamente con quien lo construye
            </h2>
            <p className="text-[#B0B0B0] text-[15px] lg:text-lg mt-4 leading-relaxed max-w-xl">
              No hay un vendedor que promete y alguien más que después
              interpreta. La persona que entiende tu negocio es la misma que
              define qué se construye y responde por la entrega.
            </p>
          </div>

          {/* ── La persona ──
              Bloque propio y no una celda de retícula: una sola tarjeta dentro
              de una rejilla de seis se lee como si faltaran cinco. */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <article className="bg-[#0E0E0E] border border-[#1F1F1F] p-5 sm:p-6 lg:p-7">
              <span
                className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center border border-[#2E2E2E] bg-[#111] overflow-hidden"
                aria-hidden="true"
              >
                <span className="grid-tech absolute inset-0 opacity-70" />
                <span className="relative font-mono text-lg font-bold text-[#4cfc0f] tracking-wide">
                  {initials(FOUNDER.name)}
                </span>
              </span>

              <h3 className="text-lg sm:text-xl font-bold mt-4 leading-tight">
                {FOUNDER.name}
              </h3>
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#4cfc0f] mt-2 leading-relaxed">
                {FOUNDER.role}
              </p>
              <p className="text-[#B0B0B0] text-sm mt-3 leading-relaxed">
                {FOUNDER.focus}
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}
