import { NextResponse } from "next/server";

export const runtime = "nodejs";

const summaries: Record<string, {
  title: string;
  duration: string;
  points: { time: string; title: string; detail: string }[];
}> = {
  "Innovación y modelos de negocio": {
    title: "Introducción a la innovación y propuesta de valor",
    duration: "52 minutos",
    points: [
      { time: "00:00", title: "¿Qué entendemos por innovación?", detail: "La innovación transforma ideas en soluciones útiles. No se limita a inventar tecnología: también puede mejorar procesos, servicios y experiencias." },
      { time: "12:35", title: "Identificación de necesidades", detail: "Las oportunidades aparecen al observar problemas reales de las personas. Investigar al usuario ayuda a evitar soluciones basadas únicamente en suposiciones." },
      { time: "27:10", title: "Propuesta de valor", detail: "Una propuesta de valor explica qué necesidad se atiende, para quién y por qué la solución es relevante frente a otras alternativas." },
      { time: "41:20", title: "Validación de ideas", detail: "Los prototipos y las pruebas con usuarios permiten obtener retroalimentación temprana antes de invertir recursos en una solución completa." },
    ],
  },
  "Marketing estratégico": {
    title: "Segmentación, posicionamiento y propuesta de marca",
    duration: "48 minutos",
    points: [
      { time: "00:00", title: "Objetivos del marketing estratégico", detail: "El marketing estratégico analiza el mercado y define cómo una organización puede crear valor para un público específico." },
      { time: "10:20", title: "Segmentación del mercado", detail: "Agrupar consumidores por necesidades, comportamientos o características ayuda a diseñar mensajes y ofertas más relevantes." },
      { time: "24:45", title: "Posicionamiento de marca", detail: "El posicionamiento busca construir una idea clara y diferenciada de la marca en la mente de su público." },
      { time: "38:15", title: "Coherencia de la estrategia", detail: "Producto, precio, distribución y comunicación deben reforzar la misma propuesta y responder a los objetivos definidos." },
    ],
  },
};

const fallback = {
  title: "Conceptos esenciales y aplicaciones prácticas",
  duration: "50 minutos",
  points: [
    { time: "00:00", title: "Contexto y objetivos", detail: "La sesión presenta los conceptos principales del tema y explica su relevancia dentro de la materia." },
    { time: "13:15", title: "Conceptos clave", detail: "Se revisan definiciones y marcos de referencia que ayudan a comprender el tema y relacionarlo con situaciones reales." },
    { time: "29:40", title: "Ejemplos de aplicación", detail: "Los ejemplos permiten conectar la teoría con problemas prácticos y reconocer posibles formas de aplicar lo aprendido." },
    { time: "42:05", title: "Conclusiones", detail: "La sesión recapitula los puntos principales y destaca la importancia de practicar y profundizar en los conceptos." },
  ],
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const fileName = typeof body.fileName === "string" ? body.fileName.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!subject || !fileName || !email) {
      return NextResponse.json(
        { error: "Materia, archivo y correo institucional son obligatorios." },
        { status: 400 },
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "El correo electrónico no es válido." }, { status: 400 });
    }
    if (fileName.length > 255) {
      return NextResponse.json({ error: "El nombre del archivo es demasiado largo." }, { status: 400 });
    }

    // Pequeña espera para que la interfaz muestre el estado de carga en la demo.
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const summary = { subject, ...(summaries[subject] ?? fallback) };

    // Prototipo: solo registra la intención de envío. No se envía ningún correo real.
    console.log("[DEMO EMAIL] Copia de resumen preparada", {
      to: email,
      subject: `Resumen de clase: ${subject}`,
      fileName,
      summaryTitle: summary.title,
    });

    return NextResponse.json({
      success: true,
      message: "Resumen de demostración generado. El correo no se envió realmente.",
      emailStatus: "simulated",
      summary,
    });
  } catch {
    return NextResponse.json({ error: "No se pudo leer la solicitud. Inténtalo de nuevo." }, { status: 400 });
  }
}