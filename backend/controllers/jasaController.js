const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.fieldname + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Hanya diperbolehkan format gambar (.jpeg/.jpg/.png/.webp)'));
    }
  }
});

const getAllJasa = async (req, res) => {
  const { kategori, harga_min, harga_max, q, freelancer_id } = req.query;

  let sql = `
    SELECT j.*, u.nama AS freelancer_nama, u.foto AS freelancer_foto, u.is_premium AS is_premium_freelancer,
    COALESCE(AVG(ul.rating), 0) AS rating_rata, COUNT(ul.id) AS ulasan_count
    FROM jasa j
    JOIN users u ON j.freelancer_id = u.id
    LEFT JOIN pesanan p ON j.id = p.jasa_id
    LEFT JOIN ulasan ul ON p.id = ul.pesanan_id
    WHERE 1=1
  `;
  const params = [];

  // Filter only active jasa unless requested by owner or admin
  if (freelancer_id) {
    sql += ' AND j.freelancer_id = ?';
    params.push(freelancer_id);
  } else {
    sql += " AND j.status = 'aktif'";
  }

  if (kategori) {
    sql += ' AND j.kategori = ?';
    params.push(kategori);
  }

  if (harga_min) {
    sql += ' AND j.harga >= ?';
    params.push(Number(harga_min));
  }

  if (harga_max) {
    sql += ' AND j.harga <= ?';
    params.push(Number(harga_max));
  }

  if (q) {
    sql += ' AND (j.judul LIKE ? OR j.deskripsi LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }

  sql += ' GROUP BY j.id ORDER BY u.is_premium DESC, j.created_at DESC';

  try {
    const [jasas] = await db.query(sql, params);
    res.status(200).json(jasas);
  } catch (err) {
    console.error('Error fetching jasas:', err);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};

const getJasaById = async (req, res) => {
  const { id } = req.params;

  try {
    const [jasas] = await db.query(`
      SELECT j.*, u.nama AS freelancer_nama, u.email AS freelancer_email, u.foto AS freelancer_foto, u.is_premium AS is_premium_freelancer,
      COALESCE(AVG(ul.rating), 0) AS rating_rata, COUNT(ul.id) AS ulasan_count
      FROM jasa j
      JOIN users u ON j.freelancer_id = u.id
      LEFT JOIN pesanan p ON j.id = p.jasa_id
      LEFT JOIN ulasan ul ON p.id = ul.pesanan_id
      WHERE j.id = ?
      GROUP BY j.id
    `, [id]);

    if (jasas.length === 0) {
      return res.status(404).json({ message: 'Jasa tidak ditemukan' });
    }

    res.status(200).json(jasas[0]);
  } catch (err) {
    console.error('Error fetching jasa by id:', err);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};

const createJasa = async (req, res) => {
  const { judul, deskripsi, kategori, harga } = req.body;
  const foto = req.file ? req.file.filename : null;

  if (!judul || !deskripsi || !kategori || !harga) {
    return res.status(400).json({ message: 'Semua input wajib diisi' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO jasa (freelancer_id, judul, deskripsi, kategori, harga, foto, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, judul, deskripsi, kategori, Number(harga), foto, 'aktif']
    );

    res.status(201).json({
      message: 'Jasa berhasil dibuat',
      jasaId: result.insertId
    });
  } catch (err) {
    console.error('Error creating jasa:', err);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};

const updateJasa = async (req, res) => {
  const { id } = req.params;
  const { judul, deskripsi, kategori, harga, status } = req.body;

  try {
    const [jasas] = await db.query('SELECT * FROM jasa WHERE id = ?', [id]);
    if (jasas.length === 0) {
      return res.status(404).json({ message: 'Jasa tidak ditemukan' });
    }

    const jasa = jasas[0];
    if (jasa.freelancer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak: Anda bukan pemilik jasa ini' });
    }

    const foto = req.file ? req.file.filename : jasa.foto;

    await db.query(
      'UPDATE jasa SET judul = ?, deskripsi = ?, kategori = ?, harga = ?, foto = ?, status = ? WHERE id = ?',
      [
        judul || jasa.judul,
        deskripsi || jasa.deskripsi,
        kategori || jasa.kategori,
        harga !== undefined ? Number(harga) : jasa.harga,
        foto,
        status || jasa.status,
        id
      ]
    );

    res.status(200).json({ message: 'Jasa berhasil diperbarui' });
  } catch (err) {
    console.error('Error updating jasa:', err);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};

const deleteJasa = async (req, res) => {
  const { id } = req.params;

  try {
    const [jasas] = await db.query('SELECT * FROM jasa WHERE id = ?', [id]);
    if (jasas.length === 0) {
      return res.status(404).json({ message: 'Jasa tidak ditemukan' });
    }

    const jasa = jasas[0];
    if (jasa.freelancer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak: Anda bukan pemilik jasa ini' });
    }

    // Delete image file if exists
    if (jasa.foto) {
      const filePath = path.join(__dirname, '../uploads', jasa.foto);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await db.query('DELETE FROM jasa WHERE id = ?', [id]);
    res.status(200).json({ message: 'Jasa berhasil dihapus' });
  } catch (err) {
    console.error('Error deleting jasa:', err);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};

module.exports = {
  upload,
  getAllJasa,
  getJasaById,
  createJasa,
  updateJasa,
  deleteJasa
};
