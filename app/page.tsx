"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import {
  ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, Clock3, CloudUpload,
  FileText, GraduationCap, Mail, ShieldCheck, Sparkles, UploadCloud, X
} from "lucide-react";

type Summary = {
  title: string;
  subject: string;
  duration: string;
  points: { time: string; title: string; detail: string }[];
};

const subjects = [
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
  const [summary, setSummary] = useState<Summary | null>(null);
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
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo procesar el justificante.");
      setSummary(data.summary);
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

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm"><GraduationCap size={22} /></div>
            <div><p className="text-base font-bold tracking-tight">Aula<span className="text-indigo-600">Clara</span></p><p className="text-xs text-slate-500">Asistente académico</p></div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 sm:flex"><ShieldCheck size={14} className="text-emerald-600" /> Portal de estudiantes</div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-700">AL</div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="mb-8 flex items-center gap-2 text-sm text-slate-500"><span>Portal</span><span>/</span><span className="font-medium text-slate-800">Justificación de falta</span></div>
        {!summary && !loading && (
          <>
            <div className="mb-9 max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700"><Sparkles size={14} /> TU CLASE, EN RESUMEN</div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Justificación de falta</h1>
              <p className="mt-3 text-base leading-7 text-slate-500">Envía tu justificante y recibe los puntos más importantes de la clase para que puedas ponerte al día.</p>
            </div>
            <div className="grid gap-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
              <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-7 flex items-center gap-3 border-b border-slate-100 pb-5"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><FileText size={21} /></div><div><h2 className="font-semibold">Datos del justificante</h2><p className="mt-0.5 text-sm text-slate-500">Completa la información de tu ausencia.</p></div></div>
                <label htmlFor="subject" className="mb-2 block text-sm font-semibold text-slate-700">Materia <span className="text-rose-500">*</span></label>
                <select id="subject" value={subject} onChange={e => setSubject(e.target.value)} className="mb-6 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50" required>
                  <option value="">Selecciona una materia</option>{subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Comprobante de ausencia <span className="text-rose-500">*</span></label>
                <input ref={fileInput} id="file" type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFile} className="hidden" />
                <button type="button" onClick={() => fileInput.current?.click()} className="mb-6 flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-8 text-center transition hover:border-indigo-400 hover:bg-indigo-50/40">
                  {file ? <><div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Check size={22} /></div><span className="max-w-full truncate text-sm font-semibold text-slate-800">{file.name}</span><span className="mt-1 text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB · Archivo seleccionado</span></> : <><div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm"><CloudUpload size={22} /></div><span className="text-sm font-semibold text-slate-700">Haz clic para subir tu archivo</span><span className="mt-1 text-xs text-slate-500">PDF, JPG o PNG · Máximo 10 MB</span></>}
                </button>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">Correo institucional <span className="text-rose-500">*</span></label>
                <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nombre@universidad.edu.mx" required className="mb-6 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50" />
                {error && <p role="alert" className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
                <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200">Enviar justificante <ArrowRight size={17} /></button>
                <p className="mt-4 text-center text-xs text-slate-400">Prototipo académico · No sustituye el portal oficial de tu universidad.</p>
              </form>
              <aside className="space-y-5">
                <div className="overflow-hidden rounded-2xl bg-indigo-600 p-6 text-white shadow-sm"><div className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15"><Sparkles size={22} /></div><h3 className="text-xl font-semibold">No te pierdas lo importante.</h3><p className="mt-2 text-sm leading-6 text-indigo-100">Recibe un resumen claro de la sesión y vuelve a tus estudios con confianza.</p><div className="mt-6 flex items-center gap-2 border-t border-white/15 pt-5 text-xs text-indigo-100"><Clock3 size={15} /> Puntos clave con marcas de tiempo</div></div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-semibold">¿Cómo funciona?</h3><div className="mt-5 space-y-5">{[{n:"01",title:"Adjunta tu justificante",desc:"Elige la materia y carga tu comprobante."},{n:"02",title:"Generamos el resumen",desc:"Simulamos el procesamiento de la clase."},{n:"03",title:"Recíbelo por correo",desc:"La interfaz confirma el envío simulado."}].map(x => <div key={x.n} className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">{x.n}</span><div><p className="text-sm font-semibold">{x.title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{x.desc}</p></div></div>)}</div></div>
              </aside>
            </div>
          </>
        )}
        {loading && <section className="mx-auto flex min-h-[55vh] max-w-lg flex-col items-center justify-center text-center"><div className="relative mb-7 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600"><Sparkles size={32} /><span className="absolute -right-1 -top-1 h-4 w-4 animate-ping rounded-full bg-indigo-400" /></div><h1 className="text-2xl font-bold">Estamos preparando tu resumen</h1><p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">Estamos procesando tu solicitud y organizando los puntos clave de la sesión.</p><div className="mt-8 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-200"><div className="h-full w-2/3 animate-pulse rounded-full bg-indigo-600" /></div><div className="mt-5 space-y-3 text-left text-sm text-slate-500"><p className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Datos del justificante recibidos</p><p className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" /> Preparando resumen de la clase</p><p className="flex items-center gap-2"><Mail size={16} /> Preparando confirmación por correo</p></div></section>}
        {summary && <section className="mx-auto max-w-3xl"><div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"><CheckCircle2 size={14} /> SOLICITUD PROCESADA</div><h1 className="text-3xl font-bold tracking-tight">¡Ya estás al día!</h1><p className="mt-2 text-slate-500">Aquí tienes los puntos clave de tu clase.</p></div><button onClick={resetForm} className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><ArrowLeft size={16} /> Nueva solicitud</button></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex items-start gap-4 border-b border-slate-100 pb-6"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><BookOpen size={23} /></div><div><p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">{summary.subject}</p><h2 className="mt-1 text-xl font-bold">{summary.title}</h2><p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500"><Clock3 size={14} /> Duración de referencia: {summary.duration}</p></div></div>
            <div className="py-6"><h3 className="mb-5 font-semibold">Resumen de la sesión</h3><div className="space-y-5">{summary.points.map((point, i) => <div key={point.time} className="flex gap-4"><div className="flex flex-col items-center"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700">{String(i + 1).padStart(2,"0")}</span>{i < summary.points.length - 1 && <span className="mt-2 w-px flex-1 bg-slate-200" />}</div><div className="pb-3"><span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600"><Clock3 size={12} /> {point.time}</span><h4 className="mt-2 font-semibold">{point.title}</h4><p className="mt-1 text-sm leading-6 text-slate-500">{point.detail}</p></div></div>)}</div></div>
            <div className="flex gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-emerald-600"><Mail size={18} /></div><div><p className="text-sm font-semibold text-emerald-900">Copia preparada para tu correo institucional</p><p className="mt-1 text-sm leading-5 text-emerald-800">Se ha enviado una copia a tu correo institucional: {email}. <span className="font-medium">(Confirmación simulada)</span></p></div></div>
            <p className="mt-5 text-center text-xs text-slate-400">Resumen de demostración: el contenido no se generó a partir de una grabación real.</p>
          </div>
        </section>}
        <footer className="mt-12 flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row"><span>© 2026 AulaClara · Prototipo universitario</span><span>Privacidad · Ayuda · Soporte</span></footer>
      </div>
    </main>
  );
}