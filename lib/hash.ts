// /lib/hash.ts
import bcrypt from 'bcryptjs';

// Número de "rondas" de salting para bcrypt.
// Un valor más alto hace el hashing más lento y seguro, pero consume más recursos.
// 10-12 es un buen punto de partida para la mayoría de las aplicaciones.
const SALT_ROUNDS = 10;

/**
 * Hashea una contraseña plana usando bcrypt.
 * @param password La contraseña en texto plano a hashear.
 * @returns Una promesa que resuelve con el hash de la contraseña.
 */
export async function hashPassword(password: string): Promise<string> {
  // Genera un salt único para esta contraseña
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  // Hashea la contraseña con el salt
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

/**
 * Compara una contraseña plana con un hash bcrypt.
 * @param password La contraseña en texto plano proporcionada por el usuario.
 * @param hash El hash almacenado en la base de datos.
 * @returns Una promesa que resuelve a `true` si la contraseña coincide con el hash, `false` en caso contrario.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // Compara la contraseña con el hash. bcrypt se encarga de extraer el salt del hash.
  return bcrypt.compare(password, hash);
}