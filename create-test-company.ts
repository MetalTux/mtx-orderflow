// create-test-company.ts
import { db } from './lib/db'; // Ajusta la ruta si es necesario
import { v4 as uuidv4 } from 'uuid'; // Para generar el companyId si tu modelo Company no tiene @default(uuid())

async function createTestCompany() {
  // Asegúrate de que el nombre del campo sea 'companyId' si así lo tienes en schema.prisma
  // Si tu modelo Company tiene @default(uuid()) en companyId, puedes omitir esta línea
  // y la propiedad companyId en el objeto `data`.
  const companyId = uuidv4(); // Genera un UUID para la empresa
  const companyName = 'Empresa de Prueba S.A.'; // Nombre de la empresa
  const fiscalId = '12345678-9'; // O cualquier ID fiscal que necesites
  const address = 'Calle Falsa 123';
  const city = '74d2982b-6505-11f0-bbbe-52398ef1e689';
  const isActive = true;

  try {
    const newCompany = await db.company.create({
      data: {
        companyId: companyId, // Pásale el ID generado si no tienes @default(uuid()) en schema.prisma
        companyName: companyName,
        companyRUT: fiscalId,
        addressLine1: address,
        communeId: city,
        isActive: isActive,
        // Agrega cualquier otro campo requerido (NOT NULL) por tu modelo Company en schema.prisma
        // createdAt y updatedAt se manejarán automáticamente si están configurados con @default(now()) y @updatedAt
      },
    });

    console.log('--- Empresa de prueba creada exitosamente ---');
    console.log(`Nombre: ${newCompany.companyName}`);
    console.log(`ID de Empresa: ${newCompany.companyId}`);
    console.log('---------------------------------------------');
    return newCompany.companyId; // Devuelve el ID de la empresa creada
  } catch (error) {
    console.error('Error al crear la empresa de prueba:', error);
    throw error; // Re-lanza el error para manejarlo si es necesario
  } finally {
    await db.$disconnect();
  }
}

// Llama a la función para ejecutarla
createTestCompany();