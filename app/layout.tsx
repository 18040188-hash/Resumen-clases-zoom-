import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AulaClara | Asistente académico",
  description: "Prototipo universitario para justificar faltas y consultar resúmenes de clase.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}