const db = require('../db');

const getMyNotifications = async (req, res) => {
  try {
    const [notifs] = await db.query(
      'SELECT * FROM notifikasi WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.status(200).json(notifs);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};

const markAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(
      'UPDATE notifikasi SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    res.status(200).json({ message: 'Notifikasi ditandai sebagai dibaca' });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await db.query(
      'UPDATE notifikasi SET is_read = TRUE WHERE user_id = ?',
      [req.user.id]
    );
    res.status(200).json({ message: 'Semua notifikasi ditandai sebagai dibaca' });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead
};
