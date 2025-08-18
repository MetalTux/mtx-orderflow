// components/Users/UsersTable.tsx
import React from 'react';

interface User {
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  isActive: boolean;
  company: {
    companyName: string;
  } | null;
}

interface UsersTableProps {
  users: User[];
  onEdit: (userId: string) => void;
  onDelete: (userId: string) => void;
  userRole: string;
}

export default function UsersTable({ users, onEdit, onDelete, userRole }: UsersTableProps) {
  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead className="bg-gray-200 dark:bg-gray-700">
          <tr>
            <th className="py-2 px-4 border-b dark:border-gray-600 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Nombre</th>
            <th className="py-2 px-4 border-b dark:border-gray-600 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
            <th className="py-2 px-4 border-b dark:border-gray-600 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Compañía</th>
            <th className="py-2 px-4 border-b dark:border-gray-600 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Rol</th>
            <th className="py-2 px-4 border-b dark:border-gray-600 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Activo</th>
            <th className="py-2 px-4 border-b dark:border-gray-600 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.userId} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900">
              <td className="py-2 px-4 dark:text-gray-200">{user.userName}</td>
              <td className="py-2 px-4 dark:text-gray-200">{user.userEmail}</td>
              <td className="py-2 px-4 dark:text-gray-200">
                {user.company ? user.company.companyName : 'N/A'}
              </td>
              <td className="py-2 px-4 dark:text-gray-200">{user.role}</td>
              <td className="py-2 px-4 dark:text-gray-200">{user.isActive ? 'Sí' : 'No'}</td>
              <td className="py-2 px-4 flex justify-end space-x-2">
                <button
                  onClick={() => onEdit(user.userId)}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md text-sm transition-colors dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(user.userId)}
                  className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm transition-colors dark:bg-red-600 dark:hover:bg-red-700"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}