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

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            {/* Real route for Data Siswa */}
            <Route path="siswa" element={<DataSiswa />} />
            
            {/* Mock routes for other layout testing */}
            <Route path="guru" element={<Dashboard />} />
            <Route path="kelas" element={<Dashboard />} />
            <Route path="absensi" element={<Dashboard />} />
            <Route path="surat" element={<Dashboard />} />
            <Route path="laporan" element={<Dashboard />} />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
