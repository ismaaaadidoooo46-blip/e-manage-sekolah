import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, GraduationCap, FileText, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/analytics', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  const formatRole = (role: string = '') => {
    return role.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-slate-900">
            Selamat Datang, {user?.full_name}!
          </h3>
          <div className="mt-2 max-w-xl text-sm text-slate-500">
            <p>
              Anda masuk sebagai <strong>{formatRole(user?.role)}</strong>. Akses menu di sebelah kiri disesuaikan dengan izin peran Anda.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <GraduationCap className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Total Siswa</dt>
                  <dd className="text-2xl font-semibold text-slate-900">{stats ? stats.totalSiswa : '...'}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-emerald-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Total Guru</dt>
                  <dd className="text-2xl font-semibold text-slate-900">{stats ? stats.totalGuru : '...'}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-amber-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Kehadiran Hari Ini</dt>
                  <dd className="text-2xl font-semibold text-slate-900">{stats ? `${stats.attendancePercentage}%` : '...'}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-purple-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Surat Pending</dt>
                  <dd className="text-2xl font-semibold text-slate-900">{stats ? stats.pendingSurat : '...'}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
