import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-sekolah';
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // --- MOCK DATABASE (In-Memory for Preview) ---
  const salt = bcrypt.genSaltSync(10);
  let users = [
    { id: '1', username: 'operator', password: bcrypt.hashSync('password123', salt), full_name: 'Budi Operator', role: 'OPERATOR', is_active: true, created_at: new Date().toISOString() },
    { id: '2', username: 'kepsek', password: bcrypt.hashSync('password123', salt), full_name: 'Pak Kepala Sekolah', role: 'KEPALA_SEKOLAH', is_active: true, created_at: new Date().toISOString() },
    { id: '3', username: 'guru', password: bcrypt.hashSync('password123', salt), full_name: 'Ibu Guru', role: 'GURU', is_active: true, created_at: new Date().toISOString() }
  ];

  let students = [
    { id: '1', nis: '1001', name: 'Ahmad Fauzi', class: 'X IPA 1', address: 'Jl. Merdeka No.1' },
    { id: '2', nis: '1002', name: 'Siti Aminah', class: 'X IPA 1', address: 'Jl. Melati No.5' }
  ];

  let teachers = [
    { id: '1', nip: '198001012005011001', name: 'Budi Santoso, S.Pd', subject: 'Matematika' },
    { id: '2', nip: '198205122008012003', name: 'Siti Aminah, M.Pd', subject: 'Bahasa Indonesia' }
  ];

  let classes = [
    { id: '1', name: 'X IPA 1', homeroom_id: '1', homeroom_name: 'Budi Santoso, S.Pd' },
    { id: '2', name: 'XI IPS 2', homeroom_id: '2', homeroom_name: 'Siti Aminah, M.Pd' }
  ];

  let attendances = [
    { id: '1', date: new Date().toISOString().split('T')[0], class_id: '1', student_id: '1', status: 'HADIR' },
    { id: '2', date: new Date().toISOString().split('T')[0], class_id: '1', student_id: '2', status: 'SAKIT' }
  ];

  let letters = [
    { id: '1', type: 'MASUK', reference: '001/DINAS/2026', subject: 'Undangan Rapat Dinas', date: new Date().toISOString().split('T')[0], status: 'PENDING' },
    { id: '2', type: 'KELUAR', reference: '002/SEK/2026', subject: 'Surat Keterangan Aktif', date: new Date().toISOString().split('T')[0], status: 'APPROVED' }
  ];

  // --- MIDDLEWARES ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized. Token missing.' });

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) return res.status(403).json({ error: 'Forbidden. Invalid or expired token.' });
      req.user = decoded;
      next();
    });
  };

  const checkRole = (roles: string[]) => {
    return (req: any, res: any, next: any) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Akses ditolak. Anda tidak memiliki izin.' });
      }
      next();
    };
  };

  // --- AUTH & USER ROUTES ---
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (!user || !user.is_active || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Kredensial tidak valid atau akun nonaktif' });
    }
    const payload = { id: user.id, username: user.username, role: user.role, full_name: user.full_name };
    res.json({ token: jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' }), user: payload });
  });

  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user || !user.is_active) return res.status(403).json({ error: 'Invalid user' });
    res.json({ user: { id: user.id, username: user.username, role: user.role, full_name: user.full_name, is_active: user.is_active } });
  });

  app.get('/api/users', authenticateToken, checkRole(['OPERATOR']), (req, res) => res.json(users.map(({ password, ...rest }) => rest)));
  // Additional User CRUD omitted here for brevity since it was implemented earlier

  // --- DATA SISWA ROUTES ---
  app.get('/api/siswa', authenticateToken, (req, res) => res.json(students));
  app.post('/api/siswa', authenticateToken, checkRole(['OPERATOR']), (req, res) => {
    const newStudent = { id: Date.now().toString(), ...req.body };
    students.push(newStudent);
    res.status(201).json(newStudent);
  });
  app.delete('/api/siswa/:id', authenticateToken, checkRole(['OPERATOR']), (req, res) => {
    students = students.filter(s => s.id !== req.params.id);
    res.status(204).send();
  });

  // --- DATA GURU ROUTES ---
  app.get('/api/guru', authenticateToken, checkRole(['OPERATOR', 'KEPALA_SEKOLAH']), (req, res) => res.json(teachers));
  app.post('/api/guru', authenticateToken, checkRole(['OPERATOR']), (req, res) => {
    const newTeacher = { id: Date.now().toString(), ...req.body };
    teachers.push(newTeacher);
    res.status(201).json(newTeacher);
  });
  app.delete('/api/guru/:id', authenticateToken, checkRole(['OPERATOR']), (req, res) => {
    teachers = teachers.filter(t => t.id !== req.params.id);
    res.status(204).send();
  });

  // --- KELAS ROUTES ---
  app.get('/api/kelas', authenticateToken, (req, res) => res.json(classes));
  app.post('/api/kelas', authenticateToken, checkRole(['OPERATOR']), (req, res) => {
    const newClass = { id: Date.now().toString(), ...req.body };
    classes.push(newClass);
    res.status(201).json(newClass);
  });
  app.delete('/api/kelas/:id', authenticateToken, checkRole(['OPERATOR']), (req, res) => {
    classes = classes.filter(c => c.id !== req.params.id);
    res.status(204).send();
  });

  // --- ABSENSI ROUTES ---
  app.get('/api/absensi', authenticateToken, (req, res) => {
    const { date, class_id } = req.query;
    let filtered = attendances;
    if (date) filtered = filtered.filter(a => a.date === date);
    if (class_id) filtered = filtered.filter(a => a.class_id === class_id);
    res.json(filtered);
  });
  
  app.post('/api/absensi', authenticateToken, checkRole(['OPERATOR', 'GURU']), (req, res) => {
    const { records } = req.body; // array of { class_id, student_id, status, date }
    // Overwrite existing records for the same student on the same date
    records.forEach((rec: any) => {
      const idx = attendances.findIndex(a => a.student_id === rec.student_id && a.date === rec.date);
      if (idx >= 0) attendances[idx] = { ...attendances[idx], status: rec.status };
      else attendances.push({ id: Date.now().toString() + Math.random(), ...rec });
    });
    res.json({ message: 'Absensi disimpan' });
  });

  // --- PERSURATAN ROUTES ---
  app.get('/api/surat', authenticateToken, checkRole(['OPERATOR', 'KEPALA_SEKOLAH']), (req, res) => res.json(letters));
  app.post('/api/surat', authenticateToken, checkRole(['OPERATOR']), (req, res) => {
    const newLetter = { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], status: 'PENDING', ...req.body };
    letters.push(newLetter);
    res.status(201).json(newLetter);
  });
  app.patch('/api/surat/:id/approve', authenticateToken, checkRole(['KEPALA_SEKOLAH']), (req, res) => {
    const letter = letters.find(l => l.id === req.params.id);
    if (letter) {
      letter.status = req.body.status; // APPROVED or REJECTED
      res.json(letter);
    } else {
      res.status(404).json({ error: 'Surat tidak ditemukan' });
    }
  });

  // --- ANALYTICS DASHBOARD ROUTE ---
  app.get('/api/analytics', authenticateToken, (req, res) => {
    const totalSiswa = students.length;
    const totalGuru = teachers.length;
    const totalKelas = classes.length;
    const pendingSurat = letters.filter(l => l.status === 'PENDING').length;
    
    const today = new Date().toISOString().split('T')[0];
    const absensiHariIni = attendances.filter(a => a.date === today);
    const hadir = absensiHariIni.filter(a => a.status === 'HADIR').length;
    const attendancePercentage = absensiHariIni.length > 0 ? ((hadir / absensiHariIni.length) * 100).toFixed(1) : 100;

    res.json({ totalSiswa, totalGuru, totalKelas, pendingSurat, attendancePercentage });
  });

  // --- VITE INTEGRATION ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
}

startServer();
