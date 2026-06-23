const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const register = async (req, res) => {
  const { nama, email, password, role } = req.body;
  
  if (!nama || !email || !password || !role) {
    return res.status(400).json({ message: 'Semua input wajib diisi' });
  }

  if (!['client', 'freelancer', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Role tidak valid' });
  }

  try {
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save default profile pic or null
    const foto = null;

    const [result] = await db.query(
      'INSERT INTO users (nama, email, password, role, foto) VALUES (?, ?, ?, ?, ?)',
      [nama, email, hashedPassword, role, foto]
    );

    res.status(201).json({
      message: 'Registrasi berhasil',
      userId: result.insertId
    });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password wajib diisi' });
  }

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Email atau password salah' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email atau password salah' });
    }

    const token = jwt.sign(
      { id: user.id, nama: user.nama, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const isProduction = process.env.NODE_ENV === 'production' || (process.env.FRONTEND_URL && !process.env.FRONTEND_URL.includes('localhost'));

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction, // true for production HTTPS cross-site
      sameSite: isProduction ? 'none' : 'lax', // 'none' required for cross-site cookies
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
        foto: user.foto
      }
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};

const logout = (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production' || (process.env.FRONTEND_URL && !process.env.FRONTEND_URL.includes('localhost'));
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
  });
  res.status(200).json({ message: 'Logout berhasil' });
};

const me = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, nama, email, role, foto, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    res.status(200).json(users[0]);
  } catch (err) {
    console.error('Error in GET /me:', err);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};
module.exports = { register, login, logout, me };
