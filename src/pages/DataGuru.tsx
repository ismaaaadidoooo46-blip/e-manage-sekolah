import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Trash2 } from 'lucide-react';

interface Guru { id: string; nip: string; name: string; subject: string; }

export default function DataGuru() {
  const { token, user } = useAuth();
  const [teachers, setTeachers] = useState<Guru[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [nip, setNip] = useState('');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');

  const fetchTeachers = async () => {
    try {
      const res = await fetch('/api/guru', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setTeachers(await res.json());
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchTeachers(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/guru', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nip, name, subject })
      });
      if (res.ok) { fetchTeachers(); setNip(''); setName(''); setSubject(''); }
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus guru ini?')) return;
    try {
      if ((await fetch(`/api/guru/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })).ok) fetchTeachers();
    } catch (err) {}
  };

  const filtered = teachers.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.nip.includes(search));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search className="absolute inset-y-0 left-3 h-5 w-5 text-slate-400 mt-2.5" />
          <input type="text" className="block w-full pl-10 pr-3 py-2 border rounded-md" placeholder="Cari Guru..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">NIP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nama Lengkap</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Mata Pelajaran</th>
                {user?.role === 'OPERATOR' && <th className="px-6 py-3 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filtered.map(t => (
                <tr key={t.id}>
                  <td className="px-6 py-4 text-sm">{t.nip}</td>
                  <td className="px-6 py-4 text-sm">{t.name}</td>
                  <td className="px-6 py-4 text-sm">{t.subject}</td>
                  {user?.role === 'OPERATOR' && (
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(t.id)} className="text-red-600"><Trash2 className="h-4 w-4"/></button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {user?.role === 'OPERATOR' && (
          <div className="w-full lg:w-80 bg-white shadow rounded-lg p-6 h-fit">
            <h3 className="text-lg font-medium mb-4">Tambah Guru</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <input required placeholder="NIP" className="w-full border p-2 rounded" value={nip} onChange={e => setNip(e.target.value)} />
              <input required placeholder="Nama Lengkap" className="w-full border p-2 rounded" value={name} onChange={e => setName(e.target.value)} />
              <input required placeholder="Mata Pelajaran" className="w-full border p-2 rounded" value={subject} onChange={e => setSubject(e.target.value)} />
              <button className="w-full bg-blue-600 text-white p-2 rounded">Tambah Data</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
