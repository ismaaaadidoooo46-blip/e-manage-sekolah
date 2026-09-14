import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Trash2, Edit, ShieldCheck, CheckCircle, XCircle } from 'lucide-react';
import { User, Role } from '../types';

export default function UserManagement() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('GURU');
  const [error, setError] = useState('');
  
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setUsername('');
    setFullName('');
    setPassword('');
    setRole('GURU');
    setError('');
  };

  const handleEditClick = (u: User) => {
    setEditingId(u.id);
    setUsername(u.username);
    setFullName(u.full_name);
    setRole(u.role);
    setPassword(''); // leave blank unless they want to change it
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !fullName) return;

    // if creating new, password is required
    if (!editingId && !password) {
      setError('Password diperlukan untuk pengguna baru.');
      return;
    }

    const payload: any = { username, full_name: fullName, role };
    if (password) payload.password = password;

    const url = editingId ? `/api/users/${editingId}` : '/api/users';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        fetchUsers();
        resetForm();
      } else {
        setError(data.error || 'Terjadi kesalahan.');
      }
    } catch (err) {
      setError('Gagal menghubungi server.');
    }
  };

  const handleToggleStatus = async (id: string) => {
    if (id === user?.id) {
      alert('Anda tidak bisa menonaktifkan akun sendiri.');
      return;
    }

    try {
      const res = await fetch(`/api/users/${id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal mengubah status.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = u.full_name.toLowerCase().includes(search.toLowerCase()) || u.username.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const formatRole = (r: string) => r.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');

  if (user?.role !== 'OPERATOR') {
    return <div className="text-center text-red-600 mt-10">Akses Ditolak. Anda bukan Operator.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm gap-4">
        <div className="relative w-full max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Cari Username atau Nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="ALL">Semua Peran</option>
            <option value="OPERATOR">Operator</option>
            <option value="KEPALA_SEKOLAH">Kepala Sekolah</option>
            <option value="GURU">Guru</option>
            <option value="SISWA">Siswa</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* User Table */}
        <div className="flex-1 bg-white shadow rounded-lg overflow-hidden w-full">
          <div className="px-4 py-5 border-b border-slate-200 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-slate-900">Daftar Pengguna Sistem</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Total: {filteredUsers.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Username</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama Lengkap</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Peran</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-slate-500">Memuat data...</td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-slate-500">Tidak ada pengguna ditemukan.</td></tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{u.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{u.full_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          {formatRole(u.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {u.is_active ? (
                          <span className="inline-flex items-center text-emerald-600"><CheckCircle size={16} className="mr-1"/> Aktif</span>
                        ) : (
                          <span className="inline-flex items-center text-red-600"><XCircle size={16} className="mr-1"/> Nonaktif</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleEditClick(u)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(u.id)}
                          className={`${u.is_active ? 'text-red-600 hover:text-red-900' : 'text-emerald-600 hover:text-emerald-900'} ml-2`}
                          title={u.is_active ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                          disabled={u.id === user?.id}
                        >
                          {u.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add / Edit Form */}
        <div className="w-full lg:w-80 bg-white shadow rounded-lg overflow-hidden h-fit flex-shrink-0">
          <div className="px-4 py-5 border-b border-slate-200 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-slate-900">
              {editingId ? 'Edit Pengguna' : 'Tambah Pengguna'}
            </h3>
            {editingId && (
              <button onClick={resetForm} className="text-sm text-blue-600 hover:text-blue-800">Batal Edit</button>
            )}
          </div>
          <div className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-2 text-xs rounded border border-red-200">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700">Peran</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                >
                  <option value="OPERATOR">Operator</option>
                  <option value="KEPALA_SEKOLAH">Kepala Sekolah</option>
                  <option value="GURU">Guru</option>
                  <option value="SISWA">Siswa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Password {editingId && <span className="text-slate-400 font-normal">(Kosongkan jika tidak diubah)</span>}
                </label>
                <input
                  type="password"
                  required={!editingId}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingId ? "Ketik untuk reset password" : ""}
                  className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <button
                type="submit"
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-2"
              >
                {editingId ? 'Simpan Perubahan' : <><Plus className="mr-2" size={16} /> Tambah Pengguna</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
