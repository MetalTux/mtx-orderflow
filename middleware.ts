// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Definición de roles requeridos por ruta
// Diferentes Roles:
// * admin: Administrador de plataforma que permite agregar Compañías o Empresas y también crear y modificar Usuarios.
// * manager: Administrador de aplicación a nivel de Compañía o Empresa, permite crear Usuarios y datos de Mantenedores.
// * controller: Usuario que puede generar Cotizaciones y Ordenes de Trabajo.
// * employee: Usuario que sólo puede manejar las Ordenes de Trabajo asignadas para indicar estado de avance.
const roleBasedAccess = {
  '/dashboard': ['controller', 'admin', 'manager'],
  '/users': ['admin', 'manager'],
  '/companies': ['admin'],
  '/admin': ['admin'],
  '/api/users': ['admin', 'manager'],
  '/api/companies': ['admin'],
  '/api/admin': ['admin'],
};

// Rutas públicas que no requieren autenticación
const publicRoutes = [
  '/login',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/me',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken')?.value;

  // Lógica de validación de autenticación (igual que antes)
  if (publicRoutes.includes(pathname) && accessToken) {
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  if (!publicRoutes.includes(pathname) && !accessToken) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Lógica de validación de roles (con el arreglo corregido)
  if (accessToken) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);
      const { payload } = await jwtVerify(accessToken, secret);
      const userRole = payload.role as string;

      // SOLUCIÓN: Usar la aserción de tipo 'as keyof typeof roleBasedAccess' o 'in' para que TypeScript lo entienda
      if (Object.prototype.hasOwnProperty.call(roleBasedAccess, pathname)) {
        // Ahora TypeScript sabe que la propiedad existe
        const requiredRoles = roleBasedAccess[pathname as keyof typeof roleBasedAccess];

        if (!requiredRoles.includes(userRole)) {
          // Si el usuario no tiene el rol necesario
          if (pathname.startsWith('/api/')) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
          }
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }
    } catch (error) {
      console.error('Invalid token:', error);
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};