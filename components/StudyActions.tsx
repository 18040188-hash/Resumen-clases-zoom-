"use client";

import { ArrowUpRight, Download, Printer } from "lucide-react";

type Summary = {
  resumen_corto: string[];
  temas_clave: string[];
  preclass: string[];
  actividades_breakout: string[];
  mision_alumno: string[];
  pregunta_hmw: string;
};

export default function StudyActions({
  title,
  subject,
  summary,
}: {
  title: string;
  subject: string;
  summary: Summary;
}) {
  function exportSummary() {
    // Uses the browser print dialog; students can choose “Save as PDF”.
    window.print();
  }

  return (
    <section aria-labelledby="study-actions-title" className="mt-8 grid gap-5 border-y border-[#d8d1c4] py-6 md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#b66a43]">Siguiente parada</p>
        <h2 id="study-actions-title" className="font-serif text-2xl font-normal text-[#20251f]">Lleva tu guía a tu espacio de estudio.</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5d6259]">
          Abre Minerva en otra pestaña o guarda este resumen como PDF para consultarlo después.
          El enlace no inicia sesión ni envía datos a Minerva.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href="https://app.minervaproject.com/home/student"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#244c3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#183729]"
        >
          Abrir Minerva <ArrowUpRight size={17} />
        </a>
        <button
          type="button"
          onClick={exportSummary}
          className="inline-flex min-h-12 items-center justify-center gap-2 border border-[#244c3b] bg-transparent px-5 py-3 text-sm font-semibold text-[#244c3b] transition hover:bg-[#e4e9dc]"
        >
          <Download size={17} /> Guardar PDF <Printer size={15} />
        </button>
      </div>
      <div className="sr-only" aria-hidden="true">{title} · {subject} · {summary.resumen_corto.join(" · ")}</div>
    </section>
  );
}
