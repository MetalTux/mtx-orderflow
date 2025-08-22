// lib/db.ts

import { PrismaClient } from '@prisma/client';

// Declarar una variable global para el cliente Prisma en desarrollo.
// Esto evita que Next.js cree múltiples instancias de PrismaClient durante el hot-reloading.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

let db: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  // En producción, siempre crea una nueva instancia
  db = new PrismaClient();
} else {
  // En desarrollo, usa la variable global si ya existe, si no, crea una nueva
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  db = global.prisma;
}

export { db };

// Función genérica para reintentar consultas
export async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error: any) {
      // Códigos de error de conexión de Prisma
      if (error.code === 'P1001' || error.code === 'P2002' || error.code === 'P1014') {
        console.warn(`Error de conexión a la BD, reintentando... (Intento ${attempt + 1})`);
        attempt++;
        // Espera un momento antes de reintentar
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      } else {
        // Si no es un error de conexión, lanzar el error de inmediato
        throw error;
      }
    }
  }
  throw new Error('Falló la conexión a la base de datos después de varios reintentos.');
}