const db = require('../db');

const getUsers = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, nama, email, role, foto, created_at FROM users ORDER BY created_at DESC');
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users for admin:', err);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};

const getJasa = async (req, res) => {
  try {
    const [jasas] = await db.query(`
      SELECT j.*, u.nama AS freelancer_nama 
      FROM jasa j
      JOIN users u ON j.freelancer_id = u.id
      ORDER BY j.created_at DESC
    `);
    res.status(200).json(jasas);
  } catch (err) {
    console.error('Error fetching jasas for admin:', err);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};

const getPesanan = async (req, res) => {
  try {
    const [pesanans] = await db.query(`
      SELECT p.*, j.judul AS jasa_judul, j.harga AS jasa_harga,
             c.nama AS client_nama, f.nama AS freelancer_nama
      FROM pesanan p
      JOIN jasa j ON p.jasa_id = j.id
      JOIN users c ON p.client_id = c.id
      JOIN users f ON j.freelancer_id = f.id
      ORDER BY p.created_at DESC
    `);
    res.status(200).json(pesanans);
  } catch (err) {
    console.error('Error fetching pesanan for admin:', err);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};

const broadcastNotification = async (req, res) => {
  const { pesan } = req.body;

  if (!pesan) {
    return res.status(400).json({ message: 'Pesan notifikasi tidak boleh kosong' });
  }

  try {
    const [users] = await db.query('SELECT id FROM users');
    
    // Insert notification record for all users
    const insertPromises = users.map(user => {
      return db.query('INSERT INTO notifikasi (user_id, pesan, is_read) VALUES (?, ?, ?)', [user.id, pesan, false]);
    });
    
    await Promise.all(insertPromises);

    // Emit live via socket.io
    if (req.io) {
      req.io.emit('notification', { pesan });
    }

    res.status(200).json({ message: 'Notifikasi berhasil dibroadcast ke seluruh user' });
  } catch (err) {
    console.error('Error broadcasting notification:', err);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};

module.exports = {
  getUsers,
  getJasa,
  getPesanan,
  broadcastNotification
};
