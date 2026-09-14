import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-sekolah';
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // --- MOCK DATABASE (In-Memory for Preview) ---
  const users = [
    { id: '1', username: 'operator', password: 'password123', name: 'Budi Operator', role: 'Operator' },
    { id: '2', username: 'kepsek', password: 'password123', name: 'Pak Kepala', role: 'Kepala Sekolah' },
    { id: '3', username: 'guru', password: 'password123', name: 'Ibu Guru', role: 'Guru' }
  ];

  let students = [
    { id: '1', nis: '1001', name: 'Ahmad Fauzi', class: 'X IPA 1', address: 'Jl. Merdeka No.1' },
    { id: '2', nis: '1002', name: 'Siti Aminah', class: 'X IPA 1', address: 'Jl. Melati No.5' },
    { id: '3', nis: '1003', name: 'Budi Santoso', class: 'XI IPS 2', address: 'Jl. Kenangan No.10' }
  ];

  // --- MIDDLEWARES ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Forbidden' });
      req.user = user;
      next();
    });
  };

  const authorizeRole = (roles: string[]) => {
    return (req: any, res: any, next: any) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Akses ditolak' });
      }
      next();
    };
  };

  // --- API ROUTES ---
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '8h' });
      res.json({ token, user: { id: user.id, username: user.username, role: user.role, name: user.name } });
    } else {
      res.status(401).json({ error: 'Username atau password salah' });
    }
  });

  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    res.json({ user: req.user });
  });

  // Data Siswa API
  app.get('/api/siswa', authenticateToken, (req, res) => {
    res.json(students);
  });

  app.post('/api/siswa', authenticateToken, authorizeRole(['Operator']), (req, res) => {
    const newStudent = { id: Date.now().toString(), ...req.body };
    students.push(newStudent);
    res.status(201).json(newStudent);
  });

  app.delete('/api/siswa/:id', authenticateToken, authorizeRole(['Operator']), (req, res) => {
    students = students.filter(s => s.id !== req.params.id);
    res.status(204).send();
  });

  // --- VITE INTEGRATION ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
