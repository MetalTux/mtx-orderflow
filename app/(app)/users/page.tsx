// app/(app)/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import UsersTable from '@/components/Users/UsersTable';
import UserForm from '@/components/Users/UserForm';
import Modal from '@/components/Modal';

// Definición de tipos para los datos de usuario
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

export default function UsersPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Redirigir si el usuario no tiene los permisos necesarios
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'manager'))) {
      router.push('/dashboard');
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Obtener los datos de los usuarios desde la API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Fallo al cargar los usuarios.');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Error desconocido.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  // Manejar el borrado de usuarios
  const handleDeleteUser = async (userId: string) => {
    const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar este usuario?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Fallo al eliminar el usuario.');
      }

      // Actualizar la lista de usuarios después de la eliminación exitosa
      setUsers(users.filter(u => u.userId !== userId));
      alert('Usuario eliminado exitosamente.');
    } catch (err: any) {
      console.error('Error deleting user:', err);
      alert(err.message || 'Error desconocido al eliminar.');
    }
  };

  const handleSuccess = async () => {
    alert('Usuario creado exitosamente.');
    setShowForm(false); // Oculta el formulario
    await fetchUsers(); // Refresca la lista de usuarios
  };

  const handleCancel = () => {
    setShowForm(false); // Oculta el formulario
  };

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full text-red-500">
        <p>{error}</p>
      </div>
    );
  }
  
  // Renderizar la tabla con los datos
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
        >
          Crear Usuario
        </button>
      </div>
      <UsersTable 
        users={users} 
        onEdit={() => {}} 
        onDelete={handleDeleteUser} 
        userRole={user?.role || ''} 
        />
      
      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <UserForm onCancel={handleCancel} onSuccess={handleSuccess} />
        </Modal>
      )}
    </div>
  );
}