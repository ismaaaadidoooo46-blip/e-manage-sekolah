import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  School, 
  CalendarCheck, 
  FileText, 
  BarChart3,
  LogOut,
  Menu,
  ShieldCheck
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['OPERATOR', 'KEPALA_SEKOLAH', 'GURU', 'SISWA'] },
    { name: 'Manajemen Pengguna', path: '/dashboard/users', icon: ShieldCheck, roles: ['OPERATOR'] },
    { name: 'Data Siswa', path: '/dashboard/siswa', icon: GraduationCap, roles: ['OPERATOR', 'GURU', 'KEPALA_SEKOLAH'] },
    { name: 'Data Guru', path: '/dashboard/guru', icon: Users, roles: ['OPERATOR', 'KEPALA_SEKOLAH'] },
    { name: 'Manajemen Kelas', path: '/dashboard/kelas', icon: School, roles: ['OPERATOR'] },
    { name: 'Absensi', path: '/dashboard/absensi', icon: CalendarCheck, roles: ['OPERATOR', 'GURU'] },
    { name: 'Persuratan', path: '/dashboard/surat', icon: FileText, roles: ['OPERATOR', 'KEPALA_SEKOLAH'] },
    { name: 'Laporan', path: '/dashboard/laporan', icon: BarChart3, roles: ['OPERATOR', 'KEPALA_SEKOLAH'] },
  ];

  const allowedNavItems = navItems.filter(item => item.roles.includes(user.role));

  const formatRole = (role: string) => {
    return role.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-slate-900">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-slate-950">
            <School className="h-8 w-8 text-blue-500" />
            <span className="ml-3 text-white font-semibold text-lg tracking-tight">Admin Sekolah</span>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {allowedNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`${
                      isActive
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}
                  >
                    <Icon className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} mr-3 flex-shrink-0 h-5 w-5`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex bg-slate-800 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div className="inline-block h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {user.full_name ? user.full_name.charAt(0) : 'U'}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white truncate max-w-[140px]">{user.full_name}</p>
                  <p className="text-xs font-medium text-slate-400">{formatRole(user.role)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white shadow-sm">
          <div className="flex items-center justify-between h-12 px-4">
            <div className="flex items-center">
              <School className="h-6 w-6 text-blue-600" />
              <span className="ml-2 text-slate-900 font-semibold">Admin Sekolah</span>
            </div>
            <button className="h-10 w-10 text-slate-500 inline-flex items-center justify-center rounded-md hover:text-slate-900 hover:bg-slate-100">
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-slate-900 capitalize">
                {location.pathname.split('/').pop() === 'dashboard' ? 'Dashboard Overview' : location.pathname.split('/').pop()?.replace('-', ' ')}
              </h1>
              <button 
                onClick={logout}
                className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <LogOut className="mr-2 h-4 w-4 text-slate-500" />
                Keluar
              </button>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
