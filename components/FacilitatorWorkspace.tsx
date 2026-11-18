"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { BookOpen, CalendarDays, ClipboardList, FileText, Mail, Save, Trash2, UploadCloud, Presentation, Network, FileCheck2 } from "lucide-react";
import { CLASES } from "@/components/SelectorClase";

type Material = { id: string; materia: string; titulo: string; descripcion: string; nombreArchivo: string; tipo: "presentacion" | "caso" | "mapa" | "nota"; createdAt: string };
type Falta = { id: string; materia: string; fecha: string; email: string; motivo: string; categoria: string; resumen: string; fileName: string; createdAt: string };

const MATERIALS_KEY = "aulaclara_materiales_v1";
const ABSENCES_KEY = "aulaclara_justificantes_v1";
const categories = ["Salud", "Familiar", "Personal", "Académico", "Transporte", "Otro"];
const typeLabels = { presentacion: "Presentación", caso: "Caso de estudio", mapa: "Mapa mental", nota: "Notas de clase" };

function shortReason(reason: string) {
  const words = reason.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);
  const stop = new Set(["por", "para", "una", "uno", "que", "con", "del", "las", "los", "estoy", "tuve", "debido", "porque", "mi", "me", "el", "la", "de", "en", "un", "a", "y", "fue", "ser"]);
  return words.filter((word) => !stop.has(word)).slice(0, 10).join(" ") || "Motivo no especificado";
}

export default function FacilitatorWorkspace() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [absences, setAbsences] = useState<Falta[]>([]);
  const [materia, setMateria] = useState<string>(CLASES[0].value);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState<Material["tipo"]>("presentacion");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [filterCategory, setFilterCategory] = useState("Todas");
  const [filterMateria, setFilterMateria] = useState("Todas");
  const [facilitatorEmail, setFacilitatorEmail] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      setMaterials(JSON.parse(localStorage.getItem(MATERIALS_KEY) || "[]"));
      setAbsences(JSON.parse(localStorage.getItem(ABSENCES_KEY) || "[]"));
    } catch {
      setMaterials([]);
      setAbsences([]);
    }
  }, []);

  const grouped = useMemo(() => {
    const filtered = absences.filter((item) => (filterCategory === "Todas" || item.categoria === filterCategory) && (filterMateria === "Todas" || item.materia === filterMateria));
    return filtered.reduce<Record<string, Falta[]>>((groups, item) => {
      const key = item.fecha.slice(0, 7);
      (groups[key] ||= []).push(item);
      return groups;
    }, {});
  }, [absences, filterCategory, filterMateria]);

  function persistMaterials(next: Material[]) {
    setMaterials(next);
    localStorage.setItem(MATERIALS_KEY, JSON.stringify(next));
  }

  function saveResource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!titulo.trim()) return;
    if (archivo && archivo.size > 15 * 1024 * 1024) {
      setNotice("El archivo debe pesar menos de 15 MB.");
      return;
    }
    const entry: Material = {
      id: crypto.randomUUID(), materia, titulo: titulo.trim(), descripcion: descripcion.trim(),
      nombreArchivo: archivo?.name || "", tipo, createdAt: new Date().toISOString()
    };
    persistMaterials([entry, ...materials]);
    setTitulo(""); setDescripcion(""); setArchivo(null);
    const input = document.getElementById("material-file") as HTMLInputElement | null;
    if (input) input.value = "";
    setNotice("Material agregado. Se mostrará como complemento en el resumen de esta materia.");
  }

  function deleteResource(id: string) {
    persistMaterials(materials.filter((item) => item.id !== id));
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    setArchivo(file);
    if (file && file.size > 15 * 1024 * 1024) setNotice("El archivo supera el límite de 15 MB.");
    else setNotice(file ? `Archivo seleccionado: ${file.name}` : "");
  }

  function mailMonthly(month: string, records: Falta[]) {
    const lines = records.map((item) => `• ${item.fecha} | ${item.materia} | ${item.resumen} | ${item.email}`).join("\n");
    const subject = encodeURIComponent(`Justificantes AulaClara · ${month}`);
    const body = encodeURIComponent(`Hola,\n\nComparto el concentrado de justificantes de ${month}:\n\n${lines}\n\nSaludos.`);
    window.location.href = `mailto:${encodeURIComponent(facilitatorEmail)}?subject=${subject}&body=${body}`;
  }

  return (
    <section className="mt-4" id="espacio-facilitador">
      <div className="mb-7 max-w-3xl">
        <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#087e77]">Panel de gestión académica</p>
        <h1 className="font-serif text-4xl sm:text-5xl">Hola, facilitador.</h1>
        <p className="mt-3 text-sm leading-6 text-[#555]">Aquí puedes consultar las faltas de tus alumnos y preparar los materiales que acompañarán sus resúmenes de clase.</p>
      </div>

      <div className="grid gap-7 lg:grid-cols-[1.05fr_.95fr]">
        <div className="rounded-2xl border border-[#dedede] bg-white p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3"><span className="rounded-xl bg-[#e5f8f6] p-3 text-[#087e77]"><BookOpen size={20}/></span><div><h2 className="text-lg font-semibold">Materiales para tus clases</h2><p className="text-xs text-[#666]">Agrega recursos opcionales al resumen del alumno</p></div></div>
          <form onSubmit={saveResource} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium">Materia
                <select value={materia} onChange={(e) => setMateria(e.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-[#dadce0] bg-white px-3">
                  {CLASES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </label>
              <label className="text-sm font-medium">Tipo de recurso
                <select value={tipo} onChange={(e) => setTipo(e.target.value as Material["tipo"])} className="mt-1 min-h-11 w-full rounded-lg border border-[#dadce0] bg-white px-3">
                  <option value="presentacion">Presentación PowerPoint</option><option value="caso">Caso de estudio</option><option value="mapa">Mapa mental</option><option value="nota">Notas de clase</option>
                </select>
              </label>
            </div>
            <label className="block text-sm font-medium">Nombre del material
              <input value={titulo} onChange={(e) => setTitulo(e.target.value)} required placeholder="Ej. Caso de estudio: Airbnb" className="mt-1 min-h-11 w-full rounded-lg border border-[#dadce0] px-3"/>
            </label>
            <label className="block text-sm font-medium">Archivo (opcional)
              <span className="mt-2 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#c8d8d6] bg-[#f6fbfa] p-4 text-center hover:bg-[#eaf7f5]">
                <UploadCloud size={23} className="mb-2 text-[#087e77]"/>
                <span className="text-sm font-semibold">{archivo ? archivo.name : "Subir presentación, caso o mapa mental"}</span>
                <span className="mt-1 text-xs text-[#666]">PPT, PPTX, PDF, DOCX, PNG o JPG · Máximo 15 MB</span>
                <input id="material-file" type="file" accept=".ppt,.pptx,.pdf,.doc,.docx,.png,.jpg,.jpeg,.txt,.md" onChange={handleFile} className="sr-only"/>
              </span>
            </label>
            <label className="block text-sm font-medium">Notas para integrar al resumen (opcional)
              <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3} placeholder="Escribe los conceptos clave, instrucciones o qué debe revisar el alumno..." className="mt-1 w-full rounded-lg border border-[#dadce0] px-3 py-2 text-sm leading-6"/>
            </label>
            <button className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#111] px-5 text-sm font-semibold text-white"><Save size={16}/> Agregar material</button>
          </form>
          {notice && <p role="status" className="mt-3 text-xs text-[#087e77]">{notice}</p>}
          <div className="mt-6 space-y-2">
            {materials.length === 0 ? <p className="rounded-xl bg-[#f7f8f8] p-4 text-sm text-[#777]">Todavía no hay materiales. Agrega uno para verlo reflejado en el resumen del alumno.</p> : materials.map((item) => <article key={item.id} className="flex items-start justify-between gap-3 rounded-xl bg-[#f7f9f9] p-3">
              <div className="min-w-0"><p className="text-xs font-semibold uppercase text-[#087e77]">{typeLabels[item.tipo]} · {CLASES.find((c) => c.value === item.materia)?.label || item.materia}</p><h3 className="mt-1 text-sm font-semibold">{item.titulo}</h3>{item.nombreArchivo && <p className="mt-1 flex items-center gap-1 text-xs text-[#666]"><FileCheck2 size={13}/>{item.nombreArchivo}</p>}{item.descripcion && <p className="mt-1 whitespace-pre-line text-xs leading-5 text-[#555]">{item.descripcion}</p>}</div>
              <button type="button" onClick={() => deleteResource(item.id)} aria-label="Eliminar material" className="rounded-full p-2 text-[#666] hover:bg-[#ffeded] hover:text-[#b3261e]"><Trash2 size={16}/></button>
            </article>)}
          </div>
        </div>

        <div className="rounded-2xl border border-[#dedede] bg-white p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3"><span className="rounded-xl bg-[#f8f9df] p-3 text-[#666b00]"><ClipboardList size={20}/></span><div><h2 className="text-lg font-semibold">Justificantes de alumnos</h2><p className="text-xs text-[#666]">Motivos resumidos en máximo 10 palabras</p></div></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium">Materia
              <select value={filterMateria} onChange={(e) => setFilterMateria(e.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-[#dadce0] bg-white px-3"><option>Todas</option>{CLASES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select>
            </label>
            <label className="text-sm font-medium">Motivo
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-[#dadce0] bg-white px-3"><option>Todas</option>{categories.map((category) => <option key={category}>{category}</option>)}</select>
            </label>
          </div>
          <label className="mt-4 block text-sm font-medium">Correo del facilitador
            <input type="email" value={facilitatorEmail} onChange={(e) => setFacilitatorEmail(e.target.value)} placeholder="facilitador@ulibertad.edu.mx" className="mt-1 min-h-11 w-full rounded-lg border border-[#dadce0] px-3"/>
          </label>
          <div className="mt-4 flex items-center gap-2 text-xs text-[#666]"><CalendarDays size={15}/> {absences.length} justificante(s) registrados en este navegador</div>
          <div className="mt-4 space-y-4">
            {Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)).map(([month, records]) => <div key={month} className="rounded-xl border border-[#e3e7ee] p-3">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold capitalize">{new Date(`${month}-02T12:00:00`).toLocaleDateString("es-MX", { month: "long", year: "numeric" })}</h3><button type="button" disabled={!facilitatorEmail.includes("@")} onClick={() => mailMonthly(month, records)} className="inline-flex min-h-9 items-center gap-2 rounded-full bg-[#e5f8f6] px-3 text-xs font-semibold text-[#087e77] disabled:opacity-40"><Mail size={14}/> Preparar correo</button></div>
              {records.map((item) => <div key={item.id} className="border-t border-[#edf0f4] py-3"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-semibold">{item.resumen || shortReason(item.motivo)}</span><span className="text-xs text-[#666]">{item.fecha}</span></div><p className="mt-1 text-xs text-[#666]">{CLASES.find((c) => c.value === item.materia)?.label || item.materia} · {item.categoria}</p><p className="mt-1 text-xs text-[#777]">{item.email}</p></div>)}
            </div>)}
            {absences.length === 0 && <p className="rounded-xl bg-[#f7f8f8] p-4 text-sm text-[#777]">Cuando un alumno envíe un justificante desde este navegador, su motivo aparecerá aquí resumido.</p>}
          </div>
          <p className="mt-4 text-xs leading-5 text-[#777]">Prototipo: los registros se comparten entre las dos interfaces en este mismo navegador. El correo mensual se prepara para revisión antes de enviarse.</p>
        </div>
      </div>
    </section>
  );
}
