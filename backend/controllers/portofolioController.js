const db = require('../db');
const fs = require('fs');
const path = require('path');

// 1. getByFreelancer (GET /api/portofolio/:freelancerId)
const getByFreelancer = async (req, res) => {
  const { freelancerId } = req.params;

  try {
    const [portofolios] = await db.query(
      'SELECT * FROM portofolio WHERE freelancer_id = ? ORDER BY created_at DESC',
      [freelancerId]
    );
    res.status(200).json({ portofolio: portofolios });
  } catch (err) {
    console.error('Error in getByFreelancer:', err);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};

// 2. getMilik (GET /api/portofolio/milik/saya)
const getMilik = async (req, res) => {
  const freelancer_id = req.user.id;

  try {
    const [portofolios] = await db.query(
      'SELECT * FROM portofolio WHERE freelancer_id = ? ORDER BY created_at DESC',
      [freelancer_id]
    );
    res.status(200).json({ portofolio: portofolios });
  } catch (err) {
    console.error('Error in getMilik:', err);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};

// 3. create (POST /api/portofolio)
const create = async (req, res) => {
  const { judul, deskripsi, link_url } = req.body;
  const freelancer_id = req.user.id;
  const gambar = req.file ? req.file.filename : null;

  if (!judul) {
    return res.status(400).json({ message: 'Judul portofolio wajib diisi' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO portofolio (freelancer_id, judul, deskripsi, link_url, gambar) VALUES (?, ?, ?, ?, ?)',
      [freelancer_id, judul, deskripsi || null, link_url || null, gambar]
    );

    res.status(201).json({
      message: 'Portofolio berhasil dibuat',
      id: result.insertId
    });
  } catch (err) {
    console.error('Error in create portofolio:', err);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};

// 4. update (PUT /api/portofolio/:id)
const update = async (req, res) => {
  const { id } = req.params;
  const { judul, deskripsi, link_url } = req.body;
  const freelancer_id = req.user.id;

  if (!judul) {
    return res.status(400).json({ message: 'Judul portofolio wajib diisi' });
  }

  try {
    const [portofolios] = await db.query('SELECT * FROM portofolio WHERE id = ?', [id]);
    if (portofolios.length === 0) {
      return res.status(404).json({ message: 'Portofolio tidak ditemukan' });
    }

    const porto = portofolios[0];
    if (porto.freelancer_id !== freelancer_id) {
      return res.status(403).json({ message: 'Akses ditolak: Anda bukan pemilik portofolio ini' });
    }

    let gambar = porto.gambar;
    if (req.file) {
      gambar = req.file.filename;
      // Remove old image file if it exists
      if (porto.gambar) {
        const oldPath = path.join(__dirname, '../uploads', porto.gambar);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    await db.query(
      'UPDATE portofolio SET judul = ?, deskripsi = ?, link_url = ?, gambar = ? WHERE id = ?',
      [judul, deskripsi || null, link_url || null, gambar, id]
    );

    res.status(200).json({ message: 'Portofolio berhasil diperbarui' });
  } catch (err) {
    console.error('Error in update portofolio:', err);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};

// 5. remove (DELETE /api/portofolio/:id)
const remove = async (req, res) => {
  const { id } = req.params;
  const freelancer_id = req.user.id;

  try {
    const [portofolios] = await db.query('SELECT * FROM portofolio WHERE id = ?', [id]);
    if (portofolios.length === 0) {
      return res.status(404).json({ message: 'Portofolio tidak ditemukan' });
    }

    const porto = portofolios[0];
    if (porto.freelancer_id !== freelancer_id) {
      return res.status(403).json({ message: 'Akses ditolak: Anda bukan pemilik portofolio ini' });
    }

    // Delete image file if exists
    if (porto.gambar) {
      const oldPath = path.join(__dirname, '../uploads', porto.gambar);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    await db.query('DELETE FROM portofolio WHERE id = ?', [id]);
    res.status(200).json({ message: 'Portofolio berhasil dihapus' });
  } catch (err) {
    console.error('Error in remove portofolio:', err);
    res.status(500).json({ message: 'Terjadi kesalahan di server' });
  }
};

module.exports = {
  getByFreelancer,
  getMilik,
  create,
  update,
  remove
};
