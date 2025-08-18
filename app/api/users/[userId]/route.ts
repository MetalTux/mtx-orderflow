// app/api/users/[userId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { jwtVerify } from 'jose';

// Helper para validar acceso por rol y compañía
async function validateAccess(request: NextRequest, targetUserId: string) {
  const accessToken = request.cookies.get('accessToken')?.value;

  if (!accessToken) {
    return { error: 'Autenticación requerida', status: 401 };
  }

  const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET as string);
  const { payload } = await jwtVerify(accessToken, secret);

  const userRole = payload.role as string;
  const userCompanyId = payload.companyId as string;
  const loggedInUserId = payload.userId as string;

  // Lógica de validación
  // 1. Un usuario solo puede ver/editar su propio perfil
  // 2. Un 'manager' puede ver/editar a otros usuarios de su misma compañía
  // 3. Un 'admin' puede ver/editar cualquier usuario
  if (userRole === 'admin') {
    return { isValid: true, userRole, userCompanyId, loggedInUserId };
  }

  // Si el usuario intenta acceder a su propio perfil
  if (loggedInUserId === targetUserId) {
    return { isValid: true, userRole, userCompanyId, loggedInUserId };
  }

  // Si es un manager, verificar si el usuario objetivo está en su misma compañía
  if (userRole === 'manager') {
    if (!userCompanyId) {
      return { error: 'Usuario no posee una Empresa asociada', status: 403 };
    }

    const targetUser = await db.user.findUnique({
      where: { userId: targetUserId },
      select: { companyId: true }
    });

    if (targetUser && targetUser.companyId === userCompanyId) {
      return { isValid: true, userRole, userCompanyId, loggedInUserId };
    }
  }

  return { error: 'Forbidden', status: 403 };
}

// GET /api/users/[userId]
// Obtener un usuario por ID
export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  const { userId } = params;

  try {
    const accessCheck = await validateAccess(request, userId);
    if (accessCheck.error) {
      return NextResponse.json({ message: accessCheck.error }, { status: accessCheck.status });
    }

    const user = await db.user.findUnique({
      where: { userId },
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

    if (!user) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error obteniendo el usuario:', error);
    return NextResponse.json({ message: 'Se generó un fallo al obtener el usuario o es un token inválido' }, { status: 500 });
  }
}

// PUT /api/users/[userId]
// Actualizar un usuario
export async function PUT(request: NextRequest, { params }: { params: { userId: string } }) {
  const { userId } = params;
  
  try {
    const accessCheck = await validateAccess(request, userId);
    if (accessCheck.error) {
      return NextResponse.json({ message: accessCheck.error }, { status: accessCheck.status });
    }

    const body = await request.json();
    const { userName, userEmail, password, role, isActive } = body;

    // 1. Obtener el usuario que se va a actualizar para su validación
    const userToUpdate = await db.user.findUnique({
      where: { userId },
      select: { userId: true, role: true, companyId: true }
    });

    if (!userToUpdate) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }

    const dataToUpdate: any = {};

    // 2. Lógica de autorización y actualización basada en roles
    // Un 'admin' tiene permiso total para actualizar
    if (accessCheck.userRole === 'admin') {
      if (userName) dataToUpdate.userName = userName;
      if (userEmail) dataToUpdate.userEmail = userEmail;
      if (isActive !== undefined) dataToUpdate.isActive = isActive;
      if (role) dataToUpdate.role = role;
      if (password) {
        dataToUpdate.password = await bcrypt.hash(password, 10);
      }
    }
    // Un 'manager' puede actualizar usuarios de su misma compañía
    else if (accessCheck.userRole === 'manager') {
      // Validar si el usuario a actualizar pertenece a la misma compañía que el 'manager'
      if (userToUpdate.companyId !== accessCheck.userCompanyId) {
        return NextResponse.json({ message: 'Acceso Denegado. Solo puedes actualizar usuarios de tu misma compañía.' }, { status: 403 });
      }

      // Validar que un 'manager' no pueda cambiar el rol a 'admin' o actualizar a un 'admin'
      if (role === 'admin' || userToUpdate.role === 'admin') {
         return NextResponse.json({ message: 'Acceso Denegado. Un manager no puede actualizar roles de administrador.' }, { status: 403 });
      }

      // Validar que un 'manager' no se actualice a sí mismo
      if (role !== 'manager') {
        return NextResponse.json({ message: 'Acceso Denegado. Un manager no puede actualizar roles de manager.' }, { status: 403 });
      }
      
      if (userName) dataToUpdate.userName = userName;
      if (userEmail) dataToUpdate.userEmail = userEmail;
      if (isActive !== undefined) dataToUpdate.isActive = isActive;
      if (password) {
        dataToUpdate.password = await bcrypt.hash(password, 10);
      }
    }
    // Un usuario regular puede actualizar solo su propio perfil
    else {
      // Validar que el usuario que hace la solicitud sea el mismo que se actualiza
      if (userId !== accessCheck.loggedInUserId) {
        return NextResponse.json({ message: 'Acceso Denegado. Solo puedes actualizar tu propio perfil.' }, { status: 403 });
      }

      // Un usuario regular no puede cambiar el rol
      if (role) {
         return NextResponse.json({ message: 'Acceso Denegado. No tienes permisos para cambiar tu rol.' }, { status: 403 });
      }

      if (userName) dataToUpdate.userName = userName;
      if (userEmail) dataToUpdate.userEmail = userEmail;
      if (password) {
        dataToUpdate.password = await bcrypt.hash(password, 10);
      }
    }

    // 3. Si no hay datos para actualizar
    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ message: 'No hay datos para actualizar' }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { userId },
      data: dataToUpdate,
    });

    const { userPassword: userPassword, ...userWithoutPassword } = updatedUser;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error actualizando el usuario:', error);
    return NextResponse.json({ message: 'Se generó un fallo al actualizar el usuario' }, { status: 500 });
  }
}

// DELETE /api/users/[userId]
// Eliminar un usuario
export async function DELETE(request: NextRequest, { params }: { params: { userId: string } }) {
  const { userId } = params;

  try {
    const accessCheck = await validateAccess(request, userId);

    // 1. Verificar si el usuario a eliminar existe
    const userToDelete = await db.user.findUnique({
      where: { userId },
      select: { userId: true, companyId: true, role: true }
    });

    if (!userToDelete) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }

    // 2. Lógica de autorización basada en el rol
    // Si el usuario es 'admin', tiene acceso total
    if (accessCheck.userRole === 'admin') {
      // Un admin no puede eliminarse a sí mismo
      if (accessCheck.loggedInUserId === userId) {
        return NextResponse.json({ message: 'Un administrador no puede eliminarse a sí mismo' }, { status: 403 });
      }

      await db.user.delete({ where: { userId } });
      return NextResponse.json({ message: 'Usuario eliminado exitosamente' });
    }

    // Si el usuario es 'manager', validar que el usuario a eliminar esté en su misma compañía
    if (accessCheck.userRole === 'manager') {
      // Un manager no puede eliminarse a sí mismo
      if (accessCheck.loggedInUserId === userId) {
        return NextResponse.json({ message: 'Un manager no puede eliminarse a sí mismo' }, { status: 403 });
      }
      
      // Un manager no puede eliminar a un admin
      if (userToDelete.role === 'admin') {
         return NextResponse.json({ message: 'Un manager no puede eliminar a un administrador' }, { status: 403 });
      }

      // Validar que ambos tengan el mismo companyId
      if (userToDelete.companyId !== accessCheck.userCompanyId) {
        return NextResponse.json({ message: 'Acceso Denegado. Solo puedes eliminar usuarios de tu misma compañía.' }, { status: 403 });
      }

      // Si las validaciones pasan, proceder con la eliminación
      await db.user.delete({ where: { userId } });
      return NextResponse.json({ message: 'Usuario eliminado exitosamente' });
    }

    // 3. Si el rol no es 'admin' ni 'manager', el acceso es denegado por defecto
    return NextResponse.json({ message: 'Acceso Denegado. No tienes permisos para esta acción.' }, { status: 403 });
  } catch (error) {
    console.error('Error eliminado el usuario:', error);
    return NextResponse.json({ message: 'Se generó un fallo al eliminar el usuario' }, { status: 500 });
  }
}