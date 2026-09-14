/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import DataSiswa from './pages/DataSiswa';
import UserManagement from './pages/UserManagement';
import DataGuru from './pages/DataGuru';
import ManajemenKelas from './pages/ManajemenKelas';
import Absensi from './pages/Absensi';
import Persuratan from './pages/Persuratan';
import Laporan from './pages/Laporan';
import Register from './pages/Register';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="siswa" element={<DataSiswa />} />
            <Route path="guru" element={<DataGuru />} />
            <Route path="kelas" element={<ManajemenKelas />} />
            <Route path="absensi" element={<Absensi />} />
            <Route path="surat" element={<Persuratan />} />
            <Route path="laporan" element={<Laporan />} />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
