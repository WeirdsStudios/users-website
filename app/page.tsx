import Header from "@/components/site/Header"
import Footer from "@/components/site/Footer"
import Hero from "@/components/sections/Hero"
import Capas from "@/components/sections/Capas"
import Niveles from "@/components/sections/Niveles"
import CasosHome from "@/components/sections/CasosHome"
import ProductosUsers from "@/components/sections/ProductosUsers"
import Equipo from "@/components/sections/Equipo"
import ComoTrabajamos from "@/components/sections/ComoTrabajamos"
import CentroAtencion from "@/components/sections/CentroAtencion"
import MotorCTA from "@/components/sections/MotorCTA"
import Testimonials from "@/components/sections/Testimonials"
import FinalCTA from "@/components/sections/FinalCTA"

/**
 * Recorrido:
 *   qué construimos → cómo se compone → por dónde entrar y cuánto cuesta →
 *   evidencia → producto propio → cómo trabajamos → quién responde →
 *   qué pasa después → cómo empezar → prueba social → cierre
 *
 * Capas y Niveles van juntos y temprano: primero el principio (una web se ve,
 * hace y se administra) y enseguida el precio de entrada. Para el negocio al
 * que le hablamos —ya vende, no es técnico, quiere saber si esto es para él—
 * esas dos respuestas son las que deciden si sigue leyendo.
 *
 * Casos y producto van antes que Equipo: primero la prueba de que el trabajo
 * existe, después quién lo hizo.
 *
 * Cambios de esta fase:
 *   · Soluciones ("tres frentes del mismo negocio digital") → sustituida por
 *     Capas. La división por áreas de negocio sigue viva como índice en
 *     /soluciones, que es donde sirve; en la home no decía lo que ahora es la
 *     posición comercial: que el nivel de entrada ya no es un sitio informativo.
 *   · Niveles → nueva. La escalera con precios no existía en el sitio.
 *   · ComoTrabajamos pasa antes que Equipo: el proceso responde "qué me va a
 *     pasar", y la rendición de cuentas personal cierra esa respuesta.
 */
export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Capas />
        <Niveles />
        <CasosHome />
        <ProductosUsers />
        <ComoTrabajamos />
        <Equipo />
        <CentroAtencion />
        <MotorCTA />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}
