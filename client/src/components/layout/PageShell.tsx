import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface NavLink {
  label: string;
  to: string;
}

interface PageShellProps {
  title: string;
  navLinks: NavLink[];
  children: React.ReactNode;
}

export default function PageShell({ title, navLinks, children }: PageShellProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-0 flex items-stretch">
        <div className="flex items-center gap-6 flex-1">
          <span className="font-semibold text-gray-900 py-4 mr-2">{title}</span>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm py-4 border-b-2 transition-colors ${
                location.pathname === link.to
                  ? 'border-brand-600 text-brand-600 font-medium'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user?.name}</span>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors py-4"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Page content */}
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
