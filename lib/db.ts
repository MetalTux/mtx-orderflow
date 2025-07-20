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