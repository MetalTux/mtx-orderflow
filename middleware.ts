// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lista de rutas que requieren autenticación
const protectedRoutes = ['/dashboard', '/users', '/companies']; // Añade aquí todas tus rutas protegidas

// Lista de rutas públicas (no requieren autenticación)
const publicRoutes = ['/login', '/api/auth/login', '/api/auth/logout', '/api/auth/me']; // '/api/auth/me' debe ser público para que AuthContext lo llame

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get('accessToken')?.value;

  // Si la ruta es pública y el usuario ya está autenticado (tiene un token)
  if (publicRoutes.includes(pathname) && accessToken) {
    // Si intenta ir a /login, redirigirlo a /dashboard si ya está autenticado
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Si la ruta es protegida y el usuario NO está autenticado (no tiene accessToken)
  if (protectedRoutes.includes(pathname) && !accessToken) {
    // Redirigir al login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Permitir el acceso a la ruta
  return NextResponse.next();
}

// Configuración del middleware: qué rutas debe interceptar
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)', // Intercepta todas las rutas excepto _next, favicon.ico
  ],
};