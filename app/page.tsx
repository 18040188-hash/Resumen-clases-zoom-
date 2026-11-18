"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import Link from "next/link"; 
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, CheckCircle2, FileText, X, GraduationCap, Users } from "lucide-react"; // <-- QUITÉ "Mail"
import SelectorClase from "@/components/SelectorClase";
import AudioPlayer from "@/components/AudioPlayer";
import FacilitatorWorkspace from "@/components/FacilitatorWorkspace";

type Tarjeta = { titulo: string; resumen: string; detalle: string };
type Resumen = { titulo: string; tarjetas: Tarjeta[]; audio_texto: string; materia?: string; fecha?: string; materialesFacilitador?: { titulo: string; descripcion: string; nombreArchivo?: string; tipo: string }[] };

const URLS_MINERVA = {
  preclass: "https://app.minervaproject.com/section/k0sc49tn8c32/page/k47atihwqiri?topic=wnezqb9zev2j&submission=v4ke6mcy9kyt",
  prepPoll: "https://app.minervaproject.com/section/k0sc49tn8c32/page/tuhb2xsji06p?topic=et90xcfco9hy&submission=mxgjs3cpzrnn",
  breakout: "https://app.minervaproject.com/section/k0sc49tn8c32/page/qh8ynxv9z88u?topic=wnezqb9zev2j&submission=hxg2gzppeb7w",
};

const RESUMEN_CHALLENGE: Resumen = {
  titulo: "Challenge: Design thinking",
  materia: "design-thinking",
  tarjetas: [
    { titulo: "Círculo socrático", resumen: "En esta clase, comenzaremos discutiendo las mejores prácticas y explorando diferentes métodos para la creación de prototipos. A través de la experiencia práctica, trabajarás en equipos para construir rápidamente prototipos para probar tus suposiciones. Al final de la sesión, comprenderás la importancia y los fundamentos de la creación de prototipos.", detalle: "Tres formatos populares permiten convertir una idea en algo que se pueda explorar y probar." },
    { titulo: "Breakouts / Polls", resumen: "El equipo aún no ha comenzado el prototipado. Consideran esencial probarlo en casos reales para ver si es útil y gusta a los usuarios; no ven nada innecesario por ahora. R2 destaca que las reacciones naturales del usuario son más honestas que el feedback pensado. Sobre cómo validar sus suposiciones, los tres (Anniel, Fernanda y Nataly) coinciden en que todavía no han creado el prototipo ni aportado ideas individuales, pero la meta es usar las herramientas de la universidad y hacerlo intuitivo y sencillo para el usuario.", detalle: "Consulta la pregunta de validación y las respuestas individuales del equipo." },
    { titulo: "Notas importantes para la siguiente clase", resumen: "La siguiente clase se realizará en el FabLab. Recuerda completar Pre class, Prep Poll y Breakout antes de la sesión.", detalle: "La siguiente clase se realizará en el FabLab. Estas actividades se usan para evaluar tu desempeño." }
  ],
  audio_texto: "En esta sesión de Challenge: Design thinking exploramos tres formas de prototipar: Product, Roleplay y Storyboard. El equipo todavía no ha comenzado a construir su prototipo y quiere probarlo en situaciones reales, observando las reacciones naturales de las personas. Para la siguiente clase, que será en el FabLab, recuerda completar Pre class, Prep Poll y Breakout. Estas actividades se usan para evaluar tu desempeño."
};

export default function Home() {
  const [vista, setVista] = useState<"alumno" | "facilitador">("alumno");
  const [materia, setMateria] = useState("");
  const [fecha, setFecha] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState("");
  const [motivo, setMotivo] = useState("");
  const palabrasMotivo = motivo.trim() ? motivo.trim().split(/\s+/).length : 0;
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [detalleActivo, setDetalleActivo] = useState<Tarjeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (selected.size > 10 * 1024 * 1024) {
      setError("El archivo debe pesar menos de 10 MB.");
      return;
    }
    setError("");
    setFile(selected);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!materia || !fecha || !file || !email.trim() || !motivo.trim()) {
      setError("Selecciona la materia, la fecha y completa todos los datos del justificante.");
      return;
    }
    if (palabrasMotivo > 80) {
      setError("El motivo de ausencia debe tener máximo 80 palabras.");
      return;
    }
    setLoading(true);
    setError("");
    setResumen(null);
    try {
      const category = /médic|medic|enferm|salud|hospital|consulta|doctor|cita/i.test(motivo) ? "Salud" : /famil|falle|funer|hij|madre|padre|herman/i.test(motivo) ? "Familiar" : /transporte|tráfico|metro|autobús|camión|accidente/i.test(motivo) ? "Transporte" : /examen|univers|escuela|académ|clase|tarea/i.test(motivo) ? "Académico" : /personal|trámite|situación/i.test(motivo) ? "Personal" : "Otro";
      const palabrasCortas = motivo.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((word) => word && !["por","para","una","uno","que","con","del","las","los","estoy","tuve","debido","porque","mi","me","el","la","de","en","un","a","y","fue","ser"].includes(word)).slice(0,10);
      const registro = { id: crypto.randomUUID(), materia, fecha, email: email.trim(), motivo: motivo.trim(), categoria: category, resumen: (palabrasCortas.length ? palabrasCortas : [category.toLowerCase(),"reportado"]).join(" "), fileName: file.name, createdAt: new Date().toISOString() };
      const saved = JSON.parse(localStorage.getItem("aulaclara_justificantes_v1") || "[]");
      localStorage.setItem("aulaclara_justificantes_v1", JSON.stringify([registro, ...saved]));

      const justificationResponse = await fetch("/api/justificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: materia, materia, fecha, fileName: file.name, email: email.trim(), motivo: motivo.trim() }),
      });
      const justification = await justificationResponse.json();
      if (!justificationResponse.ok) throw new Error(justification.error || "No se pudo procesar el justificante.");

      const response = await fetch("/api/generar-resumen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materia, fecha, materialesFacilitador: JSON.parse(localStorage.getItem("aulaclara_materiales_v1") || "[]").filter((item: { materia: string }) => item.materia === materia) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo generar el resumen.");
      setResumen(data as Resumen);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setMateria("");
    setFecha("");
    setFile(null);
    setEmail("");
    setResumen(null);
    setDetalleActivo(null);
    setError("");
  }

  return (
    <main className="min-h-screen bg-[#f3f0e8] text-[#20251f]">
      <header className="border-b border-[#d8d1c4] bg-[#fbf9f3]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="AulaClara, inicio">
            <span className="flex h-11 w-11 items-center justify-center bg-[#dfff00] text-black"><span className="text-2xl font-black tracking-[-0.12em]">ul.</span></span>
            <span><span className="block text-xl font-black tracking-tight text-black">AulaClara</span><span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#62666b]">Universidad de la Libertad</span></span>
          </Link>
          <div className="flex items-center gap-1 rounded-full border border-[#dedede] bg-white p-1"><button type="button" onClick={() => { setVista("alumno"); setResumen(null); }} className={vista === "alumno" ? "inline-flex min-h-9 items-center gap-2 rounded-full bg-[#111] px-3 text-xs font-semibold text-white" : "inline-flex min-h-9 items-center gap-2 rounded-full px-3 text-xs font-semibold text-[#555]"}><GraduationCap size={15}/> Alumno</button><button type="button" onClick={() => { setVista("facilitador"); setResumen(null); }} className={vista === "facilitador" ? "inline-flex min-h-9 items-center gap-2 rounded-full bg-[#111] px-3 text-xs font-semibold text-white" : "inline-flex min-h-9 items-center gap-2 rounded-full px-3 text-xs font-semibold text-[#555]"}><Users size={15}/> Facilitador</button></div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-9 sm:px-8 sm:py-14">
        {vista === "alumno" && !resumen && <div className="grid gap-10 lg:grid-cols-[1fr_0.72fr]">
          <section className="lg:col-span-2 rounded-xl border border-[#e2e4e7] bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#102d52]">Portal del alumno</p><h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#111] sm:text-3xl">Mis cursos</h2></div>
              <span className="rounded-full bg-[#f5f5f5] px-3 py-1 text-xs font-semibold text-[#62666b]">Ciclo 2026-C</span>
            </div>
            <button type="button" onClick={() => {
              setMateria("design-thinking");
              setFecha(new Date().toISOString().slice(0, 10));
              setResumen(RESUMEN_CHALLENGE);
              setDetalleActivo(null);
            }} className="group flex w-full flex-col gap-3 rounded-lg border border-[#e0e0e0] bg-[#f5f5f5] p-5 text-left transition hover:border-[#c21878] hover:bg-white focus-visible:outline-offset-4 sm:flex-row sm:items-center sm:justify-between">
              <span><span className="block text-xs font-bold uppercase tracking-[0.13em] text-[#62666b]">Design Thinking · Grupo A · 8:00</span><span className="mt-1 block text-lg font-extrabold text-[#111]">Challenge: Design thinking</span><span className="mt-1 block text-sm text-[#62666b]">Sesión de prototipado · Resumen de clase</span></span>
              <span className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-md bg-[#dfff00] px-4 py-2 text-sm font-bold text-[#111] group-hover:bg-[#c8e600] sm:self-center">Ver resumen <ArrowRight size={16}/></span>
            </button>
          </section>
          <section>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#b66a43]">Recupera el hilo de la clase</p>
            <h1 className="max-w-xl font-serif text-5xl font-normal leading-[1.05] tracking-tight sm:text-6xl">Faltaste. Tu aprendizaje no tiene que hacerlo.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#5d6259]">Registra la sesión y recibe tres tarjetas de estudio con contexto ampliado y un repaso de audio preparado para acompañarte en el camino.</p>
            <div className="mt-8 border-l-2 border-[#b66a43] pl-4 text-sm leading-6 text-[#5d6259]">Elige la materia y la fecha exacta para consultar el resumen correspondiente.</div>
          </section>

          <form onSubmit={handleSubmit} className="border border-[#d8d1c4] bg-[#fbf9f3] p-5 sm:p-7">
            <div className="mb-6 flex items-start gap-3 border-b border-[#d8d1c4] pb-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#e4e9dc] text-[#244c3b]"><FileText size={20}/></span>
              <div><h2 className="font-serif text-2xl">Justificación de falta</h2><p className="mt-1 text-sm text-[#65685f]">Los campos marcados con * son obligatorios.</p></div>
            </div>

           {/* Elimina el div con el grid y el select manual, deja solo esto: */}
            <SelectorClase 
              materia={materia} 
              fecha={fecha} 
              onMateriaChange={setMateria} 
              onFechaChange={setFecha}
            />

            <div className="mt-5">
              <label htmlFor="comprobante" className="mb-2 block text-sm font-semibold">Comprobante de ausencia *</label>
              <input id="comprobante" type="file" accept=".pdf,.png,.jpg,.jpeg" required onChange={handleFile}
                className="block w-full border border-dashed border-[#c9c1b4] bg-[#f3f0e8] p-3 text-sm file:mr-3 file:border-0 file:bg-[#e4e9dc] file:px-3 file:py-2 file:font-semibold file:text-[#244c3b]"/>
              <p className="mt-1 text-xs text-[#65685f]">PDF, JPG o PNG · Máximo 10 MB {file ? `· ${file.name}` : ""}</p>
            </div>

            <div className="mt-5">
              <label htmlFor="email" className="mb-2 block text-sm font-semibold">Correo institucional *</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nombre@universidad.edu.mx"
                className="min-h-12 w-full border border-[#c9c1b4] bg-white px-4 py-3 text-sm outline-none focus:border-[#244c3b]"/>
            </div>


            <div className="mt-5">
              <label htmlFor="motivo-ausencia" className="mb-2 block text-sm font-semibold">Motivo de ausencia *</label>
              <textarea
                id="motivo-ausencia"
                name="motivo"
                required
                rows={4}
                maxLength={1000}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Cuéntale brevemente a tu profesor por qué no pudiste asistir..."
                aria-describedby="motivo-ayuda motivo-conteo"
                className="min-h-28 w-full resize-y rounded-xl border border-[#c9c1b4] bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/15"
              />
              <div className="mt-1 flex items-start justify-between gap-3 text-xs">
                <p id="motivo-ayuda" className="text-[#65685f]">Máximo 80 palabras. Esta nota acompaña tu solicitud.</p>
                <p id="motivo-conteo" aria-live="polite" className={palabrasMotivo > 80 ? "shrink-0 font-semibold text-red-600" : "shrink-0 text-[#65685f]"}>{palabrasMotivo}/80 palabras</p>
              </div>
            </div>

            {error && <p role="alert" className="mt-4 border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
            <button type="submit" disabled={loading} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#244c3b] px-5 py-3 text-sm font-bold text-white hover:bg-[#183729] disabled:cursor-wait disabled:opacity-60">
              {loading ? "Preparando tu resumen…" : "Enviar y ver resumen"} <ArrowRight size={17}/>
            </button>
            <p className="mt-3 text-xs leading-5 text-[#65685f]">Prototipo académico. La confirmación de envío es simulada; el formulario no envía un correo real.</p>
          </form>
        </div>}

        {vista === "facilitador" && <FacilitatorWorkspace />}\n\n        {loading && <div className="mt-12 border-y border-[#d8d1c4] py-10 text-center"><p className="font-serif text-3xl">Ordenando las ideas…</p><p className="mt-2 text-sm text-[#65685f]">Estamos preparando las tarjetas para tu sesión.</p></div>}

        {resumen && <section>
          <div className="mb-8 flex flex-col justify-between gap-5 border-b border-[#d8d1c4] pb-6 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#315b43]"><CheckCircle2 size={15}/> Guía de estudio lista</p>
              <h1 className="max-w-3xl font-serif text-4xl font-normal leading-tight sm:text-6xl">{resumen.titulo}</h1>
              <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-[#5d6259]"><CalendarDays size={16}/> {materia} · Sesión del {fecha}</p>
            </div>
            <button type="button" onClick={reset} className="inline-flex min-h-11 items-center gap-2 self-start border border-[#244c3b] px-4 py-2 text-sm font-semibold text-[#244c3b] hover:bg-[#e4e9dc]"><ArrowLeft size={16}/> Nueva solicitud</button>
          </div>

          <div className="mb-8 grid gap-6 border-y-2 border-[#244c3b] bg-[#244c3b] p-5 text-[#fbf9f3] sm:grid-cols-[1fr_auto] sm:items-center sm:p-7">
            <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#e3e7d8]">Escucha y repasa</p><h2 className="font-serif text-3xl">La clase, contada con calma.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[#e3e7d8]">El audio integra las tres tarjetas y añade contexto y recomendaciones de estudio.</p></div>
            <AudioPlayer text={resumen.audio_texto} vozCalida/>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {resumen.tarjetas.map((tarjeta, index) => <article key={tarjeta.titulo} className={index === 1 ? "border-t-4 border-t-[#b66a43] border-x border-b border-[#d8d1c4] bg-[#eee9dc] p-6" : index === 2 ? "border-t-4 border-t-[#244c3b] border-x border-b border-[#cbd4c3] bg-[#e4e9dc] p-6" : "border-l-4 border-l-[#244c3b] border-y border-r border-[#d8d1c4] bg-[#fbf9f3] p-6"}>
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-[#087e77]">{["01 · PARTICIPACIÓN EN CLASE","02 · ACTIVIDADES COLABORATIVAS","03 · CONTINUIDAD ACADÉMICA"][index] || "AULA CLARA"}</p>
              <h2 className="font-serif text-2xl leading-tight">{tarjeta.titulo}</h2>
              <p className="mt-4 text-sm leading-7 text-[#444a41]">{tarjeta.resumen}</p>
              <button type="button" onClick={() => setDetalleActivo(tarjeta)} className="mt-6 border-b border-[#244c3b] pb-1 text-sm font-bold text-[#244c3b] hover:text-[#b66a43]">Ver más <span aria-hidden="true">↗</span></button>
            </article>)}
          </div>

          {resumen.materialesFacilitador && resumen.materialesFacilitador.length > 0 && <section className="mt-8 rounded-2xl border border-[#dfe3eb] bg-white p-6"><p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-[#1967d2]">Material complementario del facilitador</p><h2 className="font-serif text-2xl">Notas y anuncios de esta materia</h2><div className="mt-4 space-y-4">{resumen.materialesFacilitador.map((item, index) => <article key={`${item.titulo}-${index}`} className="border-l-4 border-[#04c0b3] bg-[#f6fbfa] p-4"><p className="text-xs font-bold uppercase text-[#087e77]">{item.tipo === "presentacion" ? "Presentación" : item.tipo === "caso" ? "Caso de estudio" : item.tipo === "mapa" ? "Mapa mental" : item.tipo === "nota" ? "Notas de clase" : item.tipo === "anuncio" ? "Anuncio" : "Material de clase"}</p><h3 className="mt-1 font-semibold">{item.titulo}</h3>{item.nombreArchivo && <p className="mt-1 text-xs text-[#666]">Archivo: {item.nombreArchivo}</p>}{item.descripcion && <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#3c4043]">{item.descripcion}</p>}</article>)}</div></section>}\n\n          <div className="mt-8 flex flex-col gap-3 border-t border-[#d8d1c4] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm leading-6 text-[#65685f]">Consejo: escucha el audio una vez para captar la idea general y vuelve a las tarjetas para repasar los conceptos que necesites.</p>
            <div className="flex flex-col items-start gap-2"><a href="https://app.minervaproject.com/home/student" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#244c3b] px-4 py-3 text-sm font-bold text-white hover:bg-[#183729]">Abrir Minerva <ArrowRight size={16}/></a><p className="max-w-xs text-xs font-medium leading-5 text-[#5d6259]">No olvides completar tus actividades en Forum.</p></div>
          </div>
          <p className="mt-6 text-xs text-[#65685f]">Resumen de demostración con contenido de ejemplo. La generación de audio de ElevenLabs requiere configurar su API en el servidor.</p>
        </section>}
      </div>

      <footer className="border-t border-[#d8d1c4] bg-[#fbf9f3] px-5 py-5 text-xs text-[#65685f]"><div className="mx-auto flex max-w-6xl justify-between gap-4"><span>AulaClara · Prototipo académico</span><span>Aprender también es recuperar el hilo.</span></div></footer>

      {detalleActivo && <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#20251f]/65 p-0 sm:items-center sm:p-5" onMouseDown={(e) => { if (e.target === e.currentTarget) setDetalleActivo(null); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="detalle-titulo" className="max-h-[88vh] w-full max-w-2xl overflow-y-auto border border-[#d8d1c4] bg-[#fbf9f3] p-6 sm:p-9">
          <div className="flex items-start justify-between gap-4 border-b border-[#d8d1c4] pb-5">
            <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#b66a43]">Lectura ampliada</p><h2 id="detalle-titulo" className="font-serif text-3xl">{detalleActivo.titulo}</h2></div>
            <button type="button" onClick={() => setDetalleActivo(null)} aria-label="Cerrar detalle" className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#d8d1c4] hover:bg-[#e4e9dc]"><X size={20}/></button>
          </div>
          {detalleActivo.titulo === "Círculo socrático" && materia === "design-thinking" ? (
            <div className="space-y-5 py-6 text-sm leading-7 text-[#333]">
              <p>Estos son tres formatos populares para construir prototipos de baja fidelidad:</p>
              <article className="rounded-lg border border-[#e2e4e7] bg-[#f5f5f5] p-4"><h3 className="font-bold text-[#102d52]">Product (Producto)</h3><p className="mt-1">Un modelo funcional o físico (como un prototipo en Figma o un mockup en cartón) que permite al usuario interactuar con la solución.</p></article>
              <article className="rounded-lg border border-[#e2e4e7] bg-[#f5f5f5] p-4"><h3 className="font-bold text-[#102d52]">Roleplay (Juego de roles)</h3><p className="mt-1">Simular la experiencia del servicio actuando como el usuario y el prestador del servicio para probar la interacción humana.</p></article>
              <article className="rounded-lg border border-[#e2e4e7] bg-[#f5f5f5] p-4"><h3 className="font-bold text-[#102d52]">Storyboard (Guion gráfico)</h3><p className="mt-1">Una secuencia de dibujos o viñetas que ilustran cómo el usuario interactúa con el producto paso a paso.</p></article>
            </div>
          ) : detalleActivo.titulo === "Breakouts / Polls" && materia === "design-thinking" ? (
            <div className="space-y-4 py-6 text-sm leading-7 text-[#333]">
              <div className="rounded-lg border-l-4 border-[#c21878] bg-[#f5f5f5] p-4"><h3 className="font-bold text-[#102d52]">Pregunta</h3><p className="mt-1">¿Cómo sabrán si la reacción del usuario es evidencia sobre su suposición y no solo feedback sobre detalles superficiales?</p></div>
              <article><h3 className="font-bold">Anniel</h3><p>Todavía no han comenzado el prototipado ni han visto cómo podría funcionar. Señala que por ahora no ha propuesto algo que solo le parezca que funciona para sí mismo, pero admite que quizá no sea lo mejor para su audiencia.</p></article>
              <article><h3 className="font-bold">Fernanda</h3><p>Como aún no han creado el prototipo, no han aportado muchas ideas individuales, pero cree que en general no suelen tener ese tipo de problemas.</p></article>
              <article><h3 className="font-bold">Nataly</h3><p>Aún no han iniciado el prototipo, pero la idea es aprovechar las herramientas que brinda la universidad y hacer que el prototipo sea lo más intuitivo y sencillo posible.</p></article>
            </div>
          ) : detalleActivo.titulo === "Notas importantes para la siguiente clase" && materia === "design-thinking" ? (
            <div className="space-y-5 py-6 text-sm leading-7 text-[#333]">
              <div className="rounded-lg border-l-4 border-[#c21878] bg-[#f5f5f5] p-4"><p className="font-bold text-[#102d52]">Aviso</p><p className="mt-1">La siguiente clase se realizará en el FabLab</p></div>
              <div><h3 className="font-bold">Actividades requeridas</h3><ul className="mt-2 list-disc space-y-1 pl-5"><li>Realizar Pre class.</li><li>Realizar Prep Poll.</li><li>Realizar Breakout.</li></ul></div>
              <p className="font-semibold italic text-[#62666b]">Recuerda que estas actividades se usan para evaluar tu desempeño.</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <a href={URLS_MINERVA.preclass} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#102d52] bg-white px-3 py-2 text-center text-sm font-bold text-[#102d52] hover:bg-[#102d52] hover:text-white">Ir a Pre class <ArrowRight size={15}/></a>
                <a href={URLS_MINERVA.prepPoll} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#102d52] bg-white px-3 py-2 text-center text-sm font-bold text-[#102d52] hover:bg-[#102d52] hover:text-white">Ir a Prep Poll <ArrowRight size={15}/></a>
                <a href={URLS_MINERVA.breakout} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#102d52] bg-white px-3 py-2 text-center text-sm font-bold text-[#102d52] hover:bg-[#102d52] hover:text-white">Ir a Breakout <ArrowRight size={15}/></a>
              </div>
            </div>
          ) : <p className="whitespace-pre-line py-6 text-base leading-8 text-[#444a41]">{detalleActivo.detalle}</p>}
          <button type="button" onClick={() => setDetalleActivo(null)} className="min-h-11 bg-[#244c3b] px-5 py-3 text-sm font-bold text-white">Volver al resumen</button>
        </section>
      </div>}
    </main>
  );
}
