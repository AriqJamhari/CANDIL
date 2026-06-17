const db = require('../db');

const createPesanan = async (req, res) => {
  const { jasa_id, catatan } = req.body;

  if (!jasa_id) {
    return res.status(400).json({ message: 'jasa_id wajib diisi' });
  }

  try {
    const [jasas] = await db.query('SELECT * FROM jasa WHERE id = ?', [jasa_id]);
    if (jasas.length === 0) {
      return res.status(404).json({ message: 'Jasa tidak ditemukan' });
    }

    const jasa = jasas[0];
    if (jasa.status !== 'aktif') {
      return res.status(400).json({ message: 'Jasa ini sedang tidak aktif' });
    }

    const [result] = await db.query(
      'INSERT INTO pesanan (client_id, jasa_id, status, catatan) VALUES (?, ?, ?, ?)',
      [req.user.id, jasa_id, 'pending', catatan || null]
    );

    const pesananId = result.insertId;

    // Send notification to Freelancer
    await db.query(
      'INSERT INTO notifikasi (user_id, pesan) VALUES (?, ?)',
      [jasa.freelancer_id, `Anda menerima pesanan baru #${pesananId} untuk "${jasa.judul}" dari ${req.user.nama}.`]
    );

    res.status(201).json({
      message: 'Pesanan berhasil dibuat',
      pesananId
    });
  } catch (err) {
    console.error('Error creating pesanan:', err);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};

const getPesanan = async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;

  try {
    let sql = `
      SELECT p.*, j.judul AS jasa_judul, j.harga AS jasa_harga, j.foto AS jasa_foto,
             c.nama AS client_nama, f.nama AS freelancer_nama, f.id AS freelancer_id
      FROM pesanan p
      JOIN jasa j ON p.jasa_id = j.id
      JOIN users c ON p.client_id = c.id
      JOIN users f ON j.freelancer_id = f.id
    `;
    const params = [];

    if (role === 'client') {
      sql += ' WHERE p.client_id = ?';
      params.push(userId);
    } else if (role === 'freelancer') {
      sql += ' WHERE j.freelancer_id = ?';
      params.push(userId);
    } else if (role === 'admin') {
      // Admin sees all
    }

    sql += ' ORDER BY p.created_at DESC';

    const [pesanans] = await db.query(sql, params);
    res.status(200).json(pesanans);
  } catch (err) {
    console.error('Error fetching pesanan:', err);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};

const getPesananById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const role = req.user.role;

  try {
    const [pesanans] = await db.query(`
      SELECT p.*, j.judul AS jasa_judul, j.harga AS jasa_harga, j.foto AS jasa_foto, j.deskripsi AS jasa_deskripsi,
             c.nama AS client_nama, c.email AS client_email, f.nama AS freelancer_nama, f.id AS freelancer_id
      FROM pesanan p
      JOIN jasa j ON p.jasa_id = j.id
      JOIN users c ON p.client_id = c.id
      JOIN users f ON j.freelancer_id = f.id
      WHERE p.id = ?
    `, [id]);

    if (pesanans.length === 0) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    }

    const pesanan = pesanans[0];

    // Check authorization
    if (role !== 'admin' && pesanan.client_id !== userId && pesanan.freelancer_id !== userId) {
      return res.status(403).json({ message: 'Akses ditolak: Anda tidak memiliki akses ke pesanan ini' });
    }

    res.status(200).json(pesanan);
  } catch (err) {
    console.error('Error fetching pesanan by id:', err);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};

const updatePesananStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'proses', 'selesai', 'dibatalkan'].includes(status)) {
    return res.status(400).json({ message: 'Status tidak valid' });
  }

  try {
    const [pesanans] = await db.query(`
      SELECT p.*, j.judul AS jasa_judul, j.freelancer_id
      FROM pesanan p
      JOIN jasa j ON p.jasa_id = j.id
      WHERE p.id = ?
    `, [id]);

    if (pesanans.length === 0) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    }

    const pesanan = pesanans[0];
    const isClient = pesanan.client_id === req.user.id;
    const isFreelancer = pesanan.freelancer_id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isClient && !isFreelancer && !isAdmin) {
      return res.status(403).json({ message: 'Akses ditolak: Anda tidak memiliki akses ke pesanan ini' });
    }

    // Update status
    await db.query('UPDATE pesanan SET status = ? WHERE id = ?', [status, id]);

    // Send notifications
    const targetUserId = isClient ? pesanan.freelancer_id : pesanan.client_id;
    await db.query(
      'INSERT INTO notifikasi (user_id, pesan) VALUES (?, ?)',
      [targetUserId, `Status pesanan #${id} ("${pesanan.jasa_judul}") diubah menjadi "${status}" oleh ${req.user.nama}.`]
    );

    res.status(200).json({ message: 'Status pesanan berhasil diperbarui', status });
  } catch (err) {
    console.error('Error updating pesanan status:', err);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};

module.exports = {
  createPesanan,
  getPesanan,
  getPesananById,
  updatePesananStatus
};
