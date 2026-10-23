"use client";

import { useEffect, useRef, useState } from "react";
import { Headphones, Pause, Play, RotateCcw, Volume2 } from "lucide-react";

export default function AudioPlayer({ text }: { text: string }) {
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [supported, setSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  function play() {
    if (!("speechSynthesis" in window)) { setSupported(false); return; }
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
      setPlaying(true);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-MX";
    utterance.rate = 1;
    utterance.onstart = () => { setPlaying(true); setPaused(false); };
    utterance.onend = () => { setPlaying(false); setPaused(false); utteranceRef.current = null; };
    utterance.onerror = () => { setPlaying(false); setPaused(false); utteranceRef.current = null; };
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }

  function pause() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.pause();
    setPlaying(false);
    setPaused(true);
  }

  function stop() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setPlaying(false);
    setPaused(false);
  }

  if (!supported) return <p className="max-w-56 rounded-xl bg-white/15 px-4 py-3 text-sm text-white">Tu navegador no admite lectura en voz alta. Prueba con una versión reciente de Chrome, Edge o Safari.</p>;

  return <div className="min-w-56 rounded-2xl border border-white/20 bg-white/10 p-3">
    <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-indigo-100"><Headphones size={15} /> AUDIO DEL RESUMEN</div>
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={playing ? pause : play} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50">
        {playing ? <Pause size={17} fill="currentColor" /> : paused ? <Play size={17} fill="currentColor" /> : <Volume2 size={17} />}
        {playing ? "Pausar" : paused ? "Continuar" : "Escuchar resumen"}
      </button>
      {(playing || paused) && <button type="button" onClick={stop} aria-label="Detener audio" title="Detener audio" className="inline-flex items-center justify-center rounded-xl border border-white/30 px-3 text-white hover:bg-white/10"><RotateCcw size={17} /></button>}
    </div>
    <p className="mt-2 text-xs text-indigo-100">{playing ? "Reproduciendo…" : paused ? "Audio en pausa" : "Voz sintética de tu dispositivo"}</p>
  </div>;
}