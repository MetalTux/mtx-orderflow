// components/Sidebar.tsx
'use client'; // ¡Importante! Este componente es interactivo y necesita ser un Client Component.

import React from 'react';
import Link from 'next/link'; // Usamos Link de Next.js para una navegación optimizada
import { usePathname } from 'next/navigation'; // Para resaltar el enlace activo

interface SidebarProps {
  // Propiedades que el AuthLayout le pasará al Sidebar
  user: { name: string; role: string } | null; // Información del usuario en sesión
  onLogout: () => void; // Función para cerrar sesión
}

export default function Sidebar({ user, onLogout }: SidebarProps) {
  const pathname = usePathname(); // Hook para obtener la ruta actual y resaltar el enlace activo

  // Función auxiliar para determinar si un enlace está activo
  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col h-full shadow-lg">
      {/* Encabezado del Sidebar - Logo/Título de la aplicación */}
      <div className="p-4 bg-gray-900 text-blue-400 font-extrabold text-2xl border-b border-gray-700">
        OrderFlow
      </div>

      {/* Sección de Navegación Principal */}
      <nav className="flex-grow p-4">
        <ul>
          <li className="mb-2">
            <Link
              href="/dashboard"
              className={`
                block p-2 rounded-md transition-colors duration-200
                ${isActive('/dashboard') ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-200'}
              `}
            >
              Dashboard
            </Link>
          </li>
          <li className="mb-2">
            <Link
              href="/users"
              className={`
                block p-2 rounded-md transition-colors duration-200
                ${isActive('/users') ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-200'}
              `}
            >
              Usuarios
            </Link>
          </li>
          <li className="mb-2">
            <Link
              href="/companies"
              className={`
                block p-2 rounded-md transition-colors duration-200
                ${isActive('/companies') ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-200'}
              `}
            >
              Empresas
            </Link>
          </li>
          {/* Ejemplo de enlace condicional para roles (si tu 'user' tiene un rol) */}
          {user?.role === 'admin' && ( // Asumiendo que el objeto 'user' tiene una propiedad 'role'
            <li className="mb-2">
              <Link
                href="/admin"
                className={`
                  block p-2 rounded-md transition-colors duration-200
                  ${isActive('/admin') ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-200'}
                `}
              >
                Panel Admin
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* Sección de Información de Usuario y Cerrar Sesión */}
      <div className="mt-auto p-4 border-t border-gray-700 text-sm text-gray-400">
        {user ? ( // Mostrar información del usuario si está logueado
          <div className="mb-4">
            <p className="font-semibold text-gray-200">Bienvenido,</p>
            <p className="text-lg text-white">{user.name}</p>
            {user.role && <p className="text-xs text-gray-400">Rol: {user.role}</p>}
          </div>
        ) : (
          <p className="mb-4">Cargando información del usuario...</p>
        )}

        <button
          onClick={onLogout} // Llama a la función onLogout pasada por prop
          className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}