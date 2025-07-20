// create-test-user.ts
import { db } from './lib/db'; // Ajusta la ruta si es necesario
import { hashPassword } from './lib/hash'; // Ajusta la ruta si es necesario

async function createTestUser() {
  const email = 'jrios.03@hotmail.com'; // Puedes cambiar el email
  const rawPassword = '@Password123*'; // ¡Cambia esta contraseña por una segura para tu prueba!
  const userName = 'Juan Rios';
  const companyId = '183ea525-591d-470f-b79f-c0091134c11c'; // ¡Asegúrate de que esto exista en tu tabla Company o ajusta tu schema!
  const role = 'admin'; // O 'admin', 'guest', etc., según tus roles definidos

  try {
    // 1. Hashear la contraseña
    const hashedPassword = await hashPassword(rawPassword);

    // 2. Crear el usuario en la base de datos usando Prisma
    const newUser = await db.user.create({
      data: {
        // Asegúrate de que los nombres de los campos coincidan exactamente con tu modelo User en schema.prisma
        userEmail: email,
        userName: userName,
        userPassword: hashedPassword,
        companyId: companyId, // Si tu campo es `companyId`
        role: role, // Si tu campo es `role`
        isActive: true, // Si tienes un campo para habilitar/deshabilitar
        // Añade aquí cualquier otro campo NO NULL que tu modelo User requiera
      },
    });

    console.log('--- Usuario de prueba creado exitosamente ---');
    console.log(`Email: ${newUser.userEmail}`);
    console.log(`Nombre: ${newUser.userName}`);
    console.log(`ID de Usuario: ${newUser.userId}`);
    console.log('---------------------------------------------');

  } catch (error) {
    console.error('Error al crear el usuario de prueba:', error);
    // Si hay un error, a menudo es por un email duplicado o por campos NOT NULL faltantes.
  } finally {
    await db.$disconnect(); // Desconecta Prisma de la base de datos
  }
}

createTestUser();