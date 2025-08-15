// app/layout.tsx
'use client';

// Importamos las fuentes Geist y los estilos globales
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Importamos AuthProvider para envolver la aplicación
import { AuthProvider } from '@/context/AuthContext'; // Asegúrate de que esta ruta sea correcta

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children} {/* children representa el contenido de las páginas, incluyendo el AuthLayout */}
        </AuthProvider>
      </body>
    </html>
  );
}