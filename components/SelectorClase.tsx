"use client";

export const CLASES = [
  {
    value: "Algoritmic Thinking",
    label: "Algoritmic Thinking",
    grupo: "Grupo B",
    hora: "11:20",
  },
  {
    value: "Design Thinking",
    label: "Design Thinking",
    grupo: "Grupo A",
    hora: "8:00",
  },
  {
    value: "People and Teams",
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
        <label htmlFor="materia">
          Materia y grupo *
        </label>
        <select
          id="materia"
          name="materia"
          required
          value={materia}
          onChange={(e) => onMateriaChange(e.target.value)}
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
        <label htmlFor="fecha-clase">
          Fecha de la clase *
        </label>
        <input
          id="fecha-clase"
          name="fecha-clase"
          type="date"
          required
          value={fecha}
          onChange={(e) => onFechaChange(e.target.value)}
        />
      </div>
    </div>
  );
}