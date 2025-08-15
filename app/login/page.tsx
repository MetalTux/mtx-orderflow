// app/login/page.tsx
'use client'; // <-- ¡IMPORTANTE: Esta página es un cliente!

import React, { useEffect } from 'react';
//import LoginForm from '@/components/LoginForm'; // Importamos tu LoginForm
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext'; // <-- Importamos nuestro hook de autenticación
import { useRouter } from 'next/navigation'; // Para la redirección del lado del cliente

const DynamicLoginForm = dynamic(() => import('@/components/LoginForm'), {
  ssr: false, //Esto indica que sólo renderiza en el Cliente
  loading: () => (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <p className="text-xl text-gray-700">Cargando formulario...</p>
    </div>
  ),
});

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth(); // Obtenemos el estado de autenticación
  const router = useRouter(); // Instancia del router de Next.js

  // Mover la lógica de redirección a un useEffect
  useEffect(() => {
    // Solo si no estamos cargando y el usuario ya está autenticado
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]); // Dependencias del efecto

  // Si aún estamos cargando la sesión (AuthContext está verificando /api/auth/me)
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Verificando sesión...</p>
      </div>
    );
  }

  // Si no está autenticado, mostrar el formulario de login
  return (
    <DynamicLoginForm />
  );
}

/*
<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <LoginForm /> 
    </div>
*/