// app/(app)/layout.tsx
// NOTA: Este es un Server Component por defecto, lo cual es la práctica recomendada.
import AuthLayout from '@/components/AuthLayout'; // Importamos nuestro AuthLayout

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthLayout>
      {children} {/* AuthLayout recibirá el contenido de /dashboard/page.tsx, /users/page.tsx, etc. */}
    </AuthLayout>
  );
}