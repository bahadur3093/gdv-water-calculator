import AppRoutes from '@/routes';

import { AuthContext, useAuthState } from '@/hooks/useAuth';
import { UserRole } from './types';
import { Navigate } from 'react-router-dom';

// Protects a route — redirects to /login if not authenticated
// Redirects to / if authenticated but wrong role
const Guard = ({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles: UserRole[];
}) => {
  const { user, isLoading } = useAuthState();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-400">
        Loading…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// Redirect from / based on role
const RootRedirect = () => {
  const { user, isLoading } = useAuthState();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin')    return <Navigate to="/admin" replace />;
  if (user.role === 'reader')   return <Navigate to="/reader" replace />;
  return <Navigate to="/bills" replace />;
};

export default function App() {
  const auth = useAuthState();

  return (
    <AuthContext.Provider value={auth}>
      <AppRoutes />
    </AuthContext.Provider>
  );
}
