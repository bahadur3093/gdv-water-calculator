import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface NavLink {
  label: string;
  to: string;
}

interface PageShellProps {
  title: string;
  navLinks: NavLink[];
  children: React.ReactNode;
}

export default function PageShell({
  title,
  navLinks,
  children,
}: PageShellProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userPopoverOpen, setUserPopoverOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo + title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">GDV</span>
              </div>
            </div>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    location.pathname === link.to
                      ? "bg-brand-50 text-brand-600 font-medium"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">

              {/* User popover trigger */}
              <button
                onClick={() => {
                  setUserPopoverOpen(!userPopoverOpen);
                  setMenuOpen(false);
                }}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M4 21v-2a4 4 0 0 1 3-3.87"></path>
                  <path d="M16 3.13a4 4 0 1 1-8 0"></path>
                </svg>
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => {
                  setMenuOpen(!menuOpen);
                  setUserPopoverOpen(false);
                }}
                className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              >
                {menuOpen ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 12h18M3 6h18M3 18h18" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-2 absolute top-full left-0 right-0 border-b z-50">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    location.pathname === link.to
                      ? "bg-brand-50 text-brand-600 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {userPopoverOpen && (
          <div className="absolute top-14 right-4 z-50 w-64 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
            <p className="text-md font-semibold text-gray-800">
              {user?.name ?? "Guest User"}
            </p>
            <p className="text-xs text-gray-500">
              {user?.email ?? "No email available"}
            </p>
            {user?.villa?.villaNumber ? (
              <p className="text-xs text-gray-500">
                Villa: {user.villa.villaNumber}
              </p>
            ) : user?.villaId ? (
              <p className="text-xs text-gray-500">Villa ID: {user.villaId}</p>
            ) : null}
            <button
              onClick={logout}
              className="mt-2 w-full rounded-md bg-red-50 px-2 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* Page content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">{children}</main>
    </div>
  );
}
