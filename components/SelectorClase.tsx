"use client";

export const CLASES = [
  {
    value: "algoritmic-thinking",
    label: "Algoritmic Thinking",
    grupo: "Grupo B",
    hora: "11:20",
  },
  {
    value: "design-thinking",
    label: "Design Thinking",
    grupo: "Grupo A",
    hora: "8:00",
  },
  {
    value: "people-teams",
    label: "People and Teams",
    grupo: "Grupo B",
    hora: "13:00",
  },
] as const;

export default function SelectorClase({
  materia,
  fecha,
  onMateriaChange,
  onFechaChange,
}: {
  materia: string;
  fecha: string;
  onMateriaChange: (value: string) => void;
  onFechaChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div>
        <label htmlFor="materia" className="mb-2 block text-sm font-semibold text-[#20251f]">Materia y grupo *</label>
        <select
          id="materia"
          name="materia"
          required
          value={materia}
          onChange={(e) => onMateriaChange(e.target.value)}
          className="min-h-12 w-full border border-[#c9c1b4] bg-[#fbf9f3] px-4 py-3 text-sm text-[#20251f] outline-none focus:border-[#244c3b]"
        >
          <option value="">Selecciona tu clase</option>
          {CLASES.map((clase) => (
            <option key={clase.value} value={clase.value}>
              {clase.label}, {clase.grupo}, {clase.hora}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="fecha-clase" className="mb-2 block text-sm font-semibold text-[#20251f]">Fecha de la clase *</label>
        <input
          id="fecha-clase"
          name="fecha-clase"
          type="date"
          required
          value={fecha}
          onChange={(e) => onFechaChange(e.target.value)}
          className="min-h-12 w-full border border-[#c9c1b4] bg-[#fbf9f3] px-4 py-3 text-sm text-[#20251f] outline-none focus:border-[#244c3b]"
        />
      </div>
    </div>
  );
}
