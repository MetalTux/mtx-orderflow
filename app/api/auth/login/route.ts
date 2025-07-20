// /app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Tu instancia de Prisma
import { generateAccessToken, generateRefreshToken } from '@/lib/tokens'; // Funciones para generar tokens
import { saveUserSession } from '@/lib/sessions'; // Función para guardar la sesión en la DB
import { verifyPassword } from '@/lib/hash'; // Función para verificar contraseñas hasheadas
import { User } from '@prisma/client'; // Importa el tipo User de Prisma

// Helper function to find a user by email using Prisma
async function findUserByEmail(email: string): Promise<User | null> {
  // Busca un usuario en la tabla 'user' de la base de datos por su email
  const user = await db.user.findUnique({
    where: { userEmail: email },
  });
  return user;
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. Validar que se recibieron email y password
    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    // 2. Buscar el usuario en la base de datos usando Prisma
    const user = await findUserByEmail(email);

    if (!user) {
      // Si el usuario no existe, devuelve un error de credenciales inválidas.
      // Esto ayuda a prevenir la enumeración de usuarios.
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // 3. Verificar la contraseña hasheada
    // 'user.userPassword' debe contener el hash de la contraseña almacenado en la DB
    const passwordMatch = await verifyPassword(password, user.userPassword);

    if (!passwordMatch) {
      // Si la contraseña no coincide
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // --- Si llegamos hasta aquí, el usuario es válido y la contraseña es correcta ---

    // 4. Capturar información de la solicitud para la sesión
    // Nota: 'request.ip' puede no estar directamente disponible en todas las implementaciones
    // o tipos de NextRequest sin un "as any". Usamos un fallback robusto.
    const clientIp = (request as any).ip || request.headers.get('x-forwarded-for') || 'Unknown';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // 5. Generar Access Token y Refresh Token
    const accessToken = generateAccessToken({
      userId: user.userId,
      userName: user.userName,
      userEmail: user.userEmail,
      companyId: user.companyId,
      role: user.role,
    });
    const refreshToken = generateRefreshToken(user.userId); // Este token contendrá el JTI (sessionId)

    // 6. Guardar la sesión de usuario en la base de datos usando la función de /lib/sessions.ts
    await saveUserSession({
      userId: user.userId,
      refreshToken: refreshToken,
      ipAddress: clientIp,
      userAgent: userAgent,
    });

    // 7. Preparar la respuesta HTTP
    const response = NextResponse.json({ message: 'Login successful', accessToken }, { status: 200 });

    // 8. Establecer el Refresh Token como una cookie segura
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true, // La cookie no es accesible desde JavaScript del lado del cliente
      secure: process.env.NODE_ENV === 'production', // Solo se envía sobre HTTPS en producción
      sameSite: 'strict', // Protege contra ataques CSRF
      path: '/', // La cookie es accesible en todas las rutas de tu dominio
      maxAge: 7 * 24 * 60 * 60, // 7 días (ajusta según tu política de seguridad)
    });

    return response;

  } catch (error) {
    // Manejo de errores genérico. Imprime el error para depuración.
    console.error('Login API error:', error);
    // Devuelve un error genérico para el cliente para no exponer detalles internos
    return NextResponse.json({ message: 'Internal server error during login' }, { status: 500 });
  }
}