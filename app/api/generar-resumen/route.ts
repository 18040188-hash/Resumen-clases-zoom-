import { NextResponse } from "next/server";

export const runtime = "nodejs";

const divergentConvergent = {
  title: "Divergent and Convergent Thinking",
  resumen_corto: [
    "El pensamiento divergente sirve para generar muchas ideas distintas sin juzgarlas demasiado pronto.",
    "El pensamiento convergente ayuda a comparar opciones y elegir las que mejor responden al problema.",
    "Un proceso creativo sólido alterna entre explorar posibilidades y enfocar la solución con criterios claros."
  ],
  temas_clave: [
    "Divergente: ampliar posibilidades, hacer asociaciones y priorizar variedad de ideas.",
    "Convergente: evaluar opciones según impacto, viabilidad, recursos y necesidades del usuario.",
    "Ambos enfoques se complementan y pueden repetirse durante el proceso de diseño."
  ],
  preclass: [
    "Lectura previa de referencia sobre pensamiento divergente y convergente: distinguir generación de ideas de selección y evaluación.",
    "Llega con un problema cotidiano que pueda explorarse desde varias perspectivas."
  ],
  actividades_breakout: [
    "En equipos, reformular un problema y proponer alternativas sin evaluarlas durante la primera ronda.",
    "Agrupar las ideas y elegir una propuesta usando criterios compartidos; explicar qué se eligió y qué se descartó."
  ],
  mision_alumno: [
    "Explica con tus palabras la diferencia entre pensamiento divergente y convergente.",
    "Genera al menos cinco soluciones para un problema cotidiano antes de elegir una.",
    "Define dos criterios para evaluar tus ideas y justifica cuál probarías primero."
  ],
  pregunta_hmw: "¿Cómo podríamos generar más ideas diversas sin perder de vista cuáles son viables y útiles para las personas?"
};

const generic = {
  title: "Conceptos clave y aplicación práctica",
  resumen_corto: [
    "Identifica la idea central de la sesión y el problema que busca resolver.",
    "Relaciona los conceptos principales con ejemplos concretos.",
    "Usa criterios claros para convertir lo aprendido en una decisión o acción."
  ],
  temas_clave: [
    "Conceptos y definiciones centrales de la materia.",
    "Aplicación práctica de los conceptos a un caso o problema.",
    "Evaluación de alternativas con criterios explícitos."
  ],
  preclass: [
    "Revisa las lecturas o materiales previos indicados por la persona docente.",
    "Anota una duda y un ejemplo que conecte la lectura con una situación real."
  ],
  actividades_breakout: [
    "Discute el caso con tu equipo y compara distintas perspectivas.",
    "Sinteticen una conclusión común y expliquen qué evidencia la respalda."
  ],
  mision_alumno: [
    "Resume el concepto principal sin consultar tus apuntes.",
    "Prepara un ejemplo propio y una pregunta para la próxima clase.",
    "Identifica qué parte del tema necesitas repasar."
  ],
  pregunta_hmw: "¿Cómo podríamos aplicar lo aprendido para resolver un problema real de forma útil y viable?"
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const classText = typeof body.classText === "string" ? body.classText.trim() : "";

    if (!subject) {
      return NextResponse.json({ error: "La materia es obligatoria." }, { status: 400 });
    }
    if (classText.length > 50000) {
      return NextResponse.json({ error: "El texto de clase supera el límite de 50,000 caracteres." }, { status: 413 });
    }

    // Demo: devuelve contenido de ejemplo. classText queda disponible para integrar Markdown real.
    const base = subject.toLowerCase().includes("divergent") ? divergentConvergent : generic;
    const resumen = { subject, ...base };

    console.log("[DEMO SUMMARY]", {
      subject,
      inputTextReceived: classText.length > 0,
      inputCharacters: classText.length,
      generatedFromRealAI: false
    });

    return NextResponse.json({ success: true, mode: "simulated", resumen });
  } catch {
    return NextResponse.json({ error: "No se pudo procesar la solicitud JSON." }, { status: 400 });
  }
}