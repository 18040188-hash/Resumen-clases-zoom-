"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import {
  ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, Clock3, CloudUpload,
  FileText, GraduationCap, Lightbulb, Mail, ShieldCheck, Sparkles, Target, Users
} from "lucide-react";
import AudioPlayer from "@/components/AudioPlayer";

type StudySummary = {
  subject: string;
  title: string;
  resumen_corto: string[];
  temas_clave: string[];
  preclass: string[];
  actividades_breakout: string[];
  mision_alumno: string[];
  pregunta_hmw: string;
};

const subjects = [
  "Divergent and Convergent Thinking",
  "Innovación y modelos de negocio",
  "Marketing estratégico",
  "Fundamentos de administración",
  "Análisis de datos",
  "Comunicación y medios digitales",
];

export default function Home() {
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<StudySummary | null>(null);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > 10 * 1024 * 1024) {
      setError("El archivo debe pesar menos de 10 MB.");
      return;
    }
    setError("");
    setFile(selected);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!subject || !file || !email.trim()) {
      setError("Completa todos los campos y adjunta tu justificante.");
      return;
    }
    setError("");
    setLoading(true);
    setSummary(null);
    try {
      const response = await fetch("/api/justificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, fileName: file.name, email: email.trim() }),
      });
      const justification = await response.json();
      if (!response.ok) throw new Error(justification.error || "No se pudo procesar el justificante.");

      const summaryResponse = await fetch("/api/generar-resumen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject }),
      });
      const summaryData = await summaryResponse.json();
      if (!summaryResponse.ok) throw new Error(summaryData.error || "No se pudo generar el resumen.");
      setSummary(summaryData.resumen as StudySummary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setSummary(null);
    setSubject("");
    setFile(null);
    setEmail("");
    setError("");
    if (fileInput.current) fileInput.current.value = "";
  }

  const audioText = summary
    ? [
        summary.title,
        "El resumen en un minuto.",
        ...summary.resumen_corto,
        "Lo que se hizo en clase.",
        ...summary.preclass,
        ...summary.temas_clave,
        ...summary.actividades_breakout,
        "Tu misión.",
        ...summary.mision_alumno,
        summary.pregunta_hmw,
      ].join(". ")
    : "";

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm"><GraduationCap size={22} /></div>
            <div><p className="text-base font-bold tracking-tight">Aula<span className="text-indigo-600">Clara</span></p><p className="text-xs text-slate-500">Asistente académico</p></div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 sm:flex"><ShieldCheck size={14} className="text-emerald-600" /> Portal de estudiantes</div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-700">AC</div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="mb-8 flex items-center gap-2 text-sm text-slate-500"><span>Portal</span><span>/</span><span className="font-medium text-slate-800">{summary ? "Resumen ejecutivo" : "Justificación de falta"}</span></div>

        {!summary && !loading && (
          <>
            <div className="mb-9 max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700"><Sparkles size={14} /> TU CLASE, EN RESUMEN</div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Justificación de falta</h1>
              <p className="mt-3 text-base leading-7 text-slate-500">Envía tu justificante y recibe una guía de estudio breve que puedes leer o escuchar en el camino.</p>
            </div>
            <div className="grid gap-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
              <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-7 flex items-center gap-3 border-b border-slate-100 pb-5"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><FileText size={21} /></div><div><h2 className="font-semibold">Datos del justificante</h2><p className="mt-0.5 text-sm text-slate-500">Completa la información de tu ausencia.</p></div></div>
                <label htmlFor="subject" className="mb-2 block text-sm font-semibold text-slate-700">Materia <span className="text-rose-500">*</span></label>
                <select id="subject" value={subject} onChange={e => setSubject(e.target.value)} className="mb-6 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50" required>
                  <option value="">Selecciona una materia</option>{subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <label htmlFor="file" className="mb-2 block text-sm font-semibold text-slate-700">Comprobante de ausencia <span className="text-rose-500">*</span></label>
                <input ref={fileInput} id="file" type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFile} className="hidden" />
                <button type="button" onClick={() => fileInput.current?.click()} className="mb-6 flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-8 text-center transition hover:border-indigo-400 hover:bg-indigo-50/40">
                  {file ? <><div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Check size={22} /></div><span className="max-w-full truncate text-sm font-semibold text-slate-800">{file.name}</span><span className="mt-1 text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB · Archivo seleccionado</span></> : <><div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm"><CloudUpload size={22} /></div><span className="text-sm font-semibold text-slate-700">Haz clic para subir tu archivo</span><span className="mt-1 text-xs text-slate-500">PDF, JPG o PNG · Máximo 10 MB</span></>}
                </button>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">Correo institucional <span className="text-rose-500">*</span></label>
                <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nombre@universidad.edu.mx" required className="mb-6 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50" />
                {error && <p role="alert" className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
                <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200">Enviar justificante <ArrowRight size={17} /></button>
                <p className="mt-4 text-center text-xs text-slate-400">Prototipo académico · No sustituye el portal oficial de tu universidad.</p>
              </form>
              <aside className="space-y-5">
                <div className="overflow-hidden rounded-2xl bg-indigo-600 p-6 text-white shadow-sm"><div className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15"><Sparkles size={22} /></div><h3 className="text-xl font-semibold">Ponte al día en el trayecto.</h3><p className="mt-2 text-sm leading-6 text-indigo-100">Tres tarjetas, conceptos clave y una voz que te acompaña mientras vas al campus.</p><div className="mt-6 flex items-center gap-2 border-t border-white/15 pt-5 text-xs text-indigo-100"><Clock3 size={15} /> Repaso rápido + audio</div></div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-semibold">¿Cómo funciona?</h3><div className="mt-5 space-y-5">{[{n:"01",title:"Adjunta tu justificante",desc:"Elige la materia y carga tu comprobante."},{n:"02",title:"Generamos tu guía",desc:"Convertimos la estructura de clase en tarjetas breves."},{n:"03",title:"Escucha y repasa",desc:"Usa la voz de tu dispositivo para estudiar en movimiento."}].map(x => <div key={x.n} className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">{x.n}</span><div><p className="text-sm font-semibold">{x.title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{x.desc}</p></div></div>)}</div></div>
              </aside>
            </div>
          </>
        )}

        {loading && <section className="mx-auto flex min-h-[55vh] max-w-lg flex-col items-center justify-center text-center"><div className="relative mb-7 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600"><Sparkles size={32} /><span className="absolute -right-1 -top-1 h-4 w-4 animate-ping rounded-full bg-indigo-400" /></div><h1 className="text-2xl font-bold">Estamos preparando tu guía</h1><p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">Organizamos los conceptos, las actividades y tu misión para la próxima clase.</p><div className="mt-8 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-200"><div className="h-full w-2/3 animate-pulse rounded-full bg-indigo-600" /></div><div className="mt-5 space-y-3 text-left text-sm text-slate-500"><p className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Justificante recibido</p><p className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" /> Preparando tarjetas de estudio</p><p className="flex items-center gap-2"><Mail size={16} /> Preparando confirmación por correo</p></div></section>}

        {summary && <section className="mx-auto max-w-6xl">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"><CheckCircle2 size={14} /> GUÍA DE ESTUDIO LISTA</div><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Ya estás al día.</h1><p className="mt-2 text-slate-500">Un resumen ejecutivo para entender, recordar y seguir avanzando.</p><p className="mt-3 text-sm font-semibold text-indigo-700">{summary.subject}</p></div>
            <button onClick={resetForm} className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><ArrowLeft size={16} /> Nueva solicitud</button>
          </div>

          <div className="mb-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 p-5 text-white shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-7">
            <div className="mb-4 sm:mb-0"><div className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-100"><Sparkles size={16} /> REPASO EN MOVIMIENTO</div><h2 className="text-xl font-bold sm:text-2xl">Tu clase, contada en voz alta.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100">Escucha las tres tarjetas sin tener que mirar la pantalla. La voz depende de las opciones disponibles en tu navegador.</p></div>
            <div className="shrink-0"><AudioPlayer text={audioText} /></div>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <article className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><BookOpen size={22} /></div><div><p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">01 · Lo esencial</p><h2 className="text-lg font-bold">El resumen en 1 minuto</h2></div></div>
              <ul className="space-y-4">{summary.resumen_corto.slice(0,3).map((item,i)=><li key={item} className="flex gap-3 text-sm leading-6 text-slate-600"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700">{i+1}</span><span>{item}</span></li>)}</ul>
            </article>

            <article className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Users size={22} /></div><div><p className="text-xs font-semibold uppercase tracking-wider text-blue-600">02 · La sesión</p><h2 className="text-lg font-bold">Lo que se hizo en clase</h2></div></div>
              <div className="space-y-5"><div><p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Lecturas previas · Preclass</p><ul className="space-y-2">{summary.preclass.map(item=><li key={item} className="flex gap-2 text-sm leading-6 text-slate-600"><CheckCircle2 size={16} className="mt-1 shrink-0 text-emerald-600"/><span>{item}</span></li>)}</ul></div><div><p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Temas clave</p><ul className="space-y-2">{summary.temas_clave.map(item=><li key={item} className="flex gap-2 text-sm leading-6 text-slate-600"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500"/><span>{item}</span></li>)}</ul></div><div><p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Trabajo en equipo · Breakouts</p><ul className="space-y-2">{summary.actividades_breakout.map(item=><li key={item} className="rounded-lg bg-blue-50/70 p-3 text-sm leading-5 text-slate-700">{item}</li>)}</ul></div></div>
            </article>

            <article className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Target size={22} /></div><div><p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">03 · Próximo paso</p><h2 className="text-lg font-bold">Tu misión</h2></div></div>
              <p className="mb-4 text-sm leading-6 text-slate-500">Llega a la siguiente sesión con estas ideas claras:</p>
              <ul className="space-y-3">{summary.mision_alumno.map((item,i)=><li key={item} className="flex gap-3 text-sm leading-6 text-slate-700"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-xs font-bold text-emerald-700">{i+1}</span><span>{item}</span></li>)}</ul>
              <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4"><div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-800"><Lightbulb size={15}/> Pregunta HMW</div><p className="text-sm font-medium leading-6 text-emerald-950">{summary.pregunta_hmw}</p></div>
            </article>
          </div>

          <div className="mt-6 flex gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-emerald-600"><Mail size={18} /></div><div><p className="text-sm font-semibold text-emerald-900">Copia preparada para tu correo institucional</p><p className="mt-1 text-sm leading-5 text-emerald-800">Se ha enviado una copia a tu correo institucional: {email}. <span className="font-medium">(Confirmación simulada)</span></p></div></div>
          <p className="mt-5 text-center text-xs text-slate-400">Resumen de demostración basado en datos de ejemplo; todavía no se analiza un documento de clase real.</p>
        </section>}

        <footer className="mt-12 flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row"><span>© 2026 AulaClara · Prototipo universitario</span><span>Privacidad · Ayuda · Soporte</span></footer>
      </div>
    </main>
  );
}