import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, CheckCircle, XCircle } from 'lucide-react';

interface Surat { id: string; type: string; reference: string; subject: string; date: string; status: string; }

export default function Persuratan() {
  const { token, user } = useAuth();
  const [letters, setLetters] = useState<Surat[]>([]);
  const [type, setType] = useState('MASUK');
  const [subject, setSubject] = useState('');
  const [reference, setReference] = useState('');

  const fetchLetters = async () => {
    const res = await fetch('/api/surat', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setLetters(await res.json());
  };
  useEffect(() => { fetchLetters(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/surat', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ type, subject, reference })
    });
    fetchLetters();
    setSubject(''); setReference('');
  };

  const handleApprove = async (id: string, newStatus: string) => {
    await fetch(`/api/surat/${id}/approve`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus })
    });
    fetchLetters();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs uppercase text-slate-500">No. Surat</th>
              <th className="px-6 py-3 text-left text-xs uppercase text-slate-500">Perihal</th>
              <th className="px-6 py-3 text-left text-xs uppercase text-slate-500">Status</th>
              {user?.role === 'KEPALA_SEKOLAH' && <th className="px-6 py-3 text-right">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {letters.map(l => (
              <tr key={l.id}>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded mr-2 ${l.type === 'MASUK' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>{l.type}</span>
                  {l.reference}
                </td>
                <td className="px-6 py-4">{l.subject}</td>
                <td className="px-6 py-4">
                  {l.status === 'PENDING' && <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs border border-amber-200">Menunggu</span>}
                  {l.status === 'APPROVED' && <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs border border-emerald-200">Disetujui</span>}
                  {l.status === 'REJECTED' && <span className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs border border-red-200">Ditolak</span>}
                </td>
                {user?.role === 'KEPALA_SEKOLAH' && l.status === 'PENDING' && (
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleApprove(l.id, 'APPROVED')} className="text-emerald-600 mr-2"><CheckCircle size={18}/></button>
                    <button onClick={() => handleApprove(l.id, 'REJECTED')} className="text-red-600"><XCircle size={18}/></button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {user?.role === 'OPERATOR' && (
        <div className="w-full lg:w-80 bg-white shadow rounded-lg p-6 h-fit">
          <h3 className="text-lg font-medium mb-4">Input Surat Baru</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <select value={type} onChange={e=>setType(e.target.value)} className="w-full border p-2 rounded">
              <option value="MASUK">Surat Masuk</option>
              <option value="KELUAR">Surat Keluar</option>
            </select>
            <input required placeholder="No. Referensi" value={reference} onChange={e=>setReference(e.target.value)} className="w-full border p-2 rounded" />
            <input required placeholder="Perihal" value={subject} onChange={e=>setSubject(e.target.value)} className="w-full border p-2 rounded" />
            <button className="w-full bg-blue-600 text-white p-2 rounded">Simpan Surat</button>
          </form>
        </div>
      )}
    </div>
  );
}
