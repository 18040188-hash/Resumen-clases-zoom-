"use client";

import { useEffect, useRef, useState } from "react";
import { Headphones, Pause, Play, Volume2 } from "lucide-react";

/**
 * ElevenLabs-ready audio player.
 * Pass audioSrc when a server route has generated audio bytes and returned a URL.
 * TODO: Integrate ElevenLabs in a server-only route using ELEVENLABS_API_KEY,
 * a configured voice_id, and POST { text, vozCalida } to generate an audio file.
 * Never expose the ElevenLabs API key in client-side code.
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
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setPlaying(false);
    setError("");
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [audioSrc, text]);

  async function togglePlayback() {
    setError("");
    if (!audioSrc || !audioRef.current) {
      setError("La voz cálida de ElevenLabs está preparada para integrarse, pero aún falta configurar la API y generar el archivo de audio.");
      return;
    }
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
      {audioSrc && <audio ref={audioRef} src={audioSrc} onEnded={() => setPlaying(false)} onPause={() => setPlaying(false)} onPlay={() => setPlaying(true)} />}
      <p className="mt-3 text-xs leading-5 text-[#e3e7d8]">{audioSrc ? "Audio generado con voz sintética." : "Integración de ElevenLabs pendiente de configurar."}</p>
      {error && <p role="status" className="mt-2 text-sm leading-5 text-white">{error}</p>}
    </div>
  );
}
