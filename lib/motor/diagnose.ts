import { siteConfig, getOffer } from "@/lib/site-config"
import type { Answers } from "./questions"
import {
  DIMENSIONS,
  STATE_RANK,
  type Diagnosis,
  type DimensionId,
  type DimensionResult,
  type DimensionState,
  type Horizon,
  type Opportunity,
  type Recommendation,
} from "./types"

/**
 * El diagnóstico.
 *
 * CÓMO FUNCIONA
 * Cada dimensión acumula señales a partir de respuestas concretas. Una señal
 * siempre trae consigo la frase que la justifica, así que el resultado se
 * puede explicar sin abrir el código: "salió prioridad en Operación porque
 * agendas, cobras y llevas inventario a mano".
 *
 * LO QUE NO HACE
 * No calcula precios. No estima ROI, ni ventas futuras, ni cuánto dinero se
 * está perdiendo. La versión anterior devolvía un rango de pesos calculado
 * con horas inventadas y lo presentaba con dos decimales de confianza; eso no
 * es un diagnóstico, es una cotización falsa.
 *
 * INGRESOS
 * Influyen en el *alcance* de la fase inicial y en el orden de las
 * oportunidades, nunca en qué se diagnostica. Dos negocios con el mismo
 * problema reciben el mismo problema; lo que cambia es por dónde se propone
 * empezar. Y "prefiero no decirlo" no penaliza nada.
 */

type Signal = { dim: DimensionId; weight: number; evidence: string }

const asArray = (v: string | string[] | undefined): string[] =>
  Array.isArray(v) ? v : v ? [v] : []

const has = (v: string | string[] | undefined, value: string) => asArray(v).includes(value)

function collectSignals(a: Answers): Signal[] {
  const s: Signal[] = []
  const push = (dim: DimensionId, weight: number, evidence: string) =>
    s.push({ dim, weight, evidence })

  // ── Presencia ──
  const web = a.hasWebsite as string
  if (web === "no") push("presencia", 3, "No tienes sitio web todavía.")
  if (web === "redes") push("presencia", 3, "Tu presencia vive solo en redes sociales, que no controlas tú.")
  if (web === "viejo") push("presencia", 2, "Tienes un sitio, pero está desactualizado.")
  if (web === "si") push("presencia", -2, "Ya tienes un sitio que funciona.")

  if (has(a.acquisition, "google")) push("presencia", -1, "Ya te encuentran por búsquedas en Google.")
  if (has(a.customerAsks, "horarios"))
    push("presencia", 1, "Te siguen preguntando horarios y ubicación, que es información que un sitio resuelve solo.")
  if (has(a.customerAsks, "catalogo"))
    push("presencia", 1, "Te preguntan seguido qué vendes o qué servicios ofreces.")

  // ── Adquisición ──
  const canales = asArray(a.acquisition)
  if (canales.length === 1 && canales[0] === "recomendacion")
    push("adquisicion", 3, "Todo depende de la recomendación de boca en boca: funciona, pero no lo controlas.")
  if (canales.length === 1 && (canales[0] === "redes" || canales[0] === "whatsapp"))
    push("adquisicion", 3, "Dependes de un solo canal que no es tuyo.")
  if (canales.length >= 3) push("adquisicion", -1, "Tienes varios canales de entrada, no dependes de uno solo.")
  if (has(a.acquisition, "publicidad"))
    push("adquisicion", 1, "Ya inviertes en publicidad, así que cada visita que no convierte cuesta dinero.")

  const cierre = a.closeProcess as string
  if (cierre === "manual-todo")
    push("adquisicion", 3, "Cada persona interesada te obliga a empezar la conversación desde cero.")
  if (cierre === "manual-cotiza")
    push("adquisicion", 2, "Armas cada cotización a mano.")
  if (cierre === "automatizado")
    push("adquisicion", -2, "Tus clientes ya pueden avanzar sin que intervengas.")

  // ── Operación ──
  const manual = asArray(a.manualWork).filter((x) => x !== "ninguno")
  if (has(a.manualWork, "ninguno"))
    push("operacion", -3, "Tu operación ya está sistematizada en su mayor parte.")
  if (manual.length >= 4)
    push("operacion", 4, `Llevas a mano ${manual.length} procesos distintos del día a día.`)
  else if (manual.length >= 2)
    push("operacion", 2, `Hay ${manual.length} procesos que todavía haces a mano.`)
  else if (manual.length === 1) push("operacion", 1, "Queda un proceso importante sin sistematizar.")

  const tools = a.tools as string
  if (tools === "papel") push("operacion", 3, "La información del negocio vive en papel o en la memoria.")
  if (tools === "excel") push("operacion", 2, "Llevas el negocio en hojas de cálculo.")
  if (tools === "sistema") push("operacion", -2, "Ya tienes un sistema que integra buena parte de la operación.")

  // ── Experiencia del cliente ──
  const asks = asArray(a.customerAsks).filter((x) => x !== "pocas")
  if (has(a.customerAsks, "pocas"))
    push("clientes", -3, "Tus clientes tienen claro qué ofreces y cómo comprarte.")
  if (asks.length >= 3)
    push("clientes", 3, "Tus clientes te preguntan varias cosas que podrían resolver solos.")
  else if (asks.length >= 1) push("clientes", 1, "Hay preguntas que se repiten y consumen tiempo.")

  if (has(a.customerAsks, "precios"))
    push("clientes", 1, "El precio se pregunta una y otra vez por mensaje.")
  if (has(a.customerAsks, "disponibilidad"))
    push("clientes", 1, "La disponibilidad se consulta contigo en vez de verse sola.")
  if (has(a.customerAsks, "estado"))
    push("clientes", 2, "Tus clientes dependen de ti para saber cómo va lo suyo.")

  // ── Tecnología ──
  if (tools === "papel") push("tecnologia", 3, "No hay herramientas digitales que sostengan la operación.")
  if (tools === "excel") push("tecnologia", 2, "Las hojas de cálculo no se conectan con nada más.")
  if (tools === "apps") push("tecnologia", 2, "Usas varias herramientas que no se hablan entre sí.")
  if (tools === "sistema") push("tecnologia", -3, "Tus herramientas ya están integradas.")

  // ── Escalabilidad ──
  const size = a.size as string
  if ((size === "6-20" || size === "20+") && manual.length >= 2)
    push("escalabilidad", 3, "Con un equipo de ese tamaño, los procesos manuales se multiplican por persona.")
  if (size === "solo" && manual.length >= 3)
    push("escalabilidad", 3, "Todo el trabajo manual pasa por ti: eres el cuello de botella.")
  if (a.priority === "crecer")
    push("escalabilidad", 2, "Quieres crecer, y hoy el crecimiento se traduce en más trabajo manual.")
  if (a.timeline === "urgente") push("escalabilidad", 1, "El tiempo apremia.")
  if (tools === "sistema" && manual.length === 0)
    push("escalabilidad", -2, "La base para crecer ya está puesta.")

  // La prioridad declarada pesa sobre su dimensión: es lo que la persona dijo
  // que le duele, y ninguna inferencia nuestra debería ganarle.
  const prio = a.priority as string
  if (prio === "vender-mas") {
    push("presencia", 2, "Dijiste que lo que más te importa es que te encuentren y te compren.")
    push("adquisicion", 2, "Tu prioridad declarada es vender más.")
  }
  if (prio === "menos-manual")
    push("operacion", 3, "Dijiste que tu prioridad es dejar de hacer tanto a mano.")
  if (prio === "atender-mejor")
    push("clientes", 3, "Dijiste que quieres que tus clientes resuelvan solos.")
  if (prio === "ordenar") {
    push("operacion", 2, "Dijiste que quieres el negocio ordenado y medido.")
    push("tecnologia", 2, "Ordenar el negocio pasa por tener dónde registrar lo que ocurre.")
  }

  return s
}

function scoreToState(score: number): DimensionState {
  if (score >= 4) return "prioridad"
  if (score >= 2) return "oportunidad"
  if (score >= 0) return "funcional"
  return "solido"
}

function evaluateDimensions(signals: Signal[]): DimensionResult[] {
  return DIMENSIONS.map(({ id, label }) => {
    const own = signals.filter((s) => s.dim === id)
    const score = own.reduce((sum, s) => sum + s.weight, 0)
    return {
      id,
      label,
      state: scoreToState(score),
      // Solo las señales que empujaron hacia arriba explican un problema.
      evidence: own.filter((s) => s.weight > 0).map((s) => s.evidence),
    }
  })
}

/** ¿Qué tan grande puede ser la primera etapa? Aquí —y solo aquí— entran los ingresos. */
type Capacidad = "acotada" | "media" | "amplia"

function capacidad(a: Answers): Capacidad {
  const r = a.revenue as string
  const size = a.size as string
  // Sin dato de ingresos se usa el tamaño del equipo, que es un proxy honesto
  // y que la persona sí quiso responder.
  if (!r || r === "prefiero-no") {
    if (size === "solo") return "acotada"
    if (size === "20+") return "amplia"
    return "media"
  }
  if (r === "menos-50k") return "acotada"
  if (r === "50k-150k") return "media"
  return "amplia"
}

const GIRO_LABEL: Record<string, string> = {
  restaurante: "restaurante",
  retail: "comercio",
  servicios: "negocio de servicios",
  fitness: "negocio fitness",
  salud: "consultorio",
  eventos: "negocio de eventos",
  b2b: "negocio B2B",
  otro: "negocio",
}

/**
 * ── CAPA COMERCIAL ────────────────────────────────────────────────────────
 *
 * El diagnóstico dice qué le pasa al negocio. Esta capa decide desde qué
 * nivel de la escalera conviene partir. Son dos preguntas distintas y antes
 * estaban colapsadas: la categoría de diagnóstico se usaba como si fuera el
 * nivel comercial, y el precio salía de una constante global.
 *
 * Las reglas de abajo se apoyan SOLO en evidencia del cuestionario. No se
 * infiere "tu proceso es único" de que el negocio sea grande o facture bien.
 */

/** Herramientas de la operación que implican registro persistente. */
const OPERACION_PERSISTENTE = ["inventario", "cobros", "recordatorios"] as const

/**
 * ¿Hace falta una capa privada además del sitio público?
 *
 * La distinción que importa: "pedir una cita" cabe en una Web Activa; "entrar,
 * ver mis citas y administrar disponibilidad" ya es Plataforma. Por eso
 * `estado` —el cliente necesita consultar cómo va lo suyo— pesa por sí solo:
 * implica cuentas y registros que persisten entre visitas.
 */
function necesitaCapaPrivada(a: Answers, byId: Record<DimensionId, DimensionResult>): boolean {
  const manual = asArray(a.manualWork).filter((x) => x !== "ninguno")
  const size = a.size as string
  const persistentes = manual.filter((m) =>
    (OPERACION_PERSISTENTE as readonly string[]).includes(m)
  )

  // Señal inequívoca: el cliente necesita entrar a consultar lo suyo. Eso no
  // se resuelve con un formulario, necesita cuenta y registro persistente.
  if (has(a.customerAsks, "estado")) return true

  /**
   * Un solo proceso persistente NO basta. Casi todo negocio pequeño registra
   * cobros a mano; tomar eso como prueba de que necesita una plataforma es
   * cómo se acaba ofreciendo $24,900 a quien pidió una página.
   */
  if (persistentes.length >= 2) return true
  if (persistentes.length >= 1 && byId.operacion.state === "prioridad" && manual.length >= 3)
    return true

  // Equipo grande con la operación pesando: aparecen puestos distintos y, con
  // ellos, permisos distintos.
  if (byId.operacion.state === "prioridad" && (size === "6-20" || size === "20+")) return true

  return false
}

/**
 * ¿Hay evidencia suficiente para una app a medida?
 *
 * CONSERVADOR A PROPÓSITO. Facturar bien o tener equipo grande NO son
 * señales: un negocio de veinte personas puede necesitar una Web Activa. Lo
 * que justifica construir alrededor del proceso es que el proceso esté
 * repartido en varios frentes manuales Y que las herramientas actuales no se
 * hablen entre sí. Sin las dos cosas, Plataforma alcanza.
 */
function evidenciaDeApp(a: Answers, byId: Record<DimensionId, DimensionResult>): boolean {
  const manual = asArray(a.manualWork).filter((x) => x !== "ninguno")
  const tools = a.tools as string

  const variosProcesos = manual.length >= 4
  const operacionCritica = byId.operacion.state === "prioridad"
  const tecnologiaNotable =
    byId.tecnologia.state === "prioridad" || byId.tecnologia.state === "oportunidad"
  const herramientasSinConectar = tools === "papel" || tools === "excel" || tools === "apps"
  /**
   * Escala. Coordinar varios procesos a mano solo es un problema cuando hay a
   * quién coordinar: una persona sola con cinco procesos manuales necesita
   * quitarse trabajo de encima, no una aplicación construida a medida.
   */
  const hayEquipo = (a.size as string) !== "solo"

  return variosProcesos && operacionCritica && tecnologiaNotable && herramientasSinConectar && hayEquipo
}

/**
 * La función acotada que incluye una Web Activa, elegida por evidencia.
 *
 * No todas las Web Activa son iguales: la herramienta sale de lo que el
 * cliente pregunta hoy. Cuando no hay señal específica NO se inventa un
 * cotizador ni una agenda — se ofrece captación estructurada, que es honesta
 * y sirve a cualquier giro.
 */
function funcionAcotada(a: Answers): { corta: string; larga: string } {
  const cierre = a.closeProcess as string

  if (has(a.customerAsks, "precios") || cierre === "manual-cotiza")
    return {
      corta: "Un cotizador acotado",
      larga: "un cotizador que arme la propuesta antes de que te escriban",
    }
  if (has(a.customerAsks, "disponibilidad"))
    return {
      corta: "Solicitud de cita o reserva",
      larga: "una solicitud de cita o reserva que te llegue ya ordenada",
    }
  if (has(a.customerAsks, "catalogo"))
    return {
      corta: "Catálogo administrable",
      larga: "un catálogo que puedas actualizar tú sin pedirnos nada",
    }
  return {
    corta: "Captación y calificación de solicitudes",
    larga: "un formulario que califique la solicitud antes de que llegue a tu teléfono",
  }
}

/**
 * Fases de una Web Activa según la capacidad.
 *
 * Los ingresos NO mueven el nivel —eso lo decide la evidencia— pero sí el
 * tamaño de la primera etapa. Sin esto, responder ingresos no cambiaba nada
 * en los niveles de entrada, y una pregunta que no se usa no debería estar en
 * el cuestionario.
 */
function fasesWebActiva(cap: Capacidad, tool: { corta: string }, sitio: string): string[] {
  const base = [
    cap === "acotada" ? `${sitio}, enfocado en lo que más se pregunta` : sitio,
    tool.corta,
    "Tu panel para administrarlo",
  ]
  if (cap === "amplia") base.push("Estructura de contenido para crecer sin rehacer")
  return base
}

function buildRecommendation(
  a: Answers,
  dims: DimensionResult[],
  cap: Capacidad
): Recommendation {
  const byId = Object.fromEntries(dims.map((d) => [d.id, d])) as Record<DimensionId, DimensionResult>
  const grave = (id: DimensionId) => byId[id].state === "prioridad"
  const notable = (id: DimensionId) => grave(id) || byId[id].state === "oportunidad"

  const industry = a.industry as string
  const manual = asArray(a.manualWork).filter((x) => x !== "ninguno")

  // ── Producto propio: solo cuando el giro Y la necesidad encajan ──
  if (industry === "fitness" && (notable("operacion") || notable("clientes"))) {
    // ACTIIVA no tiene fecha, así que la recomendación accionable de HOY es un
    // nivel de la escalera vigente. Antes aquí se ofrecía "presencia pública",
    // que es justo el producto que USERS dejó de vender.
    const capaPrivada = necesitaCapaPrivada(a, byId)
    const tool = funcionAcotada(a)
    return {
      category: "product",
      product: "ACTIIVA",
      offer: capaPrivada ? "plataforma" : "web-activa",
      title: "Un producto pensado para tu giro, y algo que ya puedes resolver hoy",
      body: capaPrivada
        ? "Por lo que nos cuentas, tu operación se parece mucho a la de los negocios para los que estamos construyendo ACTIIVA: membresías, reservas y cobros en un mismo lugar. Todavía está en desarrollo, así que no podemos prometerte fecha ni precio. Mientras tanto, la parte que ya te está costando —que socios y equipo entren y resuelvan sin pasar por ti— sí se puede construir desde ahora."
        : `Por lo que nos cuentas, tu giro es el de los negocios para los que estamos construyendo ACTIIVA: membresías, reservas y cobros en un mismo lugar. Todavía está en desarrollo, así que no podemos prometerte fecha ni precio. Mientras tanto sí se puede resolver lo inmediato: una presencia que trabaje, con ${tool.larga}.`,
      fase_inicial: capaPrivada
        ? ["Acceso para socios y equipo con lo que hoy se pregunta y se cobra", "Presencia pública conectada a ese acceso"]
        : fasesWebActiva(cap, tool, "Presencia que explique el negocio y capte contacto"),
      evolucion: [
        "Acceso anticipado a ACTIIVA cuando esté disponible",
        "O seguir creciendo el desarrollo propio si prefieres no esperar",
      ],
    }
  }
  /**
   * Salud ya no tiene producto propio.
   *
   * El diagnóstico de un consultorio sale de sus necesidades, como el de
   * cualquier otro giro. Tampoco se presenta a USERS como especialista en
   * regulación sanitaria: haber explorado el sector no nos vuelve expertos
   * en sus permisos, y afirmarlo sería vender algo que no podemos sostener.
   */

  // ── No hay nada que construir ──
  const todoOrdenado =
    !notable("operacion") && !notable("tecnologia") && manual.length <= 1

  if (todoOrdenado && !notable("presencia") && !notable("clientes")) {
    return {
      category: "no_custom",
      offer: null,
      title: "No vemos un problema que justifique construir algo ahora",
      body: "Por tus respuestas, ni tu presencia ni tu operación están frenando al negocio. Preferimos decírtelo a venderte un proyecto que no vas a aprovechar. Si más adelante crece el volumen o aparece un cuello de botella, ahí sí conviene revisarlo.",
      fase_inicial: ["Nada urgente"],
      evolucion: ["Volver a revisarlo cuando cambie el volumen, el equipo o los canales de venta"],
    }
  }

  const web = a.hasWebsite as string
  const capaPrivadaBruta = necesitaCapaPrivada(a, byId)
  const tool = funcionAcotada(a)

  /**
   * ── Operación pesada ──
   *
   * La operación tiene que ser al menos tan grave como la presencia para
   * recomendar construir hacia adentro. Sin esta condición, un negocio sin
   * sitio web y con un solo proceso manual recibía "construyamos un sistema":
   * es venderle lo grande cuando su problema es lo básico.
   */
  /**
   * LA PRESENCIA NO SE PUEDE SALTAR.
   *
   * Sin presencia digital real —sin sitio, o solo redes— una capa privada no
   * tiene a quién servir todavía, y el dueño que dijo "quiero que me
   * encuentren" no está pidiendo una plataforma. Cuando la presencia pesa al
   * menos tanto como la operación, se empieza por Web Activa y la operación
   * queda en la evolución. No es vender menos: es el orden correcto.
   */
  const sinPresenciaReal = web === "no" || web === "redes"
  /**
   * La excepción: cuando el negocio lleva a mano DOS o más procesos que
   * exigen registro persistente —cobros, inventario, vencimientos—, su
   * problema no es el sitio web. Un supermercado que cobra y controla
   * inventario en papel necesita la operación primero, tenga o no página.
   */
  const operacionInequivoca =
    manual.filter((m) => (OPERACION_PERSISTENTE as readonly string[]).includes(m)).length >= 2
  const presenciaPrimero =
    sinPresenciaReal &&
    !operacionInequivoca &&
    STATE_RANK[byId.presencia.state] <= STATE_RANK[byId.operacion.state]

  const operacionPesada =
    !presenciaPrimero &&
    (grave("operacion") || (notable("operacion") && grave("tecnologia"))) &&
    STATE_RANK[byId.operacion.state] <= STATE_RANK[byId.presencia.state]

  if (operacionPesada) {
    /**
     * Aquí se decide Plataforma vs App a medida, y NO lo decide la capacidad.
     * Los ingresos ajustan el tamaño de la primera etapa más abajo; el nivel
     * sale de la evidencia de operación y tecnología.
     */
    const esApp = evidenciaDeApp(a, byId)
    const acotado = cap === "acotada"

    if (esApp) {
      return {
        category: "software",
        offer: "app-a-medida",
        title: acotado
          ? "Una app a medida, empezando por el proceso que más te cuesta"
          : "Una app a medida construida sobre tu operación",
        body: acotado
          ? "Tienes varios procesos a mano y herramientas que no se hablan entre sí: eso ya no se arregla con una herramienta de catálogo. Con el tamaño actual del negocio conviene construir por etapas, empezando por el proceso que más tiempo te quita."
          : "Tienes varios procesos a mano y la información vive en herramientas que no se conectan. Ahí es donde una app construida alrededor de tu operación deja de ser un lujo: es lo que permite que un dato se registre una vez y sirva en todos lados.",
        fase_inicial: acotado
          ? ["El proceso manual que más tiempo consume", "Los accesos y permisos mínimos para usarlo"]
          : ["El proceso principal de la operación, con cuentas y permisos", "Presencia pública conectada"],
        evolucion: acotado
          ? ["Sumar los demás procesos conforme se justifiquen", "Conectar lo que hoy se captura dos veces"]
          : ["Los procesos restantes", "Tableros y reportes", "Integraciones con lo que ya usas"],
      }
    }

    return {
      category: "software",
      offer: "plataforma",
      /**
       * Fallback conservador. Con 12 preguntas no siempre se puede distinguir
       * "necesita una capa de operación" de "necesita una app construida
       * sobre un proceso propio". Ante la duda se recomienda el nivel menor y
       * se avisa de que el descubrimiento puede mover el alcance — nunca al
       * revés, que sería vender de más sobre una suposición.
       */
      podriaEscalar: true,
      title: acotado
        ? "Una plataforma, empezando por lo que más te cuesta"
        : "Una plataforma que sostenga la operación, por etapas",
      body: acotado
        ? "Lo que más te está costando es la operación diaria. Con el tamaño actual del negocio, construir todo de una vez sería sobredimensionado: conviene empezar por el proceso que más tiempo te quita y crecer desde ahí."
        : "La operación es hoy el cuello de botella. Tiene sentido una plataforma propia, pero por etapas: primero lo que más duele, después el resto.",
      fase_inicial: acotado
        ? ["El proceso manual que más tiempo consume", "Presencia pública si todavía no existe"]
        : ["La operación principal con cuentas y permisos", "Presencia pública conectada"],
      evolucion: acotado
        ? ["Sumar los demás procesos conforme se justifiquen", "Portal para que tus clientes consulten solos"]
        : ["Roles y permisos por puesto", "Portal de clientes", "Reportes y control"],
    }
  }

  // ── El cliente necesita entrar y consultar: capa privada ──
  if (capaPrivadaBruta && !presenciaPrimero) {
    return {
      category: "web_plus",
      offer: "plataforma",
      podriaEscalar: true,
      title: "Una plataforma donde tu cliente entre y resuelva solo",
      body: "Lo que te están pidiendo no se resuelve con un formulario: necesitan consultar cómo va lo suyo, y eso implica una cuenta y un registro que siga ahí la próxima vez que entren.",
      fase_inicial: [
        "Acceso para que tu cliente consulte su información",
        "Presencia pública que explique el negocio",
      ],
      evolucion: ["Que el equipo administre desde el mismo lugar", "Reportes y seguimiento"],
    }
  }

  // ── Clientes preguntando de más: Web Activa con herramienta ──
  if (notable("clientes") || notable("adquisicion")) {
    return {
      category: "web_plus",
      offer: "web-activa",
      title: "Una web que además haga trabajo, no solo que se vea bien",
      body: `Tu presencia no solo tiene que explicar el negocio: por lo que nos cuentas, conviene que incluya ${tool.larga}. Ahí es donde se recupera el tiempo que hoy se va en responder lo mismo.`,
      fase_inicial: fasesWebActiva(cap, tool, "Sitio con la información que hoy se pregunta"),
      evolucion:
        cap === "acotada"
          ? ["Ampliar la herramienta cuando el volumen lo pida", "Conectar con tu operación interna"]
          : ["Conectar con tu operación interna", "Automatizar seguimientos"],
    }
  }

  // ── Por defecto: Web Activa ──
  return {
    category: "web",
    offer: "web-activa",
    title: "Empezar por una presencia que trabaje",
    body: `Por tus respuestas, el punto de mayor retorno hoy está en la presencia: que te encuentren, que entiendan qué haces y que puedan avanzar sin esperar a que contestes. Incluye ${tool.larga}, para que el sitio no se quede en explicar.`,
    fase_inicial: fasesWebActiva(cap, tool, "Sitio que explique el negocio y capte contacto"),
    evolucion:
      cap === "amplia"
        ? ["Sumar herramientas conforme el volumen lo pida", "Conectar con tu operación interna"]
        : ["Ampliar la herramienta cuando el volumen lo pida", "Conectar con tu operación interna"],
  }
}

function buildOpportunities(dims: DimensionResult[], rec: Recommendation): Opportunity[] {
  const ordered = [...dims].sort((a, b) => STATE_RANK[a.state] - STATE_RANK[b.state])
  const relevantes = ordered.filter((d) => d.state === "prioridad" || d.state === "oportunidad")

  const COPY: Record<DimensionId, { title: string; body: string; solution?: string }> = {
    presencia: {
      title: "Que tu presencia explique y capte",
      body: "Un lugar propio donde se entienda qué haces, para quién y cómo contratarte.",
      solution: "/soluciones/desarrollo-web",
    },
    adquisicion: {
      title: "Acortar el camino entre interés y conversación",
      body: "Que quien se interesa pueda avanzar sin esperar a que contestes.",
      solution: "/soluciones/cotizadores-digitales",
    },
    operacion: {
      title: "Quitar de encima el trabajo repetido",
      body: "Registrar una vez lo que hoy se anota en varios lados, con accesos por puesto.",
      solution: "/soluciones/software-a-medida",
    },
    clientes: {
      title: "Que el cliente resuelva solo lo que hoy pregunta",
      body: "Consultar, reservar o cotizar sin que alguien tenga que contestar.",
      solution: "/soluciones/portales-para-clientes",
    },
    tecnologia: {
      title: "Conectar lo que hoy vive separado",
      body: "Que la información deje de copiarse de una herramienta a otra.",
      solution: "/soluciones/software-a-medida",
    },
    escalabilidad: {
      title: "Preparar el negocio para el siguiente escalón",
      body: "Que crecer no signifique contratar a alguien para hacer lo mismo a mano.",
    },
  }

  const horizontes: Horizon[] = ["ahora", "despues", "mas_adelante"]
  // Cuando no hay nada urgente, no se inventan oportunidades para llenar.
  if (relevantes.length === 0) return []

  return relevantes.slice(0, 3).map((d, i) => ({
    horizon: horizontes[i] ?? "mas_adelante",
    title: COPY[d.id].title,
    body: COPY[d.id].body,
    // Sin proyecto recomendado no se enlaza a vender nada.
    solution: rec.offer === null ? undefined : COPY[d.id].solution,
  }))
}

function buildHeadline(a: Answers, prioridad: DimensionResult, rec: Recommendation): string {
  const giro = GIRO_LABEL[a.industry as string] ?? "negocio"
  if (rec.offer === null)
    return `Por ahora tu ${giro} no necesita que construyamos nada: lo que tienes está funcionando.`
  if (rec.category === "product")
    return `Tu ${giro} encaja con un producto que ya estamos construyendo, y con algo que sí se puede resolver desde ahora.`

  switch (prioridad.id) {
    case "operacion":
      return `Antes de vender más, conviene que tu ${giro} deje de sostenerse en trabajo manual.`
    case "clientes":
      return `Tu siguiente paso no parece ser más publicidad: es que tus clientes puedan resolver solos lo que hoy te preguntan.`
    case "adquisicion":
      return `El interés existe; lo que falta es que el camino de interesado a cliente no dependa de que tú contestes.`
    case "tecnologia":
      return `El problema no es falta de esfuerzo: es que la información de tu ${giro} vive en lugares que no se hablan.`
    case "escalabilidad":
      return `Tu ${giro} funciona hoy, pero lo que lo sostiene no aguantaría el doble de volumen.`
    default:
      return `El punto de mayor retorno para tu ${giro} está en convertir tu presencia en una herramienta comercial.`
  }
}

function buildReasons(a: Answers, dims: DimensionResult[], rec: Recommendation): string[] {
  const razones: string[] = []
  const conEvidencia = dims
    .filter((d) => d.evidence.length > 0)
    .sort((x, y) => STATE_RANK[x.state] - STATE_RANK[y.state])

  for (const d of conEvidencia.slice(0, 3)) {
    razones.push(d.evidence[0])
  }
  if (rec.offer === null && razones.length === 0) {
    razones.push("Tus respuestas no muestran procesos manuales ni preguntas repetidas que justifiquen construir un sistema.")
  }
  return razones.slice(0, 4)
}

function newRef(): string {
  return `DX-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
}

export function diagnose(a: Answers, ref = newRef()): Diagnosis {
  const signals = collectSignals(a)
  const dimensions = evaluateDimensions(signals)
  const cap = capacidad(a)

  const ordered = [...dimensions].sort((x, y) => STATE_RANK[x.state] - STATE_RANK[y.state])
  const prioridad = ordered[0]

  const recomendacion = buildRecommendation(a, dimensions, cap)
  const oportunidades = buildOpportunities(dimensions, recomendacion)

  const observaciones = dimensions
    .filter((d) => d.state === "prioridad" || d.state === "oportunidad")
    .flatMap((d) => d.evidence)
    .slice(0, 5)

  /**
   * ¿Hay que cotizar en vez de dar un punto de partida y ya?
   *
   * Cualquier nivel por encima de la entrada depende demasiado del alcance
   * como para insinuar que el "desde" alcanza. Y una Web Activa cuyo nivel se
   * eligió de forma conservadora también: el descubrimiento puede moverlo.
   */
  const offer = recomendacion.offer
  const requiereCotizacion =
    offer === "plataforma" || offer === "app-a-medida" || recomendacion.podriaEscalar === true

  // El nivel y su precio salen de siteConfig. Ninguna cifra vive aquí.
  const nivel = offer ? getOffer(offer).name : null
  const desde = offer ? siteConfig.pricing.offerLabel(offer) : null

  return {
    headline: buildHeadline(a, prioridad, recomendacion),
    prioridad,
    dimensions,
    observaciones,
    oportunidades,
    recomendacion,
    razones: buildReasons(a, dimensions, recomendacion),
    inversion: {
      /**
       * El precio corresponde al NIVEL recomendado, no a un piso global.
       * Antes decía "Proyectos desde $12,900" incluso al recomendar una
       * operación completa: el piso de la entrada bajo una propuesta tres
       * veces mayor.
       */
      nivel,
      desde,
      entrada: nivel && desde ? `${nivel} desde ${desde}` : "Sin inversión recomendada por ahora",
      nota: !offer
        ? "No hay nada que cotizar ahora mismo, y eso también es un resultado."
        : requiereCotizacion
          ? "Es un punto de partida, no una cotización: el alcance exacto se define contigo después de revisar el caso."
          : "Es un punto de partida. El precio final depende del contenido, de la herramienta que se incluya y de las integraciones.",
      requiereCotizacion,
    },
    ref,
  }
}
