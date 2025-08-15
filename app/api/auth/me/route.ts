// app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/tokens'; // Necesitamos una función para verificar Access Token
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const accessToken = (await cookies()).get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
    }

    // Verificar el Access Token
    let decodedToken;
    try {
      decodedToken = verifyAccessToken(accessToken); // Esta función debería verificar el JWT
    } catch (error) {
      console.error("Access Token verification failed:", error);
      // Si el token no es válido o ha expirado, responde con 401
      return NextResponse.json({ message: 'Token inválido o expirado' }, { status: 401 });
    }

    // Si el token es válido, busca el usuario para obtener sus datos completos
    const user = await db.user.findUnique({
      where: { userId: decodedToken!.userId, isActive: true }, // Suponiendo que tu token tiene un userId
      select: {
        userId: true,
        userEmail: true,
        userName: true,
        role: true,
        companyId: true,
        // ... selecciona otros campos que quieres enviar al frontend
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }

    // Devolver los datos del usuario (sin información sensible como contraseñas)
    const userDataForFrontend = {
      id: user.userId,
      name: user.userName,
      email: user.userEmail,
      role: user.role,
      companyId: user.companyId,
      // ... otros datos
    };

    return NextResponse.json({ user: userDataForFrontend }, { status: 200 });

  } catch (error) {
    console.error('API /api/auth/me error:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}