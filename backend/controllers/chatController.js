const db = require('../db');

const getChatHistory = async (req, res) => {
  const { pesananId } = req.params;
  const userId = req.user.id;
  const role = req.user.role;

  try {
    // Check if order exists and user is part of it
    const [pesanans] = await db.query(`
      SELECT p.*, j.freelancer_id
      FROM pesanan p
      JOIN jasa j ON p.jasa_id = j.id
      WHERE p.id = ?
    `, [pesananId]);

    if (pesanans.length === 0) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    }

    const pesanan = pesanans[0];
    if (role !== 'admin' && pesanan.client_id !== userId && pesanan.freelancer_id !== userId) {
      return res.status(403).json({ message: 'Akses ditolak: Anda tidak memiliki akses ke chat pesanan ini' });
    }

    // Get messages
    const [messages] = await db.query(`
      SELECT p.*, u.nama AS sender_nama, u.role AS sender_role, u.foto AS sender_foto
      FROM pesan p
      JOIN users u ON p.sender_id = u.id
      WHERE p.pesanan_id = ?
      ORDER BY p.created_at ASC
    `, [pesananId]);

    res.status(200).json(messages);
  } catch (err) {
    console.error('Error fetching chat history:', err);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};

module.exports = {
  getChatHistory
};
