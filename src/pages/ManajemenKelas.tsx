import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Trash2 } from 'lucide-react';

interface Kelas { id: string; name: string; homeroom_id: string; homeroom_name: string; }
interface Guru { id: string; name: string; }

export default function ManajemenKelas() {
  const { token, user } = useAuth();
  const [classes, setClasses] = useState<Kelas[]>([]);
  const [teachers, setTeachers] = useState<Guru[]>([]);
  const [name, setName] = useState('');
  const [homeroom, setHomeroom] = useState('');

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [resC, resT] = await Promise.all([ fetch('/api/kelas', { headers }), fetch('/api/guru', { headers }) ]);
      if (resC.ok) setClasses(await resC.json());
      if (resT.ok) setTeachers(await resT.json());
    } catch(err) {}
  };
  useEffect(() => { fetchData(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const hr = teachers.find(t => t.id === homeroom);
    try {
      const res = await fetch('/api/kelas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, homeroom_id: homeroom, homeroom_name: hr?.name })
      });
      if (res.ok) { fetchData(); setName(''); setHomeroom(''); }
    } catch (err) {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus kelas?')) return;
    if ((await fetch(`/api/kelas/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })).ok) fetchData();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nama Kelas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Wali Kelas</th>
              {user?.role === 'OPERATOR' && <th className="px-6 py-3 text-right text-xs">Aksi</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {classes.map(c => (
              <tr key={c.id}>
                <td className="px-6 py-4">{c.name}</td>
                <td className="px-6 py-4">{c.homeroom_name}</td>
                {user?.role === 'OPERATOR' && (
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(c.id)} className="text-red-600"><Trash2 className="h-4 w-4"/></button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {user?.role === 'OPERATOR' && (
        <div className="w-full lg:w-80 bg-white shadow rounded-lg p-6 h-fit">
          <h3 className="text-lg font-medium mb-4">Tambah Kelas</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <input required placeholder="Nama Kelas (ex: X IPA 1)" className="w-full border p-2 rounded" value={name} onChange={e => setName(e.target.value)} />
            <select required className="w-full border p-2 rounded" value={homeroom} onChange={e => setHomeroom(e.target.value)}>
              <option value="">-- Pilih Wali Kelas --</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <button className="w-full bg-blue-600 text-white p-2 rounded">Simpan Kelas</button>
          </form>
        </div>
      )}
    </div>
  );
}
