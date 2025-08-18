// components/Users/UserForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Company {
  companyId: string;
  companyName: string;
}

interface UserFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export default function UserForm({ onCancel, onSuccess }: UserFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    userPassword: '',
    role: '',
    companyId: user?.companyId || '',
    isActive: true,
  });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Definir las opciones de rol según el usuario en sesión
  const roleOptions = user?.role === 'admin'
    ? ['manager', 'controller', 'employee']
    : ['controller', 'employee'];

  // Cargar las compañías si el usuario es 'admin'
  useEffect(() => {
    if (user?.role === 'admin') {
      const fetchCompanies = async () => {
        setLoadingCompanies(true);
        try {
          const response = await fetch('/api/companies/combo'); // Asumo que tienes un API de compañías
          if (!response.ok) {
            throw new Error('Fallo al cargar las compañías.');
          }
          const data = await response.json();
          setCompanies(data);
          // Establecer la primera compañía como valor por defecto si no hay una seleccionada
          if (data.length > 0 && !formData.companyId) {
            setFormData(prev => ({ ...prev, companyId: data[0].companyId }));
          }
        } catch (err: any) {
          setError(err.message || 'Error al cargar las compañías.');
        } finally {
          setLoadingCompanies(false);
        }
      };
      fetchCompanies();
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    setFormData(prev => ({
      ...prev,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validación básica de campos
    if (!formData.userName || !formData.userEmail || !formData.userPassword || !formData.role) {
      setError('Por favor, completa todos los campos obligatorios.');
      return;
    }

    // La lógica de la API de creación de usuario
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el usuario.');
      }

      onSuccess(); // Llamar a la función de éxito para cerrar el modal y refrescar la lista
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al procesar la solicitud.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Crear Nuevo Usuario</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      {/* Campo de Email */}
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300">Email</label>
        <input
          type="email"
          name="userEmail"
          value={formData.userEmail}
          onChange={handleChange}
          className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-200"
          required
        />
      </div>
      
      {/* Campo de Nombre */}
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300">Nombre de Usuario</label>
        <input
          type="text"
          name="userName"
          value={formData.userName}
          onChange={handleChange}
          className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-200"
          required
        />
      </div>
      
      {/* Campo de Contraseña */}
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300">Contraseña</label>
        <input
          type="password"
          name="userPassword"
          value={formData.userPassword}
          onChange={handleChange}
          className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-200"
          required
        />
      </div>

      {/* Campo de Selección de Compañía (solo para 'admin') */}
      {user?.role === 'admin' && (
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300">Compañía</label>
          {loadingCompanies ? (
            <p>Cargando compañías...</p>
          ) : (
            <select
              name="companyId"
              value={formData.companyId}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-200"
              required
            >
              <option value="">Selecciona una compañía</option>
              {companies.map(c => (
                <option key={c.companyId} value={c.companyId}>
                  {c.companyName}
                </option>
              ))}
            </select>
          )}
        </div>
      )}
      
      {/* Campo de Selección de Rol */}
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300">Rol</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="mt-1 p-2 w-full border rounded-md dark:bg-gray-700 dark:text-gray-200"
          required
        >
          <option value="">Selecciona un rol</option>
          {roleOptions.map(r => (
            <option key={r} value={r}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-700 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Crear Usuario
        </button>
      </div>
    </form>
  );
}