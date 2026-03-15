import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, useAuthState } from '@/hooks/useAuth';
import { UserRole } from '@/types';

import LoginPage            from '@/features/auth/LoginPage';
import AdminDashboard       from '@/features/admin/Dashboard';
import ManageVillas         from '@/features/admin/ManageVillas';
import ManageUsers          from '@/features/admin/ManageUsers';
import SetRate              from '@/features/admin/SetRate';
import AllBills             from '@/features/admin/AllBills';
import MeterForm            from '@/features/reader/MeterForm';
import ReadingHistory       from '@/features/reader/ReadingHistory';
import MyBills              from '@/features/resident/MyBills';
import AllResidentsBills    from '@/features/resident/AllResidentsBills';

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
      <Routes>
        <Route path="/"      element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Admin routes */}
        <Route path="/admin"         element={<Guard roles={['admin']}><AdminDashboard /></Guard>} />
        <Route path="/admin/villas"  element={<Guard roles={['admin']}><ManageVillas /></Guard>} />
        <Route path="/admin/users"   element={<Guard roles={['admin']}><ManageUsers /></Guard>} />
        <Route path="/admin/rates"   element={<Guard roles={['admin']}><SetRate /></Guard>} />
        <Route path="/admin/bills"   element={<Guard roles={['admin']}><AllBills /></Guard>} />

        {/* Reader routes */}
        <Route path="/reader"         element={<Guard roles={['admin', 'reader']}><MeterForm /></Guard>} />
        <Route path="/reader/history" element={<Guard roles={['admin', 'reader']}><ReadingHistory /></Guard>} />

        {/* Resident routes */}
        <Route path="/bills"     element={<Guard roles={['admin', 'resident']}><MyBills /></Guard>} />
        <Route path="/bills/all" element={<Guard roles={['admin', 'resident']}><AllResidentsBills /></Guard>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthContext.Provider>
  );
}
