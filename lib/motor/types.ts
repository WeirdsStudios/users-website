import type { OfferId } from "@/lib/site-config"

/**
 * Motor de Análisis — modelo del diagnóstico.
 *
 * PROBLEMA QUE RESUELVE ESTA VERSIÓN
 * La anterior preguntaba 16 cosas sobre el negocio y usaba 6. Ingresos,
 * clientes al mes, ticket promedio, años operando, empleados, sucursales,
 * cómo consigue clientes, si tiene sitio, qué le urge y su presupuesto se
 * guardaban en la base y no tocaban ninguna conclusión. El resultado era el
 * mismo para dos negocios completamente distintos del mismo giro.
 *
 * REGLA ESTRUCTURAL
 * Cada pregunta declara a qué dimensión alimenta. Una pregunta sin dimensión
 * no se puede añadir al cuestionario: el tipo no lo permite. Es la única
 * forma de que "si lo pregunto, lo uso" sobreviva a la siguiente edición.
 */

/** Las seis dimensiones que el cuestionario puede alimentar de verdad. */
export type DimensionId =
  | "presencia"
  | "adquisicion"
  | "operacion"
  | "clientes"
  | "tecnologia"
  | "escalabilidad"

export const DIMENSIONS: { id: DimensionId; label: string; question: string }[] = [
  {
    id: "presencia",
    label: "Presencia",
    question: "¿Te encuentran, te entienden y pueden contactarte?",
  },
  {
    id: "adquisicion",
    label: "Adquisición",
    question: "¿De dónde llegan tus clientes y qué tan predecible es?",
  },
  {
    id: "operacion",
    label: "Operación",
    question: "¿Cuánto del trabajo diario es manual o repetido?",
  },
  {
    id: "clientes",
    label: "Experiencia del cliente",
    question: "¿Cuántas cosas tiene que preguntarte tu cliente para avanzar?",
  },
  {
    id: "tecnologia",
    label: "Tecnología",
    question: "¿Las herramientas que ya usas se hablan entre sí?",
  },
  {
    id: "escalabilidad",
    label: "Escalabilidad",
    question: "¿Qué se rompe primero si el negocio crece al doble?",
  },
]

/**
 * Estado de una dimensión.
 *
 * Categorías, no porcentajes. Un "73/100" se ve profesional y no significa
 * nada: nadie puede explicar por qué no fue 71. Estas cuatro sí se pueden
 * sostener frente a la persona que respondió.
 */
export type DimensionState = "solido" | "funcional" | "oportunidad" | "prioridad"

export const STATE_LABEL: Record<DimensionState, string> = {
  solido: "Bien resuelto",
  funcional: "Funciona, con margen",
  oportunidad: "Oportunidad clara",
  prioridad: "Prioridad",
}

/** Orden de severidad: lo primero es lo que más urge. */
export const STATE_RANK: Record<DimensionState, number> = {
  prioridad: 0,
  oportunidad: 1,
  funcional: 2,
  solido: 3,
}

export interface DimensionResult {
  id: DimensionId
  label: string
  state: DimensionState
  /**
   * Por qué salió así, en palabras de la persona. Cada entrada procede de una
   * respuesta concreta: si no hay evidencia, no hay observación.
   */
  evidence: string[]
}

/** Momento en que conviene atacar cada oportunidad. */
export type Horizon = "ahora" | "despues" | "mas_adelante"

export const HORIZON_LABEL: Record<Horizon, string> = {
  ahora: "Ahora",
  despues: "Después",
  mas_adelante: "Más adelante",
}

export interface Opportunity {
  horizon: Horizon
  title: string
  body: string
  /** Solución de USERS relacionada, si aplica. */
  solution?: string
}

/**
 * Familia de DIAGNÓSTICO. Describe qué le pasa al negocio.
 *
 * NO es el nivel comercial. Se conserva porque sigue siendo útil —separa
 * "necesita presencia" de "necesita operación" de "no necesita nada"— y
 * porque ya viaja a analytics y a la base desde hace meses; cambiarla
 * rompería la comparación histórica de los leads.
 *
 * Lo que cambia es que ya no se usa como sustituto del precio: para eso
 * está `offer`.
 */
export type RecommendationCategory =
  | "web"
  | "web_plus"
  | "software"
  | "product"
  | "no_custom"

export interface Recommendation {
  category: RecommendationCategory
  /**
   * Nivel comercial desde el que parte la propuesta.
   *
   * SEPARADO DEL DIAGNÓSTICO A PROPÓSITO. Antes el precio salía de una
   * constante global y decía "proyectos desde $12,900" incluso cuando la
   * recomendación era una operación completa: un piso tres veces menor al
   * nivel que acababa de recomendar.
   *
   * `null` significa que no hay proyecto que vender ahora mismo —y eso es una
   * respuesta legítima, no un hueco que rellenar.
   */
  offer: OfferId | null
  title: string
  body: string
  /**
   * Producto propio cuando el giro y las necesidades encajan.
   *
   * Convive con `offer`: el producto es un camino futuro sin fecha, y `offer`
   * es lo que sí se puede resolver hoy. Nunca lleva precio.
   */
  product?: "ACTIIVA"
  /** Qué construiríamos primero. */
  fase_inicial: string[]
  /** Qué puede esperar a una segunda etapa. */
  evolucion: string[]
  /**
   * true cuando el nivel se eligió de forma conservadora y el descubrimiento
   * podría revelar que hace falta uno mayor. Se dice, no se esconde.
   */
  podriaEscalar?: boolean
}

export interface Diagnosis {
  /** Titular derivado del diagnóstico, no una frase fija. */
  headline: string
  /** Dimensión que más pesa ahora. */
  prioridad: DimensionResult
  dimensions: DimensionResult[]
  /** Entre 3 y 5, solo con evidencia. */
  observaciones: string[]
  oportunidades: Opportunity[]
  recomendacion: Recommendation
  /** Por qué esta recomendación y no otra. Conecta respuestas reales. */
  razones: string[]
  /** Contexto de inversión. Nunca una cifra cerrada del proyecto. */
  inversion: {
    /** Nombre del nivel, p. ej. "Web Activa". Vacío cuando no hay proyecto. */
    nivel: string | null
    /** "$12,900 MXN" del nivel recomendado. Vacío cuando no hay proyecto. */
    desde: string | null
    /** Frase completa ya armada, para superficies que solo quieren una línea. */
    entrada: string
    nota: string
    /** true cuando el alcance obliga a cotizar en vez de dar un punto de partida. */
    requiereCotizacion: boolean
  }
  /** Identificador corto para retomar la conversación. */
  ref: string
}
