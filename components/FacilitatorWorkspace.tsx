"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { BookOpen, CalendarDays, ClipboardList, FileText, Mail, Plus, Save, Trash2 } from "lucide-react";
import { CLASES } from "@/components/SelectorClase";

type Material = { id: string; materia: string; titulo: string; contenido: string; tipo: "material" | "anuncio"; createdAt: string };
type Falta = { id: string; materia: string; fecha: string; email: string; motivo: string; categoria: string; resumen: string; fileName: string; createdAt: string };

const MATERIALS_KEY = "aulaclara_materiales_v1";
const ABSENCES_KEY = "aulaclara_justificantes_v1";
const categories = ["Salud", "Familiar", "Personal", "Académico", "Transporte", "Otro"];

function categorize(reason: string) {
  const value = reason.toLowerCase();
  if (/médic|medic|enferm|salud|hospital|consulta|doctor|cita/.test(value)) return "Salud";
  if (/famil|falle|funer|hij|madre|padre|herman/.test(value)) return "Familiar";
  if (/transporte|tráfico|metro|autobús|camión|accidente|traslado/.test(value)) return "Transporte";
  if (/examen|univers|escuela|académ|clase|tarea/.test(value)) return "Académico";
  if (/personal|trámite|situación/.test(value)) return "Personal";
  return "Otro";
}

function shortReason(reason: string, category: string) {
  const words = reason.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);
  const stop = new Set(["por", "para", "una", "uno", "que", "con", "del", "las", "los", "estoy", "tuve", "debido", "porque", "mi", "me", "el", "la", "de", "en", "un"]);
  const picked = words.filter((word) => !stop.has(word)).slice(0, 4);
  return (picked.length ? picked : [category.toLowerCase(), "reportado"]).join(" ");
}

export default function FacilitatorWorkspace() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [absences, setAbsences] = useState<Falta[]>([]);
  const [materia, setMateria] = useState<string>(CLASES[0].value);
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [tipo, setTipo] = useState<"material" | "anuncio">("material");
  const [filterCategory, setFilterCategory] = useState("Todas");
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
    const filtered = absences.filter((item) => filterCategory === "Todas" || item.categoria === filterCategory);
    return filtered.reduce<Record<string, Falta[]>>((groups, item) => {
      const key = item.fecha.slice(0, 7);
      (groups[key] ||= []).push(item);
      return groups;
    }, {});
  }, [absences, filterCategory]);

  function persistMaterials(next: Material[]) {
    setMaterials(next);
    localStorage.setItem(MATERIALS_KEY, JSON.stringify(next));
  }

  function handleTextFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 500_000) {
      setNotice("El archivo de texto no debe superar 500 KB.");
      return;
    }
    if (!/\.(txt|md)$/i.test(file.name)) {
      setNotice("Por ahora el repositorio acepta archivos .txt y .md. Puedes pegar notas de otros formatos.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setTitulo(file.name.replace(/\.(txt|md)$/i, ""));
      setContenido(String(reader.result || ""));
      setNotice("Archivo cargado. Revisa el contenido y guárdalo.");
    };
    reader.readAsText(file);
  }

  function saveResource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!titulo.trim() || !contenido.trim()) return;
    const entry: Material = { id: crypto.randomUUID(), materia, titulo: titulo.trim(), contenido: contenido.trim(), tipo, createdAt: new Date().toISOString() };
    persistMaterials([entry, ...materials]);
    setTitulo("");
    setContenido("");
    setNotice(tipo === "anuncio" ? "Anuncio guardado en este navegador." : "Material agregado al repositorio local.");
  }

  function deleteResource(id: string) {
    persistMaterials(materials.filter((item) => item.id !== id));
  }

  function mailMonthly(month: string, records: Falta[]) {
    const lines = records.map((item) => `• ${item.fecha} | ${item.materia} | ${item.resumen} | ${item.email}`).join("\n");
    const subject = encodeURIComponent(`Justificantes AulaClara · ${month}`);
    const body = encodeURIComponent(`Hola,\n\nComparto el concentrado de justificantes de ${month}:\n\n${lines}\n\nSaludos.`);
    window.location.href = `mailto:${encodeURIComponent(facilitatorEmail)}?subject=${subject}&body=${body}`;
  }

  return (
    <section className="mt-16 border-t border-[#d8d1c4] pt-10" id="espacio-facilitador">
      <div className="mb-7 max-w-3xl">
        <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#1a73e8]">Herramientas de gestión académica</p>
        <h2 className="font-serif text-3xl sm:text-4xl">Espacio de facilitadores y course managers</h2>
        <p className="mt-3 text-sm leading-6 text-[#5f6368]">Administra materiales, instrucciones y justificantes. Esta versión guarda la información en el navegador actual para validar el flujo; todavía no sincroniza cuentas ni dispositivos.</p>
      </div>

      <div className="grid gap-7 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#dfe3eb] bg-white p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3"><span className="rounded-xl bg-[#e8f0fe] p-3 text-[#1a73e8]"><BookOpen size={20}/></span><div><h3 className="font-semibold">Repositorio de materiales</h3><p className="text-xs text-[#5f6368]">Notas, presentaciones transcritas e instrucciones por materia</p></div></div>
          <form onSubmit={saveResource} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium">Tipo
                <select value={tipo} onChange={(e) => setTipo(e.target.value as "material" | "anuncio")} className="mt-1 min-h-11 w-full rounded-lg border border-[#dadce0] bg-white px-3">
                  <option value="material">Material de clase</option><option value="anuncio">Anuncio / actividad</option>
                </select>
              </label>
              <label className="text-sm font-medium">Materia
                <select value={materia} onChange={(e) => setMateria(e.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-[#dadce0] bg-white px-3">
                  {CLASES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </label>
            </div>
            <label className="block text-sm font-medium">Título
              <input value={titulo} onChange={(e) => setTitulo(e.target.value)} required placeholder={tipo === "anuncio" ? "Ej. Preparar pitch para el martes" : "Ej. Apuntes de propuesta de valor"} className="mt-1 min-h-11 w-full rounded-lg border border-[#dadce0] px-3"/>
            </label>
            <label className="block text-sm font-medium">Contenido o pasos
              <textarea value={contenido} onChange={(e) => setContenido(e.target.value)} required rows={5} placeholder={tipo === "anuncio" ? "1. Preparar una presentación de 90 segundos.\n2. Incluir problema, solución e impacto.\n3. Llevar el pitch listo a la siguiente sesión." : "Pega aquí las notas, conceptos o el contenido que debe aparecer en la guía de estudio."} className="mt-1 w-full rounded-lg border border-[#dadce0] px-3 py-2 text-sm leading-6"/>
            </label>
            <label className="block text-sm font-medium">O cargar notas (.txt o .md)
              <input type="file" accept=".txt,.md,text/plain,text/markdown" onChange={handleTextFile} className="mt-1 block w-full text-sm"/>
            </label>
            <button className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#1a73e8] px-5 text-sm font-semibold text-white"><Save size={16}/> Guardar en repositorio</button>
          </form>
          {notice && <p role="status" className="mt-3 text-xs text-[#1967d2]">{notice}</p>}
          <div className="mt-6 space-y-2">
            {materials.length === 0 ? <p className="text-sm text-[#80868b]">Aún no hay materiales guardados en este navegador.</p> : materials.map((item) => <article key={item.id} className="flex items-start justify-between gap-3 rounded-xl bg-[#f8fafd] p-3">
              <div className="min-w-0"><p className="text-xs font-semibold uppercase text-[#5f6368]">{item.tipo === "anuncio" ? "Anuncio" : "Material"} · {CLASES.find((c) => c.value === item.materia)?.label || item.materia}</p><h4 className="mt-1 text-sm font-semibold">{item.titulo}</h4><p className="mt-1 whitespace-pre-line text-xs leading-5 text-[#5f6368]">{item.contenido.slice(0, 220)}{item.contenido.length > 220 ? "…" : ""}</p></div>
              <button type="button" onClick={() => deleteResource(item.id)} aria-label="Eliminar recurso" className="rounded-full p-2 text-[#5f6368] hover:bg-[#fce8e6] hover:text-[#b3261e]"><Trash2 size={16}/></button>
            </article>)}
          </div>
        </div>

        <div className="rounded-2xl border border-[#dfe3eb] bg-white p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3"><span className="rounded-xl bg-[#e6f4ea] p-3 text-[#188038]"><ClipboardList size={20}/></span><div><h3 className="font-semibold">Control de justificantes</h3><p className="text-xs text-[#5f6368]">Filtros por motivo y concentrado mensual</p></div></div>
          <label className="block text-sm font-medium">Correo del facilitador
            <input type="email" value={facilitatorEmail} onChange={(e) => setFacilitatorEmail(e.target.value)} placeholder="facilitador@ulibertad.edu.mx" className="mt-1 min-h-11 w-full rounded-lg border border-[#dadce0] px-3"/>
          </label>
          <label className="mt-4 block text-sm font-medium">Filtrar por motivo
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-[#dadce0] bg-white px-3">
              <option>Todas</option>{categories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
          <div className="mt-4 flex items-center gap-2 text-xs text-[#5f6368]"><CalendarDays size={15}/> {absences.length} justificante(s) en este navegador</div>
          <div className="mt-4 space-y-4">
            {Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)).map(([month, records]) => <div key={month} className="rounded-xl border border-[#e3e7ee] p-3">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h4 className="font-semibold">{new Date(`${month}-02T12:00:00`).toLocaleDateString("es-MX", { month: "long", year: "numeric" })}</h4><button type="button" disabled={!facilitatorEmail.includes("@")} onClick={() => mailMonthly(month, records)} className="inline-flex min-h-9 items-center gap-2 rounded-full bg-[#e8f0fe] px-3 text-xs font-semibold text-[#1967d2] disabled:opacity-40"><Mail size={14}/> Preparar correo del mes</button></div>
              {records.map((item) => <div key={item.id} className="border-t border-[#edf0f4] py-2"><div className="flex justify-between gap-2 text-xs"><span className="font-semibold">{item.resumen}</span><span className="text-[#5f6368]">{item.fecha}</span></div><p className="mt-1 text-xs text-[#5f6368]">{CLASES.find((c) => c.value === item.materia)?.label || item.materia} · {item.categoria} · {item.email}</p></div>)}
            </div>)}
            {absences.length === 0 && <p className="rounded-xl bg-[#f8fafd] p-4 text-sm text-[#80868b]">Los justificantes enviados desde este mismo navegador aparecerán aquí.</p>}
          </div>
          <p className="mt-4 text-xs leading-5 text-[#80868b]">El botón prepara un correo con el concentrado mensual, pero requiere que el facilitador lo revise y lo envíe desde su cliente de correo.</p>
        </div>
      </div>
      <div className="mt-6 rounded-xl border border-[#fbbc04]/40 bg-[#fef7e0] p-4 text-xs leading-5 text-[#5f6368]"><strong>Alcance de esta versión:</strong> el repositorio y los justificantes se guardan localmente en el dispositivo. Para compartirlos entre alumnos y facilitadores, enviar notificaciones automáticas y leer PDFs/PPTX, falta conectar almacenamiento seguro, autenticación institucional y un proveedor de correo.</div>
    </section>
  );
}
