import React, { useState, useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Calculator,
  Target,
  Award,
  QrCode,
  User,
  LogOut,
  Menu,
  X,
  Leaf
} from 'lucide-react';

/**
 * Main application layout with sidebar navigation and mobile header.
 * Provides semantic HTML structure and full accessibility support.
 * @param {Object} props
 * @param {React.ReactNode} props.children - The page content
 * @returns {JSX.Element} The layout wrapper
 */
export default function Layout({ children }) {
  const { user, logout, isSimulation } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = useMemo(() => [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Calculator', path: '/calculator', icon: Calculator },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Weekly Challenges', path: '/challenges', icon: Award },
    { name: 'Bill & Receipt OCR', path: '/receipt-analysis', icon: QrCode },
    { name: 'Profile & Badges', path: '/profile', icon: User },
  ], []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }, [logout, navigate]);

  const isActive = useCallback((path) => location.pathname === path, [location.pathname]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* SIDEBAR FOR DESKTOP */}
      <aside
        className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-forest-950 text-white border-r border-forest-900 shadow-xl z-30"
        aria-label="Main sidebar"
      >
        <div className="flex items-center space-x-3 px-6 py-6 border-b border-forest-900">
          <div className="p-2 bg-eco-500 rounded-xl">
            <Leaf className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight leading-none text-emerald-400">EcoLens AI</h1>
            <p className="text-[10px] text-emerald-300/60 font-semibold uppercase tracking-wider mt-0.5">
              Carbon footprint tracker
            </p>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto" aria-label="Main navigation">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center space-x-3.5 px-4 py-3 rounded-xl font-medium transition-all duration-200 group ${
                  active
                    ? 'bg-eco-500 text-white shadow-md shadow-eco-600/10'
                    : 'text-forest-300 hover:bg-forest-900 hover:text-white'
                }`}
              >
                <IconComponent className={`h-5 w-5 ${active ? 'text-white' : 'text-forest-400 group-hover:text-emerald-400 transition-colors'}`} aria-hidden="true" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card at Bottom */}
        <div className="p-4 border-t border-forest-900 bg-forest-950/40">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-forest-900/40 border border-forest-900/30">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-white uppercase text-sm shrink-0" aria-hidden="true">
                {user?.displayName?.[0] || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold truncate">{user?.displayName}</p>
                <p className="text-[10px] text-emerald-400 font-bold tracking-wide">
                  <span aria-hidden="true">🌱</span> {user?.points || 0} PTS
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              aria-label="Log out"
              className="p-1.5 rounded-lg text-forest-400 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
            >
              <LogOut className="h-4.5 w-4.5" aria-hidden="true" />
            </button>
          </div>
          {isSimulation && (
            <div className="mt-3 text-center">
              <span className="inline-block text-[9px] font-extrabold uppercase tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                Simulation Mode
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-forest-950 text-white flex items-center justify-between px-6 shadow-md z-40" role="banner">
        <div className="flex items-center space-x-2">
          <Leaf className="h-5 w-5 text-emerald-400" aria-hidden="true" />
          <span className="font-bold text-lg tracking-tight">EcoLens AI</span>
        </div>
        <button
          onClick={toggleMobileMenu}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="p-1.5 rounded-lg text-forest-300 hover:text-white focus:outline-none"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>
      </header>

      {/* MOBILE MENU DROPDOWN */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="md:hidden fixed inset-0 top-16 bg-forest-950/95 backdrop-blur-sm z-40 flex flex-col pt-4 px-6 pb-6 text-white border-t border-forest-900"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <nav className="flex-1 space-y-2" aria-label="Mobile navigation">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={closeMobileMenu}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center space-x-4 px-5 py-3.5 rounded-xl font-medium transition-all ${
                    active ? 'bg-eco-500 text-white' : 'text-forest-300 hover:bg-forest-900'
                  }`}
                >
                  <IconComponent className="h-5 w-5" aria-hidden="true" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          <div className="pt-6 border-t border-forest-900 mt-6">
            <div className="flex items-center justify-between bg-forest-900/40 p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-white uppercase text-sm" aria-hidden="true">
                  {user?.displayName?.[0] || 'U'}
                </div>
                <div>
                  <p className="text-sm font-semibold truncate">{user?.displayName}</p>
                  <p className="text-xs text-emerald-400 font-bold"><span aria-hidden="true">🌱</span> {user?.points || 0} Points</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                aria-label="Log out"
                className="flex items-center space-x-2 text-red-400 font-medium bg-red-500/10 px-3 py-1.5 rounded-lg"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span className="text-xs">Logout</span>
              </button>
            </div>
            {isSimulation && (
              <div className="mt-4 text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">
                  Simulation Mode Active
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MAIN VIEW AREA */}
      <div className="flex-1 md:pl-64 flex flex-col pt-16 md:pt-0">
        <main id="main-content" className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}
