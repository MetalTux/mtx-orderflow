'use client';

import React, { useState } from 'react';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { useRouter } from 'next/navigation'; // Para redirección

export default function LoginForm() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter(); // Instancia del router de Next.js

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Previene el comportamiento por defecto del formulario

    setError(null); // Limpia errores previos
    setLoading(true); // Activa el estado de carga

    try {
      // Realiza la llamada a tu API Route para el login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json(); // Parsea la respuesta JSON

      if (response.ok) {
        // Si el login fue exitoso (status 200)
        console.log('Inicio de sesión exitoso:', data);
        // El servidor ya debería haber establecido las cookies seguras.
        router.push('/dashboard'); // Redirige al usuario al dashboard
        router.refresh(); // Opcional: Refresca el router para recargar datos de Server Components
      } else {
        // Si hay un error (ej. 401 Unauthorized, 400 Bad Request)
        setError(data.message || 'Error en el inicio de sesión. Credenciales inválidas.');
      }
    } catch (err) {
      // Manejo de errores de red o inesperados
      console.error('Error de red o inesperado:', err);
      setError('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false); // Desactiva el estado de carga
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Iniciar Sesión</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <TextBoxComponent
              type="email"
              placeholder="Correo Electrónico"
              value={email}
              change={(args: any) => setEmail(args.value)}
              floatLabelType="Auto"
              cssClass="e-outline"
              htmlAttributes={{ name: 'email', required: 'true' }}
            />
          </div>
          <div className="mb-6">
            <TextBoxComponent
              type="password"
              placeholder="Contraseña"
              value={password}
              change={(args: any) => setPassword(args.value)}
              floatLabelType="Auto"
              cssClass="e-outline"
              htmlAttributes={{ name: 'password', required: 'true' }}
            />
          </div>
          <ButtonComponent
            type="submit"
            cssClass="e-primary w-full py-2 rounded text-lg font-semibold"
            disabled={loading}
          >
            {loading ? 'Iniciando...' : 'Entrar'}
          </ButtonComponent>
        </form>
      </div>
    </div>
  );
}