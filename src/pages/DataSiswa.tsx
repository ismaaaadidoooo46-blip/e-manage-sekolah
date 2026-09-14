import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Trash2 } from 'lucide-react';

interface Student {
  id: string;
  nis: string;
  name: string;
  class: string;
  address: string;
}

export default function DataSiswa() {
  const { token, user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Form states
  const [nis, setNis] = useState('');
  const [name, setName] = useState('');
  const [className, setClassName] = useState('');
  const [address, setAddress] = useState('');
  
  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/siswa', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nis || !name || !className) return;

    try {
      const res = await fetch('/api/siswa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ nis, name, class: className, address })
      });

      if (res.ok) {
        fetchStudents();
        setNis('');
        setName('');
        setClassName('');
        setAddress('');
      } else {
        alert("Gagal menambahkan siswa. Pastikan Anda memiliki role Operator.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    
    try {
      const res = await fetch(`/api/siswa/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        fetchStudents();
      } else {
        alert("Gagal menghapus siswa. Pastikan Anda memiliki role Operator.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.nis.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <div className="relative w-full max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Cari NIS atau Nama Siswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Student Table */}
        <div className="flex-1 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 border-b border-slate-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-slate-900">Daftar Siswa</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">NIS</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama Lengkap</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kelas</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Alamat</th>
                  {user?.role === 'Operator' && (
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-slate-500">Memuat data...</td></tr>
                ) : filteredStudents.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-slate-500">Tidak ada data siswa.</td></tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{student.nis}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{student.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{student.class}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{student.address}</td>
                      {user?.role === 'Operator' && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => handleDelete(student.id)}
                            className="text-red-600 hover:text-red-900 ml-4"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Student Form (Only for Operator) */}
        {user?.role === 'Operator' && (
          <div className="w-full lg:w-80 bg-white shadow rounded-lg overflow-hidden h-fit">
            <div className="px-4 py-5 border-b border-slate-200 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-slate-900">Tambah Siswa</h3>
            </div>
            <div className="p-4 sm:p-6">
              <form onSubmit={handleAddStudent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">NIS</label>
                  <input
                    type="text"
                    required
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Kelas</label>
                  <input
                    type="text"
                    required
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Alamat</label>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="mr-2" size={16} /> Tambah Data
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
