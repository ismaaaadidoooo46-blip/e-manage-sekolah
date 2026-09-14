import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Save } from 'lucide-react';

interface Siswa { id: string; nis: string; name: string; class: string; }
interface Kelas { id: string; name: string; }
interface AbsenRecord { student_id: string; status: 'HADIR' | 'SAKIT' | 'IZIN' | 'ALPA'; }

export default function Absensi() {
  const { token, user } = useAuth();
  const [classes, setClasses] = useState<Kelas[]>([]);
  const [students, setStudents] = useState<Siswa[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<Record<string, AbsenRecord['status']>>({});
  
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch('/api/kelas', { headers }).then(r => r.json()).then(setClasses);
    fetch('/api/siswa', { headers }).then(r => r.json()).then(setStudents);
  }, []);

  const fetchAbsensi = async () => {
    if (!selectedClass || !date) return;
    const res = await fetch(`/api/absensi?class_id=${selectedClass}&date=${date}`, { headers });
    const data = await res.json();
    const newRecs: Record<string, any> = {};
    data.forEach((d: any) => newRecs[d.student_id] = d.status);
    
    // Auto-fill HADIR for those not found in existing records
    const classStudents = students.filter(s => s.class === classes.find(c => c.id === selectedClass)?.name);
    classStudents.forEach(s => { if (!newRecs[s.id]) newRecs[s.id] = 'HADIR'; });
    setRecords(newRecs);
  };

  useEffect(() => { fetchAbsensi(); }, [selectedClass, date, students]);

  const handleSave = async () => {
    const payload = Object.keys(records).map(s_id => ({
      class_id: selectedClass, student_id: s_id, date, status: records[s_id]
    }));
    const res = await fetch('/api/absensi', {
      method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ records: payload })
    });
    if (res.ok) alert('Absensi berhasil disimpan!');
  };

  const classStudents = students.filter(s => s.class === classes.find(c => c.id === selectedClass)?.name);

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 shadow rounded-lg flex gap-4 items-end">
        <div>
          <label className="block text-sm text-slate-700">Tanggal</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 border p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm text-slate-700">Pilih Kelas</label>
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="mt-1 border p-2 rounded min-w-[200px]">
            <option value="">-- Pilih Kelas --</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {selectedClass && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs uppercase">Siswa</th>
                <th className="px-6 py-3 text-left text-xs uppercase">Status Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {classStudents.map(s => (
                <tr key={s.id}>
                  <td className="px-6 py-4">{s.name} ({s.nis})</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-4">
                      {['HADIR', 'SAKIT', 'IZIN', 'ALPA'].map(status => (
                        <label key={status} className="flex items-center gap-1 cursor-pointer">
                          <input type="radio" name={`status-${s.id}`} checked={records[s.id] === status} onChange={() => setRecords({ ...records, [s.id]: status as any })} />
                          <span className={`text-sm ${status==='HADIR'?'text-emerald-600':status==='ALPA'?'text-red-600':''}`}>{status}</span>
                        </label>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 bg-slate-50 text-right">
            <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 ml-auto">
              <Save size={16} /> Simpan Absensi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
