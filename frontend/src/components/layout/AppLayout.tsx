import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Boxes,
  Truck,
  ShoppingCart,
  Warehouse,
  Trash2,
  TrendingDown,
  BarChart3,
  Users,
  LogOut,
  ChevronDown,
  Building2,
  HardHat,
  Menu,
  X,
  Plus,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import { StatusBadge } from '../common/StatusBadge';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { projects, selectedProjectId, setSelectedProjectId } = useProject();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Executive Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects Hub', path: '/projects', icon: FolderKanban },
    { label: 'Material Catalog', path: '/materials', icon: Boxes },
    { label: 'Supplier Directory', path: '/suppliers', icon: Truck },
    { label: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingCart },
    { label: 'Inventory Stock', path: '/inventory', icon: Warehouse },
    { label: 'Waste Incidents', path: '/waste', icon: Trash2 },
    { label: 'Plan vs Actual', path: '/consumption', icon: TrendingDown },
    { label: 'Intelligence & EOQ', path: '/analytics', icon: BarChart3 },
    { label: 'Operations Reports', path: '/reports', icon: FileText },
    ...(user?.role === 'admin'
      ? [{ label: 'User RBAC', path: '/users', icon: Users }]
      : []),
  ];

  return (
    <div className="flex h-screen bg-[#090d16] text-slate-100 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <HardHat className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading text-lg font-black tracking-tight text-white">
                  Con<span className="text-amber-500">.AI</span>
                </span>
                <span className="rounded bg-amber-500/20 px-1 py-0.5 text-[9px] font-bold text-amber-400">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                Material Intelligence
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Global Active Project Context Display */}
        <div className="p-4 border-b border-slate-800/80">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 mb-1.5">
            <Building2 className="h-3.5 w-3.5 text-amber-500" />
            Active Site Scope
          </label>
          <div className="relative">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-800 bg-slate-900/90 py-2 pl-3 pr-8 text-xs font-semibold text-slate-200 outline-none hover:border-slate-700 focus:border-amber-500 transition-colors"
            >
              <option value="all">⚡ All Projects (Global)</option>
              {projects.map((proj) => (
                <option key={proj._id} value={proj._id}>
                  {proj.code} - {proj.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-500/10'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                }`
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Card in Sidebar footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/60 p-2.5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-xs font-bold text-amber-400 border border-amber-500/30">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <p className="truncate text-xs font-bold text-white">
                  {user?.name || 'Guest User'}
                </p>
                <div className="mt-0.5">
                  <StatusBadge status={user?.role || 'user'} size="sm" />
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-950/50 hover:text-rose-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-800/80 bg-slate-950/60 px-4 lg:px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-slate-800 p-2 text-slate-400 hover:bg-slate-900 hover:text-white lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs text-slate-400">Current Scope: </span>
              <span className="text-xs font-bold text-amber-400">
                {selectedProjectId === 'all'
                  ? 'All Projects (Consolidated View)'
                  : projects.find((p) => p._id === selectedProjectId)?.name || 'Project'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Actions */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => navigate('/purchase-orders')}
                className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                New PO
              </button>
              <button
                onClick={() => navigate('/inventory')}
                className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Issue Material
              </button>
              <button
                onClick={() => navigate('/waste')}
                className="flex items-center gap-1.5 rounded-xl border border-rose-950/60 bg-rose-950/30 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-950/50 transition-colors"
              >
                Report Waste
              </button>
            </div>

            {/* Authenticated user menu */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700"
              >
                <span>Role: <strong className="text-white capitalize">{user?.role}</strong></span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <div className="mt-2 border-t border-slate-800 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/40"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#090d16]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
