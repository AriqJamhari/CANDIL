const db = require('../db');

// 1. ajukanPremium (POST /api/premium/ajukan)
const ajukanPremium = async (req, res) => {
  const { paket } = req.body;
  const freelancer_id = req.user.id;
  const bukti_bayar = req.file ? req.file.filename : null;

  if (!paket || !['monthly', 'yearly'].includes(paket)) {
    return res.status(400).json({ message: 'Paket tidak valid' });
  }

  if (!bukti_bayar) {
    return res.status(400).json({ message: 'Bukti pembayaran wajib diunggah' });
  }

  const harga = paket === 'monthly' ? 99000 : 799000;

  try {
    // Check if there is already a pending request
    const [pendingRequests] = await db.query(
      "SELECT id FROM premium_requests WHERE freelancer_id = ? AND status = 'pending'",
      [freelancer_id]
    );

    if (pendingRequests.length > 0) {
      return res.status(400).json({ message: 'Pengajuan kamu sedang diproses' });
    }

    // Insert new request
    const [result] = await db.query(
      'INSERT INTO premium_requests (freelancer_id, status, bukti_bayar, paket, harga) VALUES (?, ?, ?, ?, ?)',
      [freelancer_id, 'pending', bukti_bayar, paket, harga]
    );

    // Get all admins to notify them
    const [admins] = await db.query("SELECT id FROM users WHERE role = 'admin'");
    const notifMsg = `Ada pengajuan premium baru dari ${req.user.nama}`;
    
    const insertNotifs = admins.map(admin => {
      return db.query('INSERT INTO notifikasi (user_id, pesan, is_read) VALUES (?, ?, ?)', [
        admin.id,
        notifMsg,
        false
      ]);
    });
    await Promise.all(insertNotifs);

    // Socket.io emit
    if (req.io) {
      admins.forEach(admin => {
        req.io.emit(`notification_${admin.id}`, { pesan: notifMsg });
      });
    }

    res.status(201).json({
      message: 'Pengajuan premium berhasil dikirim',
      id: result.insertId
    });
  } catch (err) {
    console.error('Error in ajukanPremium:', err);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};

// 2. getStatusPremium (GET /api/premium/status)
const getStatusPremium = async (req, res) => {
  const freelancer_id = req.user.id;

  try {
    // Get user details
    const [users] = await db.query('SELECT is_premium, premium_until FROM users WHERE id = ?', [freelancer_id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    let { is_premium, premium_until } = users[0];

    // Check if premium has expired
    if (is_premium && premium_until && new Date(premium_until) < new Date()) {
      await db.query('UPDATE users SET is_premium = FALSE, premium_until = NULL WHERE id = ?', [freelancer_id]);
      is_premium = 0;
      premium_until = null;
    }

    // Get last request
    const [requests] = await db.query(
      'SELECT status, paket, created_at, catatan_admin FROM premium_requests WHERE freelancer_id = ? ORDER BY created_at DESC LIMIT 1',
      [freelancer_id]
    );

    res.status(200).json({
      is_premium: !!is_premium,
      premium_until,
      last_request: requests.length > 0 ? requests[0] : null
    });
  } catch (err) {
    console.error('Error in getStatusPremium:', err);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};

// 3. getAllRequests (GET /api/premium/requests)
const getAllRequests = async (req, res) => {
  const { status } = req.query;

  let sql = `
    SELECT pr.*, u.nama AS freelancer_nama, u.email AS freelancer_email
    FROM premium_requests pr
    JOIN users u ON pr.freelancer_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    sql += ' AND pr.status = ?';
    params.push(status);
  }

  sql += ' ORDER BY pr.created_at DESC';

  try {
    const [requests] = await db.query(sql, params);
    res.status(200).json({ requests });
  } catch (err) {
    console.error('Error in getAllRequests:', err);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};

// 4. verifikasiPremium (PATCH /api/premium/requests/:id/verify)
const verifikasiPremium = async (req, res) => {
  const { id } = req.params;
  const { action, catatan_admin } = req.body;

  if (!action || !['approve', 'reject'].includes(action)) {
    return res.status(400).json({ message: "Action harus berupa 'approve' atau 'reject'" });
  }

  try {
    const [requests] = await db.query('SELECT * FROM premium_requests WHERE id = ?', [id]);
    if (requests.length === 0) {
      return res.status(404).json({ message: 'Request premium tidak ditemukan' });
    }

    const request = requests[0];
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request premium ini sudah diproses sebelumnya' });
    }

    if (action === 'approve') {
      // Update status request
      await db.query('UPDATE premium_requests SET status = ? WHERE id = ?', ['approved', id]);

      // Calculate new premium expiry duration (30 days or 365 days)
      const days = request.paket === 'monthly' ? 30 : 365;

      // Update user premium fields
      await db.query(
        'UPDATE users SET is_premium = TRUE, premium_until = DATE_ADD(NOW(), INTERVAL ? DAY) WHERE id = ?',
        [days, request.freelancer_id]
      );

      // Create notification
      const notifMsg = 'Selamat! Akun premium kamu telah diaktifkan 🎉';
      await db.query('INSERT INTO notifikasi (user_id, pesan, is_read) VALUES (?, ?, ?)', [
        request.freelancer_id,
        notifMsg,
        false
      ]);

      // Socket emit
      if (req.io) {
        req.io.emit(`notification_${request.freelancer_id}`, { pesan: notifMsg });
      }
    } else {
      // Action is 'reject'
      await db.query(
        'UPDATE premium_requests SET status = ?, catatan_admin = ? WHERE id = ?',
        ['rejected', catatan_admin || null, id]
      );

      // Create notification
      const notifMsg = `Pengajuan premium ditolak: ${catatan_admin || 'Tidak ada catatan khusus'}`;
      await db.query('INSERT INTO notifikasi (user_id, pesan, is_read) VALUES (?, ?, ?)', [
        request.freelancer_id,
        notifMsg,
        false
      ]);

      // Socket emit
      if (req.io) {
        req.io.emit(`notification_${request.freelancer_id}`, { pesan: notifMsg });
      }
    }

    res.status(200).json({ message: 'Verifikasi berhasil diproses' });
  } catch (err) {
    console.error('Error in verifikasiPremium:', err);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};

module.exports = {
  ajukanPremium,
  getStatusPremium,
  getAllRequests,
  verifikasiPremium
};
