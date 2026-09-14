import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Printer, FileText } from 'lucide-react';

export default function Laporan() {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/analytics', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setData);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!data) return <div>Memuat...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm print:hidden">
        <h2 className="text-xl font-semibold">Cetak Laporan Rekapitulasi</h2>
        <button onClick={handlePrint} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          <Printer size={18} /> Cetak / Export PDF
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-8 print:shadow-none print:p-0" id="print-area">
        <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
          <h1 className="text-2xl font-bold uppercase">Laporan Sistem Administrasi Sekolah</h1>
          <p className="text-slate-600">Dicetak pada: {new Date().toLocaleDateString('id-ID')}</p>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-lg border-b pb-2 mb-2">Statistik Master Data</h3>
            <ul className="space-y-2">
              <li className="flex justify-between"><span>Total Siswa:</span> <strong>{data.totalSiswa} Orang</strong></li>
              <li className="flex justify-between"><span>Total Guru:</span> <strong>{data.totalGuru} Orang</strong></li>
              <li className="flex justify-between"><span>Total Kelas:</span> <strong>{data.totalKelas} Kelas</strong></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg border-b pb-2 mb-2">Statistik Operasional (Hari Ini)</h3>
            <ul className="space-y-2">
              <li className="flex justify-between"><span>Persentase Kehadiran:</span> <strong className="text-emerald-600">{data.attendancePercentage}%</strong></li>
              <li className="flex justify-between"><span>Surat Menunggu Approval:</span> <strong className="text-amber-600">{data.pendingSurat} Berkas</strong></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex justify-end">
          <div className="text-center w-64">
            <p className="mb-16">Kepala Sekolah,</p>
            <p className="font-bold border-b border-black">Pak Kepala Sekolah</p>
            <p className="text-sm">NIP. 197001012000011001</p>
          </div>
        </div>
      </div>
    </div>
  );
}
