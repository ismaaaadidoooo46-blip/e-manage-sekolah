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
    { 
      id: '1', 
      username: 'operator', 
      password: bcrypt.hashSync('password123', salt), 
      full_name: 'Budi Operator', 
      role: 'OPERATOR', 
      is_active: true, 
      created_at: new Date().toISOString() 
    },
    { 
      id: '2', 
      username: 'kepsek', 
      password: bcrypt.hashSync('password123', salt), 
      full_name: 'Pak Kepala Sekolah', 
      role: 'KEPALA_SEKOLAH', 
      is_active: true, 
      created_at: new Date().toISOString() 
    },
    { 
      id: '3', 
      username: 'guru', 
      password: bcrypt.hashSync('password123', salt), 
      full_name: 'Ibu Guru', 
      role: 'GURU', 
      is_active: true, 
      created_at: new Date().toISOString() 
    }
  ];

  let students = [
    { id: '1', nis: '1001', name: 'Ahmad Fauzi', class: 'X IPA 1', address: 'Jl. Merdeka No.1' },
    { id: '2', nis: '1002', name: 'Siti Aminah', class: 'X IPA 1', address: 'Jl. Melati No.5' }
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
        return res.status(403).json({ error: 'Akses ditolak. Anda tidak memiliki izin untuk fitur ini.' });
      }
      next();
    };
  };

  // --- AUTH ROUTES ---
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    
    if (!user) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }
    
    if (!user.is_active) {
      return res.status(403).json({ error: 'Akun Anda telah dinonaktifkan. Silakan hubungi Operator.' });
    }

    // Verify hashed password
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    // Generate JWT token
    const payload = { 
      id: user.id, 
      username: user.username, 
      role: user.role, 
      full_name: user.full_name 
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
    
    res.json({ token, user: payload });
  });

  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user || !user.is_active) return res.status(403).json({ error: 'User invalid atau tidak aktif' });
    
    res.json({ 
      user: { 
        id: user.id, 
        username: user.username, 
        role: user.role, 
        full_name: user.full_name, 
        is_active: user.is_active 
      } 
    });
  });

  // --- USER MANAGEMENT ROUTES (OPERATOR ONLY) ---
  // List all users
  app.get('/api/users', authenticateToken, checkRole(['OPERATOR']), (req, res) => {
    // Return users without password hashes
    const safeUsers = users.map(({ password, ...rest }) => rest);
    res.json(safeUsers);
  });

  // Create new user
  app.post('/api/users', authenticateToken, checkRole(['OPERATOR']), (req, res) => {
    const { username, password, full_name, role } = req.body;
    
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ error: 'Username sudah digunakan.' });
    }

    const newUser = {
      id: Date.now().toString(),
      username,
      password: bcrypt.hashSync(password, 10), // Hash initial password
      full_name,
      role,
      is_active: true,
      created_at: new Date().toISOString()
    };
    
    users.push(newUser);
    const { password: _, ...safeUser } = newUser;
    res.status(201).json(safeUser);
  });

  // Update user (Reset password or change details)
  app.put('/api/users/:id', authenticateToken, checkRole(['OPERATOR']), (req, res) => {
    const { id } = req.params;
    const { username, full_name, role, password } = req.body;
    
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return res.status(404).json({ error: 'User tidak ditemukan' });

    // Check username conflict
    if (username && username !== users[index].username && users.find(u => u.username === username)) {
      return res.status(400).json({ error: 'Username sudah digunakan oleh akun lain.' });
    }

    if (username) users[index].username = username;
    if (full_name) users[index].full_name = full_name;
    if (role) users[index].role = role;
    
    // Reset password if provided
    if (password) {
      users[index].password = bcrypt.hashSync(password, 10);
    }

    const { password: _, ...safeUser } = users[index];
    res.json(safeUser);
  });

  // Toggle user active status
  app.patch('/api/users/:id/status', authenticateToken, checkRole(['OPERATOR']), (req, res) => {
    const { id } = req.params;
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return res.status(404).json({ error: 'User tidak ditemukan' });
    
    // Prevent self-deactivation
    if (req.user.id === id) {
      return res.status(400).json({ error: 'Anda tidak dapat menonaktifkan akun Anda sendiri.' });
    }

    users[index].is_active = !users[index].is_active;
    const { password: _, ...safeUser } = users[index];
    res.json(safeUser);
  });

  // --- DATA SISWA ROUTES ---
  app.get('/api/siswa', authenticateToken, (req, res) => {
    res.json(students);
  });

  app.post('/api/siswa', authenticateToken, checkRole(['OPERATOR']), (req, res) => {
    const newStudent = { id: Date.now().toString(), ...req.body };
    students.push(newStudent);
    res.status(201).json(newStudent);
  });

  app.delete('/api/siswa/:id', authenticateToken, checkRole(['OPERATOR']), (req, res) => {
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
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
