// /lib/sessions.ts

import { db } from '@/lib/db'; // Importamos la instancia de PrismaClient
import { RefreshTokenPayload, verifyRefreshToken } from '@/lib/tokens'; // Necesitamos esto para verificar el token de refresco

// Define una interfaz para los datos de la sesión que guardaremos
export interface UserSessionData {
  userId: string;
  refreshToken: string; // El Refresh Token completo, lo guardaremos para revocarlo
  ipAddress?: string | null; // Opcional: Dirección IP desde donde se inició la sesión
  userAgent?: string | null; // Opcional: User-Agent del navegador/cliente
}

/**
 * Guarda una nueva sesión de usuario en la base de datos.
 * Esto ocurre después de un login exitoso.
 * @param sessionData Datos de la sesión a guardar.
 * @returns La sesión de usuario creada en la base de datos.
 */
export async function saveUserSession(sessionData: UserSessionData) {
  try {
    const { userId, refreshToken, ipAddress, userAgent } = sessionData;

    // Primero, intenta decodificar el refreshToken para obtener el JTI (sessionId)
    const decodedToken = verifyRefreshToken(refreshToken);
    if (!decodedToken || !decodedToken.jti) {
      console.error('Error: Refresh token inválido o sin JTI (sessionId)');
      throw new Error('Invalid refresh token for session creation');
    }

    const sessionId = decodedToken.jti; // El JTI del Refresh Token es nuestro sessionId

    // Guarda la sesión en la tabla 'UserSession' de tu base de datos
    const userSession = await db.userSession.create({
      data: {
        sessionId: sessionId, // Usa el JTI como ID único de la sesión
        userId: userId,
        refreshToken: refreshToken,
        ipAddress: ipAddress,
        userAgent: userAgent,
        // Estas propiedades son gestionadas por la DB (createdAt, expiresAt)
        // Puedes agregar más campos si tu modelo UserSession los tiene (ej. deviceType, location)
      },
    });
    console.log(`Sesión de usuario ${userId} guardada con ID: ${userSession.sessionId}`);
    return userSession;
  } catch (error) {
    console.error('Error al guardar la sesión de usuario:', error);
    throw new Error('Failed to save user session');
  }
}

/**
 * Busca una sesión de usuario por su Refresh Token.
 * Utilizado para validar el token de refresco y potencialmente generar un nuevo Access Token.
 * @param refreshToken El token de refresco a buscar.
 * @returns La sesión de usuario si se encuentra y es válida, de lo contrario, null.
 */
export async function findSessionByRefreshToken(refreshToken: string) {
  try {
    const decodedToken = verifyRefreshToken(refreshToken);

    // Si el token no es válido o no tiene un JTI, no hay sesión válida
    if (!decodedToken || !decodedToken.jti) {
      return null;
    }

    const sessionId = decodedToken.jti;

    // Busca la sesión por su ID (JTI) y que el refreshToken coincida
    // Asegúrate de que tu modelo 'UserSession' tenga 'id' como un campo único y 'refreshToken'
    const userSession = await db.userSession.findUnique({
      where: {
        sessionId: sessionId, // Busca por el JTI (ID de sesión)
        refreshToken: refreshToken, // Opcional: Comprueba que el token completo coincide
        // Puedes añadir aquí una condición para que 'expiresAt' sea mayor que la fecha actual,
        // si tu modelo UserSession tiene un campo expiresAt y lo manejas manualmente.
        // Prisma Client ya tiene validación de expiración si usas el tipo DateTime y lo configuras.
      },
    });

    if (!userSession) {
      console.log(`Sesión con ID ${sessionId} o Refresh Token no encontrada.`);
      return null;
    }

    // Aquí podrías añadir lógica para verificar si la sesión ha expirado si tu modelo tiene un campo `expiresAt`
    // y no te confías solo del `expiresIn` del JWT.
    // Ejemplo: if (userSession.expiresAt && userSession.expiresAt < new Date()) { return null; }

    return userSession;
  } catch (error) {
    console.error('Error al buscar sesión por refresh token:', error);
    return null;
  }
}

/**
 * Revoca una sesión de usuario (la elimina de la base de datos).
 * Esto se usa durante el logout o cuando un token de refresco es detectado como inválido.
 * @param refreshToken El token de refresco de la sesión a revocar.
 * @returns `true` si la sesión fue revocada exitosamente, `false` en caso contrario.
 */
export async function revokeSession(refreshToken: string) {
  try {
    const decodedToken = verifyRefreshToken(refreshToken);

    if (!decodedToken || !decodedToken.jti) {
      console.warn('Intento de revocar un refresh token inválido o sin JTI.');
      return false; // No se puede revocar si no es un token válido o no tiene JTI
    }

    const sessionId = decodedToken.jti;

    // Elimina la sesión de la base de datos
    const result = await db.userSession.deleteMany({
      where: {
        sessionId: sessionId,
        refreshToken: refreshToken, // Asegúrate de que el token completo también coincida
      },
    });

    if (result.count > 0) {
      console.log(`Sesión con ID ${sessionId} revocada exitosamente.`);
      return true;
    } else {
      console.log(`Sesión con ID ${sessionId} o Refresh Token no encontrada para revocar.`);
      return false;
    }
  } catch (error) {
    console.error('Error al revocar la sesión de usuario:', error);
    return false;
  }
}