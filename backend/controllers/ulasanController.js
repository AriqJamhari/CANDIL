const db = require('../db');

const createUlasan = async (req, res) => {
  const { pesananId } = req.params;
  const { rating, komentar } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating wajib diisi (angka 1-5)' });
  }

  try {
    const [pesanans] = await db.query('SELECT * FROM pesanan WHERE id = ?', [pesananId]);
    if (pesanans.length === 0) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    }

    const pesanan = pesanans[0];
    if (pesanan.client_id !== req.user.id) {
      return res.status(403).json({ message: 'Akses ditolak: Hanya pembeli yang dapat memberikan ulasan' });
    }

    if (pesanan.status !== 'selesai') {
      return res.status(400).json({ message: 'Ulasan hanya dapat diberikan setelah status pesanan selesai' });
    }

    const [existing] = await db.query('SELECT * FROM ulasan WHERE pesanan_id = ?', [pesananId]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Anda sudah memberikan ulasan untuk pesanan ini' });
    }

    await db.query(
      'INSERT INTO ulasan (pesanan_id, client_id, rating, komentar) VALUES (?, ?, ?, ?)',
      [pesananId, req.user.id, rating, komentar || null]
    );

    res.status(201).json({ message: 'Ulasan berhasil dikirim' });
  } catch (err) {
    console.error('Error creating ulasan:', err);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};

const getUlasanByJasa = async (req, res) => {
  const { jasaId } = req.params;

  try {
    const [ulasans] = await db.query(`
      SELECT u.*, us.nama AS client_nama, us.foto AS client_foto
      FROM ulasan u
      JOIN users us ON u.client_id = us.id
      JOIN pesanan p ON u.pesanan_id = p.id
      WHERE p.jasa_id = ?
      ORDER BY u.created_at DESC
    `, [jasaId]);

    res.status(200).json(ulasans);
  } catch (err) {
    console.error('Error fetching ulasan by jasa:', err);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};

module.exports = {
  createUlasan,
  getUlasanByJasa
};
