// components/AuthLayout.tsx
'use client'; // ¡IMPORTANTE: Este es un componente de cliente!

import React, { ReactNode, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext'; // Importamos nuestro hook de AuthContext
import { useRouter, usePathname } from 'next/navigation'; // Para redirección y obtener la ruta actual
import Sidebar from '@/components/Sidebar';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { isAuthenticated, user, loading, logout } = useAuth(); // Obtenemos el estado de autenticación y las funciones
  const router = useRouter();
  const pathname = usePathname(); // Para verificar la ruta actual

  // Ancho del menú lateral (la misma configuración que tenías)
  const sidebarWidth = '250px';

  // Efecto para manejar redirecciones si el usuario no está autenticado
  useEffect(() => {
    // Si no estamos cargando, no estamos autenticados, y la ruta actual NO es '/login'
    // (para evitar redirigir infinitamente cuando ya estamos en el login)
    if (!loading && !isAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
  }, [isAuthenticated, loading, pathname, router]);

  // Si la aplicación está cargando el estado de autenticación (ej. al inicio, llamando a /api/auth/me)
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Cargando sesión...</p>
      </div>
    );
  }

  // Si el usuario NO está autenticado (y ya terminó de cargar),
  // y la ruta actual no es '/login', no renderizamos el layout protegido.
  // El useEffect ya se habrá encargado de la redirección a /login.
  if (!isAuthenticated && pathname !== '/login') {
    return null; // O podrías retornar un div vacío si prefieres
  }

  // Si el usuario está autenticado, o si estamos en la página de login (en este caso no debería usarse este layout),
  // renderizamos el layout completo con el sidebar.
  // IMPORTANTE: Este AuthLayout SOLO DEBE USARSE EN LAS RUTAS PROTEGIDAS, NO EN LA PÁGINA /login.
  return (
    <div className="flex h-screen"> {/* Contenedor principal del layout */}
      {/* Acá va el Sidebar nuevo */}
      <Sidebar user={user} onLogout={logout} /> {/* <-- ¡Aquí usamos nuestro Sidebar! Le pasamos el usuario y la función de logout */}
      {/* Contenido Principal de la aplicación */}
      <main className="flex-grow overflow-y-auto bg-gray-100">
        {children} {/* Aquí se renderizarán las páginas protegidas (dashboard, users, etc.) */}
      </main>
    </div>
  );
}

// {/* Sidebar de Syncfusion */}
//       <SidebarComponent
//         width={sidebarWidth}
//         isOpen={true} // Puedes controlar esto con un estado si quieres que sea colapsable
//         enableDock={false}
//         showBackdrop={false}
//         type="Push"
//         className="e-sidebar-outer-shadow" // Clases Tailwind para estilos de sombra
//       >
//         {/* Contenido del Sidebar */}
//         <div className="p-4 bg-gray-800 text-white h-full flex flex-col">
//           <h2 className="text-2xl font-bold mb-6 text-blue-400">OrderFlow</h2>
//           <nav className="flex-grow">
//             <ul>
//               <li className="mb-2">
//                 <a href="/dashboard" className="block p-2 rounded hover:bg-gray-700 transition-colors">
//                   Dashboard
//                 </a>
//               </li>
//               <li className="mb-2">
//                 <a href="/users" className="block p-2 rounded hover:bg-gray-700 transition-colors">
//                   Usuarios
//                 </a>
//               </li>
//               <li className="mb-2">
//                 <a href="/companies" className="block p-2 rounded hover:bg-gray-700 transition-colors">
//                   Empresas
//                 </a>
//               </li>
//               {/* Ejemplo de menú condicional por rol */}
//               {user?.role === 'admin' && ( // Solo visible para usuarios con rol 'admin'
//                 <li className="mb-2">
//                   <a href="/admin" className="block p-2 rounded hover:bg-gray-700 transition-colors">
//                     Panel Admin
//                   </a>
//                 </li>
//               )}
//               {/* Añade más elementos de menú aquí, puedes usar 'user?.role' para personalizarlos */}
//             </ul>
//           </nav>
//           <div className="mt-auto pt-4 border-t border-gray-700 text-sm text-gray-400">
//             {user && <p>Usuario: {user.name} ({user.role})</p>} {/* Muestra el nombre y rol */}
//             <p>Versión 1.0.0</p>
//             <button
//               onClick={logout} // Botón para cerrar sesión
//               className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
//             >
//               Cerrar Sesión
//             </button>
//           </div>
//         </div>
//       </SidebarComponent>