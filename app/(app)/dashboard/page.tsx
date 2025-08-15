// app/dashboard/page.tsx
import React from 'react';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50 text-gray-800">
      <h1 className="text-5xl font-extrabold text-blue-600 mb-4">
        ¡Bienvenido al Dashboard!
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Has iniciado sesión exitosamente.
      </p>
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg text-center">
        <p className="text-lg">
          Aquí es donde empezaremos a construir todas las funcionalidades principales de tu aplicación.
        </p>
        <p className="mt-4 text-sm text-gray-500">
          (Esta es solo una página de ejemplo. La funcionalidad real se construirá pronto).
        </p>
      </div>
    </div>
  );
}