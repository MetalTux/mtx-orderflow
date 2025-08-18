// app/api/users/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { jwtVerify } from 'jose';

// GET /api/users
// Obtener todos los usuarios, filtrando por compañía si el rol no es "admin"
export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return { error: 'Autenticación requerida', status: 401 };
    }

    const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET as string);
    const { payload } = await jwtVerify(accessToken, secret);
    
    // Extraer el rol y el companyId del payload del token
    const userRole = payload.role as string;
    const userCompanyId = payload.companyId as string;

    // Construir el objeto de consulta 'where' de forma condicional
    let whereClause = {};

    // Si el usuario NO es 'admin', aplicamos el filtro por companyId
    if (userRole !== 'admin') {
      if (!userCompanyId) {
        // Si un manager no tiene companyId, no debería ver nada
        return NextResponse.json({ message: 'No se encuentra el ID de Empresa asignado en el Token' }, { status: 403 });
      }
      whereClause = { companyId: userCompanyId };
    }

    const users = await db.user.findMany({
      where: whereClause,
      select: {
        userId: true,
        userEmail: true,
        userName: true,        
        role: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
        company: {
          select: {
            companyId: true,
            companyName: true,
          }
        }
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error obteniendo los usuarios:', error);
    return NextResponse.json({ message: 'Se generó un fallo al obtener los usuarios' }, { status: 500 });
  }
}

// POST /api/users
// Crear un nuevo usuario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userEmail, userName, userPassword, companyId, role } = body;

    // Validación básica de datos
    if (!userEmail || !userName || !userPassword || !companyId || !role) {
      return NextResponse.json({ message: 'Faltan campos requeridos' }, { status: 400 });
    }

    // Verificar si el correo ya existe
    const existingUser = await db.user.findUnique({ where: { userEmail } });
    if (existingUser) {
      return NextResponse.json({ message: 'Ya existe un usuario con el correo electrónico indicado' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(userPassword, 10);

    const newUser = await db.user.create({
      data: {
        userEmail,
        userName,
        userPassword: hashedPassword,
        companyId,
        role,
        isActive: true
      },
    });

    // No devolver la contraseña en la respuesta
    const { userPassword: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error: any) {
    console.error('Error creando el usuario:', error);
    return NextResponse.json({ message: 'Se generó un fallo al crear el usuario.\n' + error.message }, { status: 500 });
  }
}