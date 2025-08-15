// context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId: string;
  // ... otros datos del usuario que quieres disponibles en el frontend
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  login: (userData: UserData) => void; // El API ya maneja las cookies, solo necesitamos los datos del usuario
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Función para obtener los datos del usuario desde el backend (validando la sesión)
  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/me'); // Llama al nuevo endpoint
      if (res.ok) {
        console.log("Entró con respuesta OK después de consultar /api/auth/me");
        const data = await res.json();
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        console.log("Indica que la sesión no es válida");
        // Sesión no válida, expira, o no hay token. Limpiar estado.
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.log("Genera un error al validar la sesión");
      console.error('Error al verificar sesión:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Simula el proceso de login (el API ya puso las cookies)
  const login = (userData: UserData) => {
    setUser(userData);
    console.log("Datos de usuario:");
    console.log(userData);
    setIsAuthenticated(true);
    router.push('/dashboard'); // Redirigir al dashboard después del login
  };

  // Simula el proceso de logout
  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }); // Llamar al API de logout
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login'); // Redirigir a la página de login
  };

  // Al cargar la aplicación o al redirigir, verifica la sesión
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]); // Se ejecuta una vez al montar y cuando fetchUserData cambia

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}