// components/LoginForm.tsx
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext'; // <-- ¡Importamos nuestro hook de autenticación!

export default function LoginForm() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth(); // <-- Obtenemos la función 'login' de nuestro AuthContext

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Si el login fue exitoso (status 200)
        console.log('Inicio de sesión exitoso:', data);
        // El servidor ya debería haber establecido las cookies seguras (httpOnly).
        // Ahora, llamamos a la función 'login' de nuestro AuthContext.
        // El AuthContext actualizará el estado global y luego redirigirá al dashboard.
        login(data.user); // <-- Pasamos los datos del usuario al AuthContext

        // Ya no necesitamos 'router.push('/dashboard')' ni 'router.refresh()' aquí,
        // porque el 'login' del AuthContext maneja la redirección.

      } else {
        // Si hay un error (ej. 401 Unauthorized, 400 Bad Request)
        setError(data.message || 'Error en el inicio de sesión. Credenciales inválidas.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error de red o inesperado:', err);
      setError('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.');
      setLoading(false);
    }
  };

  return (
    // Contenedor principal: Cambia el fondo de la pantalla
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950"> {/* AÑADIDO dark:bg-gray-950 */}
      {/* Contenedor del formulario (el "card") */}
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-200 dark:bg-gray-800 dark:border-gray-700"> {/* AÑADIDO dark:bg-gray-800 dark:border-gray-700 */}
        {/* Título */}
        <h2 className="text-3xl font-extrabold text-center mb-8 text-gray-900 dark:text-white">Iniciar Sesión</h2> {/* AÑADIDO dark:text-white */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 dark:bg-red-900 dark:border-red-700 dark:text-red-200" role="alert"> {/* AÑADIDO dark: clases para error */}
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            {/* Label del Email */}
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Correo Electrónico</label> {/* AÑADIDO dark:text-gray-300 */}
            {/* Input del Email */}
            <input
              type="email"
              id="email"
              placeholder="tu@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              name="email"
              required
            />
          </div>
          <div className="mb-6">
            {/* Label de la Contraseña */}
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Contraseña</label> {/* AÑADIDO dark:text-gray-300 */}
            {/* Input de la Contraseña */}
            <input
              type="password"
              id="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              name="password"
              required
            />
          </div>
          {/* Botón de Submit */}
          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-md text-white font-semibold text-lg transition-colors duration-200 ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            } dark:bg-blue-700 dark:hover:bg-blue-800 dark:focus:ring-blue-600 ${loading ? 'dark:bg-blue-500' : ''}`}
            disabled={loading}
          >
            {loading ? 'Iniciando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}