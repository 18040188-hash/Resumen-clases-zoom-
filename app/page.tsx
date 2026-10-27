"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, CheckCircle2, FileText, Mail, X } from "lucide-react";
import SelectorClase from "@/components/SelectorClase";
import AudioPlayer from "@/components/AudioPlayer";

type Tarjeta = { titulo: string; resumen: string; detalle: string };
type Resumen = { titulo: string; tarjetas: Tarjeta[]; audio_texto: string; materia?: string; fecha?: string };

export default function Home() {
  const [materia, setMateria] = useState("");
  const [fecha, setFecha] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState("");
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
    if (!materia || !fecha || !file || !email.trim()) {
      setError("Selecciona la materia, la fecha y completa los datos del justificante.");
      return;
    }
    setLoading(true);
    setError("");
    setResumen(null);
    try {
      const justificationResponse = await fetch("/api/justificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: materia, materia, fecha, fileName: file.name, email: email.trim() }),
      });
      const justification = await justificationResponse.json();
      if (!justificationResponse.ok) throw new Error(justification.error || "No se pudo procesar el justificante.");

      const response = await fetch("/api/generar-resumen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materia, fecha }),
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
          <a href="/" className="flex items-center gap-3" aria-label="AulaClara, inicio">
            <span className="flex h-11 w-11 items-center justify-center bg-[#244c3b] text-white"><BookOpen size={22}/></span>
            <span><span className="block font-serif text-xl">AulaClara</span><span className="block text-xs text-[#65685f]">Una clase a la vez.</span></span>
          </a>
          <span className="hidden text-xs font-semibold uppercase tracking-[0.16em] text-[#65685f] sm:block">Asistente académico</span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-9 sm:px-8 sm:py-14">
        {!resumen && <div className="grid gap-10 lg:grid-cols-[1fr_0.72fr]">
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

            <SelectorClase materia={materia} fecha={fecha} onMateriaChange={setMateria} onFechaChange={setFecha}/>

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

            {error && <p role="alert" className="mt-4 border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
            <button type="submit" disabled={loading} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#244c3b] px-5 py-3 text-sm font-bold text-white hover:bg-[#183729] disabled:cursor-wait disabled:opacity-60">
              {loading ? "Preparando tu resumen…" : "Enviar y ver resumen"} <ArrowRight size={17}/>
            </button>
            <p className="mt-3 text-xs leading-5 text-[#65685f]">Prototipo académico. La confirmación de envío es simulada; el formulario no envía un correo real.</p>
          </form>
        </div>}

        {loading && <div className="mt-12 border-y border-[#d8d1c4] py-10 text-center"><p className="font-serif text-3xl">Ordenando las ideas…</p><p className="mt-2 text-sm text-[#65685f]">Estamos preparando las tarjetas para tu sesión.</p></div>}

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
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-[#b66a43]">Tarjeta 0{index + 1}</p>
              <h2 className="font-serif text-2xl leading-tight">{tarjeta.titulo}</h2>
              <p className="mt-4 text-sm leading-7 text-[#444a41]">{tarjeta.resumen}</p>
              <button type="button" onClick={() => setDetalleActivo(tarjeta)} className="mt-6 border-b border-[#244c3b] pb-1 text-sm font-bold text-[#244c3b] hover:text-[#b66a43]">Ver más <span aria-hidden="true">↗</span></button>
            </article>)}
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-[#d8d1c4] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm leading-6 text-[#65685f]">Consejo: escucha el audio una vez para captar la idea general y vuelve a las tarjetas para repasar los conceptos que necesites.</p>
            <a href="https://app.minervaproject.com/home/student" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#244c3b] px-4 py-3 text-sm font-bold text-white hover:bg-[#183729]">Abrir Minerva <ArrowRight size={16}/></a>
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
          <p className="whitespace-pre-line py-6 text-base leading-8 text-[#444a41]">{detalleActivo.detalle}</p>
          <button type="button" onClick={() => setDetalleActivo(null)} className="min-h-11 bg-[#244c3b] px-5 py-3 text-sm font-bold text-white">Volver al resumen</button>
        </section>
      </div>}
    </main>
  );
}
