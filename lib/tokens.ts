// /lib/tokens.ts
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid'; // Para generar IDs únicos para los tokens

// --- Variables de Entorno (Secrets) ---
// Es CRUCIAL que estas variables estén definidas en tu archivo .env.local
// JWT_ACCESS_SECRET: Una clave secreta MUY segura para firmar los Access Tokens.
// JWT_REFRESH_SECRET: Una clave secreta MUY segura para firmar los Refresh Tokens.
// Genera claves largas y aleatorias. Ejemplo: openssl rand -base64 64

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your_access_secret_fallback';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_fallback';

if (JWT_ACCESS_SECRET === 'your_access_secret_fallback') {
  console.warn('ADVERTENCIA: JWT_ACCESS_SECRET no está configurado en tus variables de entorno. Usando un fallback. ¡Configúralo para producción!');
}
if (JWT_REFRESH_SECRET === 'your_refresh_secret_fallback') {
  console.warn('ADVERTENCIA: JWT_REFRESH_SECRET no está configurado en tus variables de entorno. Usando un fallback. ¡Configúralo para producción!');
}

// --- Interfaz para los Payloads de los Tokens ---
// Define la estructura de los datos que guardaremos en el Access Token
export interface AccessTokenPayload {
  userId: string;
  userName: string;
  userEmail: string;
  companyId: string;
  role: string;
  // Otros datos relevantes del usuario que no sean sensibles
}

// Define la estructura de los datos para el Refresh Token (principalmente el userId y JTI)
export interface RefreshTokenPayload extends jwt.JwtPayload {
  userId: string;
  jti?: string; // JWT ID, usado como sessionId para invalidación
}

// --- Funciones para Generar Tokens ---

/**
 * Genera un Access Token JWT.
 * Contiene datos del usuario, expira rápidamente.
 */
export function generateAccessToken(payload: AccessTokenPayload): string {
  // El Access Token debería tener una vida útil corta (ej. 15 minutos, 1 hora)
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: '1h' });
}

/**
 * Genera un Refresh Token JWT.
 * Contiene el userId y un JTI (UUID) para identificar la sesión, expira más tarde.
 */
export function generateRefreshToken(userId: string): string {
  const jti = uuidv4(); // Genera un UUID único para este token, servirá como Session ID
  const payload: RefreshTokenPayload = {
    userId: userId,
    jti: jti,
  };
  // El Refresh Token debería tener una vida útil más larga (ej. 7 días, 30 días)
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' }); //, jwtid: jti });
}

// --- Funciones para Verificar Tokens ---

/**
 * Verifica y decodifica un Access Token.
 */
export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as AccessTokenPayload;
    return decoded;
  } catch (error) {
    console.error('Error verifying access token:', error);
    return null;
  }
}

/**
 * Verifica y decodifica un Refresh Token.
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
    return decoded;
  } catch (error) {
    console.error('Error verifying refresh token:', error);
    return null;
  }
}