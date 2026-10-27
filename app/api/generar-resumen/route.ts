import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Tarjeta = { titulo: string; resumen: string; detalle: string };
type MockResumen = { titulo: string; tarjetas: Tarjeta[]; audio_texto: string };

const RESUMENES: Record<string, MockResumen> = {
  "Algoritmic Thinking": {
    titulo: "Pensar paso a paso: Algoritmic Thinking",
    tarjetas: [
      {
        titulo: "Descomponer el problema",
        resumen: "Divide un problema complejo en partes pequeñas y manejables. Define qué información tienes, qué resultado buscas y qué pasos necesitas antes de empezar a programar o resolver.",
        detalle: "El pensamiento algorítmico comienza por entender el problema antes de lanzarse a una solución. Descomponer significa separar una tarea grande en subtareas concretas, identificar los datos de entrada y precisar el resultado esperado. Por ejemplo, una aplicación para organizar tareas puede dividirse en registrar una tarea, asignarle una fecha, ordenarla y marcarla como terminada. Cada parte es más fácil de analizar, probar y corregir. En clase, practica describir el problema con tus propias palabras y dibujar sus componentes. Si una parte sigue siendo difícil de explicar, probablemente necesita dividirse todavía más."
      },
      {
        titulo: "Diseñar una secuencia lógica",
        resumen: "Un algoritmo es una serie ordenada de instrucciones. Cada paso debe ser claro, tener un propósito y llevar hacia el resultado, incluyendo decisiones y repeticiones cuando sean necesarias.",
        detalle: "Un algoritmo describe cómo resolver una tarea mediante instrucciones precisas y ordenadas. La secuencia importa: si los pasos están desordenados, el resultado puede ser incorrecto aunque cada instrucción parezca razonable por separado. Las decisiones permiten responder a condiciones, por ejemplo, comprobar si una contraseña cumple los requisitos. Los ciclos permiten repetir una acción mientras se cumpla una condición o hasta terminar una lista. Puedes representar la lógica con pseudocódigo o diagramas de flujo antes de escribir código. Evita instrucciones vagas como “hazlo correctamente”: especifica qué debe ocurrir y cómo reconocer que el paso terminó."
      },
      {
        titulo: "Probar, detectar y mejorar",
        resumen: "No asumas que la primera solución funciona. Prueba casos normales y excepcionales, observa dónde falla el procedimiento y ajusta los pasos con evidencia.",
        detalle: "Probar un algoritmo consiste en recorrer sus pasos con diferentes datos y comprobar si produce el resultado esperado. Incluye un caso habitual, uno límite y uno inesperado. Si el procedimiento falla, localiza el paso donde la salida deja de coincidir con lo esperado; eso ayuda a corregir la causa en lugar de improvisar cambios. Esta práctica también se conoce como depuración. Para prepararte para la siguiente clase, escribe un algoritmo sencillo de una actividad cotidiana, simúlalo con dos escenarios diferentes y anota qué cambiarías. La claridad, la consistencia y la posibilidad de verificar el resultado son más importantes que escribir muchos pasos."
      }
    ],
    audio_texto: `Bienvenida y bienvenido a este repaso de Algoritmic Thinking. La idea central es aprender a resolver problemas de manera clara, ordenada y verificable, en vez de intentar adivinar una solución de golpe.

Primero, descompón el problema. Define qué necesitas resolver, qué información tienes y cuál sería un resultado correcto. Divide la tarea en partes pequeñas que puedas explicar y probar por separado. Si una parte sigue siendo demasiado compleja, vuelve a dividirla.

Después, organiza una secuencia lógica de instrucciones. Un algoritmo es un procedimiento con pasos precisos. El orden importa, y en muchos casos necesitarás decisiones, como comprobar una condición, o repeticiones, como procesar cada elemento de una lista. Antes de programar, puedes representar el procedimiento mediante pseudocódigo o un diagrama de flujo. Es una forma de encontrar confusiones sin tener que construir todo el sistema.

Por último, prueba la solución. No basta con que funcione una vez. Usa un caso habitual, un caso límite y uno inesperado. Si algo falla, identifica el paso exacto que provoca el error y corrígelo. Cambiar cosas al azar puede ocultar el problema sin resolverlo.

Para estudiar, elige una actividad cotidiana, como preparar tu mochila o planear una ruta. Describe sus entradas, el resultado esperado y los pasos. Después prueba qué ocurriría si falta un objeto o cambia una condición. Anota qué parte necesita una decisión y cuál se repite.

La fecha de la sesión seleccionada es importante para que puedas relacionar este repaso con tu clase y tus apuntes. Antes de la próxima sesión, lleva tu algoritmo escrito y una pregunta sobre el paso que te pareció más difícil. Recuerda: descomponer, ordenar, probar y mejorar. Esa secuencia convierte un problema confuso en algo que puedes comprender y resolver.`
  },
  "Design Thinking": {
    titulo: "Diseñar desde las personas: Design Thinking",
    tarjetas: [
      {
        titulo: "Comprender antes de resolver",
        resumen: "Empieza por las personas, sus necesidades y el contexto. Observa y escucha antes de asumir cuál es el problema; una buena solución depende de una buena pregunta.",
        detalle: "Design Thinking es un enfoque de resolución creativa de problemas que pone las necesidades humanas en el centro. La etapa de empatía implica observar, escuchar y conversar con las personas afectadas, sin dar por hecho que ya conoces su experiencia. Distingue lo que viste de la interpretación que haces. Después, sintetiza patrones y formula una necesidad concreta. En lugar de afirmar “necesitamos una aplicación”, describe qué intenta lograr una persona, qué obstáculos encuentra y por qué importan. Esta definición permite explorar soluciones diferentes en vez de comprometerse demasiado pronto con una idea."
      },
      {
        titulo: "Idear y crear prototipos",
        resumen: "Genera varias posibilidades antes de elegir una. Un prototipo sencillo permite convertir una idea en algo visible que las personas puedan probar y comentar.",
        detalle: "La ideación busca ampliar las alternativas antes de evaluarlas. Al principio, separa la generación de ideas de la crítica: construir sobre propuestas ajenas puede revelar caminos que no surgirían individualmente. Después elige una hipótesis que valga la pena explorar y construye un prototipo de baja fidelidad, como un boceto, una secuencia de pantallas o una representación con papel. El objetivo no es que parezca terminado, sino que permita comprobar una pregunta concreta. Un prototipo barato y rápido facilita cambiar de dirección sin desperdiciar demasiado tiempo o recursos."
      },
      {
        titulo: "Probar y aprender",
        resumen: "Las pruebas no son una presentación para recibir aplausos. Observa cómo alguien usa el prototipo, escucha sus dificultades y mejora la propuesta a partir de lo que descubres.",
        detalle: "Durante una prueba, evita explicar demasiado cómo debería funcionar tu propuesta. Pide a la persona que realice una tarea y observa dónde duda, qué interpreta de forma distinta y qué le resulta útil. Registra evidencia, incluidas las reacciones que contradicen tus expectativas. No toda opinión implica que debas cambiar el diseño, pero un patrón repetido puede señalar un problema real. El proceso es iterativo: puedes volver a empatizar, redefinir la necesidad, idear otra alternativa o ajustar el prototipo. Para la próxima clase, lleva una pregunta de investigación, un prototipo simple y al menos una observación que haya cambiado tu perspectiva."
      }
    ],
    audio_texto: `Vamos a repasar Design Thinking, un enfoque para resolver problemas que empieza por las personas y no por la tecnología o la primera idea que se nos ocurre. Su valor está en aprender del contexto, probar supuestos y mejorar de manera iterativa.

La primera tarea es comprender a las personas. Observa cómo actúan, escucha sus experiencias y pregunta por las dificultades que enfrentan. No confundas una suposición con evidencia. Quizá creas que alguien necesita una aplicación nueva, pero al investigar descubras que el problema real es una instrucción confusa o un proceso demasiado largo. Definir bien la necesidad abre más posibilidades de solución.

Después viene la ideación. Genera distintas opciones antes de elegir una. Al inicio, procura no descartar una idea solo porque parezca poco convencional. Cuando tengas alternativas, selecciona una hipótesis que puedas explorar y crea un prototipo. Puede ser un dibujo, una maqueta de papel o una secuencia básica de pantallas. No tiene que verse perfecto: debe ayudar a responder una pregunta.

La siguiente etapa es probar. Pide a alguien que use el prototipo para completar una tarea y observa lo que hace, no solo lo que dice. ¿Dónde se detiene? ¿Qué entiende mal? ¿Qué le ayuda? Registra los hallazgos y úsalos para mejorar la propuesta. Si la evidencia contradice tu idea inicial, eso no significa que fracasaste; significa que aprendiste antes de invertir más recursos.

Estas etapas no siempre ocurren en una línea recta. Los resultados de una prueba pueden llevarte a redefinir el problema, regresar a la empatía o desarrollar una idea completamente distinta. Para prepararte para la próxima sesión, identifica una necesidad real, escribe una pregunta de diseño y crea un prototipo de baja fidelidad. Incluye una pregunta concreta que quieras investigar y evita intentar demostrar que tu primera idea es correcta. La meta es descubrir qué resulta útil para las personas.`
  },
  "People and Teams": {
    titulo: "Colaborar con intención: People and Teams",
    tarjetas: [
      {
        titulo: "Claridad de roles y objetivos",
        resumen: "Un equipo funciona mejor cuando comparte una meta y entiende quién hace qué. Acordar responsabilidades reduce duplicaciones, confusiones y tareas importantes que nadie atiende.",
        detalle: "Trabajar en equipo no consiste únicamente en repartir actividades. Las personas necesitan comprender el objetivo común, las responsabilidades individuales y cómo se conectan sus entregables. Aclaren qué significa terminar bien, quién toma cada decisión y cómo pedir ayuda si algo se retrasa. Los roles pueden cambiar según las fortalezas o las necesidades del proyecto, pero la responsabilidad no debe quedar implícita. Una breve revisión de acuerdos al inicio evita que el equipo descubra demasiado tarde que dos personas hicieron lo mismo mientras otra tarea quedó sin dueño."
      },
      {
        titulo: "Comunicación y desacuerdo productivo",
        resumen: "Escuchar activamente, hacer preguntas y explicar desacuerdos con respeto ayuda a detectar riesgos. El conflicto puede mejorar las decisiones cuando se centra en ideas y evidencia, no en ataques personales.",
        detalle: "La colaboración necesita comunicación explícita. Escuchar activamente implica intentar entender el punto de vista de otra persona antes de responder, resumir lo que entendiste y pedir aclaraciones cuando haga falta. Un desacuerdo no tiene que convertirse en un conflicto personal. Enfóquense en los criterios, los datos disponibles y las consecuencias de cada alternativa. Preguntar “¿qué evidencia apoyaría esta opción?” es más útil que atribuir malas intenciones. También conviene acordar cómo resolver diferencias cuando el grupo no llega a consenso y cómo documentar la decisión para que todos sepan qué sigue."
      },
      {
        titulo: "Confianza y responsabilidad compartida",
        resumen: "La confianza se construye cumpliendo acuerdos, comunicando obstáculos a tiempo y dando retroalimentación concreta. Un buen equipo aprende de los errores sin esconderlos ni buscar culpables.",
        detalle: "La confianza se forma mediante acciones repetidas: cumplir compromisos, reconocer límites, compartir información y avisar temprano cuando surge un obstáculo. La responsabilidad compartida no significa que nadie responda por su parte; significa que cada integrante cuida tanto su tarea como el resultado colectivo. La retroalimentación funciona mejor cuando describe una conducta observable, su impacto y una propuesta de mejora. Después de una entrega, el equipo puede revisar qué ayudó, qué dificultó el trabajo y qué acuerdo cambiará para la siguiente ocasión. Esta reflexión convierte la experiencia en aprendizaje y evita repetir problemas."
      }
    ],
    audio_texto: `En este repaso de People and Teams, nos enfocamos en cómo un grupo de personas puede coordinarse para lograr un objetivo común. Tener talento individual ayuda, pero no garantiza que el equipo funcione. También se necesitan claridad, comunicación, confianza y responsabilidad.

Primero, acuerden el objetivo y los roles. Cada integrante debe entender qué resultado busca el equipo, qué tarea le corresponde y cómo su trabajo se conecta con el de las demás personas. Definan qué significa completar una tarea, quién toma determinadas decisiones y cómo se avisarán los retrasos. Los roles pueden cambiar, pero no conviene dejar responsabilidades importantes sin asignar.

Segundo, cuiden la comunicación. Escuchar activamente significa intentar comprender la idea de otra persona antes de preparar una respuesta. Hagan preguntas, resuman lo que entendieron y comprueben si están de acuerdo sobre el problema. Los desacuerdos pueden mejorar una decisión cuando se centran en evidencia, criterios y consecuencias. Eviten convertir una crítica a una propuesta en un juicio sobre quien la presentó.

Tercero, construyan confianza mediante acciones consistentes. Cumplan los acuerdos y comuniquen los obstáculos pronto, en lugar de ocultarlos hasta la fecha de entrega. La retroalimentación debe ser concreta: describe la conducta observada, explica su impacto y propone un siguiente paso útil. La responsabilidad compartida implica cuidar el resultado del grupo sin borrar las responsabilidades individuales.

Para aplicar estas ideas, piensa en un proyecto reciente. ¿El objetivo estaba claro? ¿Todas las tareas tenían una persona responsable? ¿Cómo se resolvió el desacuerdo más importante? Antes de la próxima clase, escribe un acuerdo que tu equipo debería mejorar y una forma observable de saber si funcionó. También prepara una pregunta sobre cómo mantener la confianza cuando hay presión o los tiempos se reducen.

La fecha elegida en el formulario te ayuda a vincular este repaso con la sesión correcta. Guarda tus notas y llévalas a la conversación del equipo. Colaborar no significa pensar igual; significa construir una forma de trabajar donde las diferencias puedan mejorar el resultado y cada persona sepa cómo contribuir.`
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const materiaRecibida = typeof body.materia === "string"
      ? body.materia
      : typeof body.subject === "string"
        ? body.subject
        : "";
    const fecha = typeof body.fecha === "string" ? body.fecha.trim() : "";

    // Normaliza espacios y mayúsculas para evitar rechazos por diferencias de formato.
    const normalizar = (valor: string) => valor.trim().replace(/\s+/g, " ").toLocaleLowerCase("en");
    const claveMateria = Object.keys(RESUMENES).find(
      (clave) => normalizar(clave) === normalizar(materiaRecibida),
    );

    if (!claveMateria) {
      return NextResponse.json(
        { error: `La materia recibida no coincide con las opciones disponibles: ${materiaRecibida || "(vacía)"}.` },
        { status: 400 },
      );
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return NextResponse.json({ error: "Selecciona la fecha de la clase." }, { status: 400 });
    }
    return NextResponse.json({ success: true, materia: claveMateria, fecha, ...RESUMENES[claveMateria] });
  } catch {
    return NextResponse.json({ error: "No se pudo procesar la solicitud." }, { status: 400 });
  }
}
