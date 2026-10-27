"use client";

import { useEffect, useRef, useState } from "react";
import { Headphones, Pause, Play, Volume2 } from "lucide-react";

/**
 * Audio summary player.
 * Uses a generated audio URL when provided; otherwise speaks the summary
 * with the browser's built-in speech synthesis, requiring no API key.
 */
export default function AudioPlayer({
  text,
  vozCalida = true,
  audioSrc,
}: {
  text: string;
  vozCalida?: boolean;
  audioSrc?: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");
  const [usingBrowserVoice, setUsingBrowserVoice] = useState(false);

  useEffect(() => {
    setPlaying(false);
    setError("");
    setUsingBrowserVoice(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [audioSrc, text]);

  function speakWithBrowserVoice() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setError("Este navegador no admite voz automática. Prueba con Chrome, Edge o Safari actualizado.");
      return;
    }
    const synthesis = window.speechSynthesis;
    synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-MX";
    utterance.rate = vozCalida ? 0.92 : 1;
    utterance.pitch = vozCalida ? 1.02 : 1;
    const voices = synthesis.getVoices();
    const spanishVoice = voices.find((voice) => voice.lang.toLowerCase() === "es-mx")
      ?? voices.find((voice) => voice.lang.toLowerCase().startsWith("es"));
    if (spanishVoice) utterance.voice = spanishVoice;

    utterance.onstart = () => {
      setPlaying(true);
      setUsingBrowserVoice(true);
      setError("");
    };
    utterance.onend = () => setPlaying(false);
    utterance.onerror = (event) => {
      setPlaying(false);
      if (event.error !== "canceled" && event.error !== "interrupted") {
        setError("No se pudo reproducir la voz en este navegador. Intenta de nuevo.");
      }
    };
    utteranceRef.current = utterance;
    setUsingBrowserVoice(true);
    synthesis.speak(utterance);
  }

  async function togglePlayback() {
    setError("");
    if (audioSrc && audioRef.current) {
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
        return;
      }
      try {
        await audioRef.current.play();
        setPlaying(true);
      } catch {
        setError("No se pudo reproducir el audio. Intenta de nuevo.");
      }
      return;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window && playing) {
      window.speechSynthesis.pause();
      setPlaying(false);
      return;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setPlaying(true);
      return;
    }
    speakWithBrowserVoice();
  }

  function stopPlayback() {
    if (audioRef.current) audioRef.current.pause();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setPlaying(false);
  }

  return (
    <div className="w-full max-w-md border border-white/25 bg-white/10 p-4 text-white">
      <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#e3e7d8]">
        <Headphones size={16} /> Repaso en audio · {vozCalida ? "voz cálida" : "voz estándar"}
      </div>
      <button type="button" onClick={togglePlayback}
        className="inline-flex min-h-12 items-center gap-2 bg-[#fbf9f3] px-5 py-3 text-sm font-bold text-[#244c3b] hover:bg-[#e4e9dc]">
        {playing ? <Pause size={17} /> : audioSrc ? <Play size={17} fill="currentColor" /> : <Volume2 size={17} />}
        {playing ? "Pausar audio" : "Escuchar resumen"}
      </button>
      {playing && <button type="button" onClick={stopPlayback} className="ml-2 min-h-12 border border-white/40 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10">Detener</button>}
      {audioSrc && <audio ref={audioRef} src={audioSrc} controls className="mt-4 w-full" onEnded={() => setPlaying(false)} onPause={() => setPlaying(false)} onPlay={() => setPlaying(true)} />}
      <p className="mt-3 text-xs leading-5 text-[#e3e7d8]">
        {audioSrc
          ? "Reproductor de audio listo."
          : usingBrowserVoice
            ? "Voz en español generada por tu navegador. No requiere API ni claves."
            : "Reproduce el resumen con la voz en español disponible en tu navegador."}
      </p>
      {error && <p role="status" className="mt-2 text-sm leading-5 text-white">{error}</p>}
    </div>
  );
}
