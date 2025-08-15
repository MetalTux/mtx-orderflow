// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    // Eliminar las cookies de autenticación
    (await cookies()).set('accessToken', '', { expires: new Date(0), path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
    (await cookies()).set('refreshToken', '', { expires: new Date(0), path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });

    return NextResponse.json({ message: 'Sesión cerrada exitosamente' }, { status: 200 });

  } catch (error) {
    console.error('Error durante el logout:', error);
    return NextResponse.json({ message: 'Error interno del servidor al cerrar sesión' }, { status: 500 });
  }
}