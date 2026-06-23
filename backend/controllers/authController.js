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

const seedProductionDatabase = async (req, res) => {
  const { secret } = req.query;
  if (secret !== 'candil123') {
    return res.status(403).json({ message: 'Forbidden: Invalid secret token' });
  }

  try {
    console.log('Starting production database simulation seeding...');
    
    // Hash password 'password123'
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const mockEmails = [
      'mutia@candil.com', 'pacri@candil.com', 'amarsya@candil.com', 'huston@candil.com', 'ahmad@candil.com', 'ariq@candil.com', 'ariq_client@candil.com',
      'juragan99@candil.com', 'jasakeren@candil.com',
      'muflih@candil.com', 'alhijir@candil.com', 'kulaarr@candil.com', 'swastika@candil.com',
      'admin@candil.com'
    ];
    
    console.log('Cleaning up existing simulation users from production DB...');
    for (const email of mockEmails) {
      const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
      if (users.length > 0) {
        const userId = users[0].id;
        
        // Delete dependent reviews, orders, messages, services
        await db.query('DELETE FROM ulasan WHERE client_id = ?', [userId]);
        await db.query('DELETE FROM pesan WHERE sender_id = ?', [userId]);
        await db.query('DELETE FROM notifikasi WHERE user_id = ?', [userId]);
        await db.query('DELETE FROM premium_requests WHERE freelancer_id = ?', [userId]);
        
        // Find jasas by this user to delete their orders
        const [jasas] = await db.query('SELECT id FROM jasa WHERE freelancer_id = ?', [userId]);
        for (const jasa of jasas) {
          const [orders] = await db.query('SELECT id FROM pesanan WHERE jasa_id = ?', [jasa.id]);
          for (const order of orders) {
            await db.query('DELETE FROM ulasan WHERE pesanan_id = ?', [order.id]);
            await db.query('DELETE FROM pesan WHERE pesanan_id = ?', [order.id]);
          }
          await db.query('DELETE FROM pesanan WHERE jasa_id = ?', [jasa.id]);
        }
        await db.query('DELETE FROM jasa WHERE freelancer_id = ?', [userId]);
        
        // Find orders where this user is the client
        const [clientOrders] = await db.query('SELECT id FROM pesanan WHERE client_id = ?', [userId]);
        for (const order of clientOrders) {
          await db.query('DELETE FROM ulasan WHERE pesanan_id = ?', [order.id]);
          await db.query('DELETE FROM pesan WHERE pesanan_id = ?', [order.id]);
        }
        await db.query('DELETE FROM pesanan WHERE client_id = ?', [userId]);
        
        await db.query('DELETE FROM users WHERE id = ?', [userId]);
      }
    }
    
    // Insert Admin user (so user can login as admin if forgotten)
    await db.query(
      'INSERT INTO users (nama, email, password, role, is_premium) VALUES (?, ?, ?, ?, ?)',
      ['Admin Candil', 'admin@candil.com', hashedPassword, 'admin', false]
    );

    // Insert Clients
    const clientData = [
      { nama: 'Mutia', email: 'mutia@candil.com' },
      { nama: 'pacri', email: 'pacri@candil.com' },
      { nama: 'Amarsya Swastika', email: 'amarsya@candil.com' },
      { nama: 'huston', email: 'huston@candil.com' },
      { nama: 'ahmad', email: 'ahmad@candil.com' },
      { nama: 'ariq', email: 'ariq@candil.com' }
    ];
    
    const clients = [];
    for (const c of clientData) {
      const [res] = await db.query(
        'INSERT INTO users (nama, email, password, role, is_premium) VALUES (?, ?, ?, ?, ?)',
        [c.nama, c.email, hashedPassword, 'client', false]
      );
      clients.push({ id: res.insertId, nama: c.nama });
    }
    
    // Insert Verified Freelancers
    const verifiedFreelancerData = [
      { nama: 'juragan99', email: 'juragan99@candil.com' },
      { nama: 'jasakeren', email: 'jasakeren@candil.com' }
    ];
    
    const verifiedFreelancers = [];
    for (const f of verifiedFreelancerData) {
      const premiumUntil = new Date();
      premiumUntil.setFullYear(premiumUntil.getFullYear() + 2); // 2 years premium
      const [res] = await db.query(
        'INSERT INTO users (nama, email, password, role, is_premium, premium_until) VALUES (?, ?, ?, ?, ?, ?)',
        [f.nama, f.email, hashedPassword, 'freelancer', true, premiumUntil]
      );
      verifiedFreelancers.push({ id: res.insertId, nama: f.nama });
    }
    
    // Insert Unverified Freelancers
    const unverifiedFreelancerData = [
      { nama: 'Muflih', email: 'muflih@candil.com' },
      { nama: 'Al Hijir', email: 'alhijir@candil.com' },
      { nama: 'kulaarr', email: 'kulaarr@candil.com' },
      { nama: 'swastika', email: 'swastika@candil.com' }
    ];
    
    const unverifiedFreelancers = [];
    for (const f of unverifiedFreelancerData) {
      const [res] = await db.query(
        'INSERT INTO users (nama, email, password, role, is_premium) VALUES (?, ?, ?, ?, ?)',
        [f.nama, f.email, hashedPassword, 'freelancer', false]
      );
      unverifiedFreelancers.push({ id: res.insertId, nama: f.nama });
    }
    
    // Services mock data
    const mockServicesData = [
      { judul: 'Jasa Pembuatan Website Portfolio Profesional', deskripsi: 'Saya akan membuat website portfolio yang responsif, modern, dan cepat menggunakan React dan Tailwind CSS.', kategori: 'Pemrograman & IT', harga: 750000, foto: 'jasa_porto.jpg' },
      { judul: 'Desain Logo Minimalis dan Branding Identitas', deskripsi: 'Jasa desain logo eksklusif dan minimalis untuk bisnis atau startup Anda. File master lengkap SVG, PNG, PDF.', kategori: 'Desain Grafis', harga: 350000, foto: 'jasa_logo.jpg' },
      { judul: 'Penulisan Artikel SEO Blog Bahasa Indonesia', deskripsi: 'Menulis artikel SEO friendly berkualitas tinggi, bebas plagiasi, 1000 kata untuk blog Anda.', kategori: 'Penulisan & Penerjemahan', harga: 150000, foto: 'jasa_artikel.jpg' },
      { judul: 'Jasa Optimasi SEO Website & Google Search Console', deskripsi: 'Optimasi on-page dan off-page SEO untuk menaikkan peringkat website Anda di hasil pencarian Google.', kategori: 'Pemrograman & IT', harga: 990000, foto: 'jasa_seo.jpg' },
      { judul: 'Desain Feed Instagram Aesthetic untuk Bisnis', deskripsi: 'Membuat template dan desain feed Instagram yang menarik dan profesional untuk menaikkan engagement.', kategori: 'Desain Grafis', harga: 250000, foto: 'jasa_ig.jpg' },
      { judul: 'Edit Video Konten TikTok & Instagram Reels', deskripsi: 'Jasa editing video reels/tiktok pendek dengan efek dinamis, subtitle menarik, dan sound trending.', kategori: 'Video & Animasi', harga: 200000, foto: 'jasa_video.jpg' },
      { judul: 'Jasa Pemasaran Iklan Facebook & Instagram Ads', deskripsi: 'Membantu menaikkan penjualan bisnis Anda melalui kampanye iklan FB/IG Ads tertarget.', kategori: 'Pemasaran Digital', harga: 1200000, foto: 'jasa_ads.jpg' },
      { judul: 'Penerjemahan Dokumen Resmi Inggris - Indonesia', deskripsi: 'Penerjemahan dokumen akademis, kontrak bisnis, dan artikel dari bahasa Inggris ke Indonesia secara akurat.', kategori: 'Penulisan & Penerjemahan', harga: 180000, foto: 'jasa_trans.jpg' },
      { judul: 'Pembuatan Backsound Musik Game & Video youtube', deskripsi: 'Membuat instrumen musik orisinal bebas hak cipta untuk latar belakang video atau game Anda.', kategori: 'Audio & Musik', harga: 500000, foto: 'jasa_audio.jpg' },
      { judul: 'Konsultasi Strategi Digital Marketing UMKM', deskripsi: 'Sesi konsultasi strategi pemasaran digital terpadu untuk menaikkan omzet bisnis kecil menengah Anda.', kategori: 'Pemasaran Digital', harga: 400000, foto: 'jasa_market.jpg' }
    ];

    const createdJasas = [];
    
    // Verified freelancers: 5 services each
    for (const vf of verifiedFreelancers) {
      for (let i = 0; i < 5; i++) {
        const mockIdx = (vf.id + i) % mockServicesData.length;
        const mock = mockServicesData[mockIdx];
        const judul = `${vf.nama} - ${mock.judul}`;
        
        const [res] = await db.query(
          'INSERT INTO jasa (freelancer_id, judul, deskripsi, kategori, harga, foto, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [vf.id, judul, mock.deskripsi, mock.kategori, mock.harga, mock.foto, 'aktif']
        );
        createdJasas.push({ id: res.insertId, freelancer_id: vf.id, judul });
      }
    }
    
    // Unverified freelancers: 2 services each
    for (const uf of unverifiedFreelancers) {
      for (let i = 0; i < 2; i++) {
        const mockIdx = (uf.id + i) % mockServicesData.length;
        const mock = mockServicesData[mockIdx];
        const judul = `${uf.nama} - ${mock.judul}`;
        
        const [res] = await db.query(
          'INSERT INTO jasa (freelancer_id, judul, deskripsi, kategori, harga, foto, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [uf.id, judul, mock.deskripsi, mock.kategori, mock.harga, mock.foto, 'aktif']
        );
        createdJasas.push({ id: res.insertId, freelancer_id: uf.id, judul });
      }
    }
    
    // Simulate Orders
    for (const c of clients) {
      // Select 2 random distinct services
      const shuffledJasas = [...createdJasas].sort(() => 0.5 - Math.random());
      const selectedJasas = shuffledJasas.slice(0, 2);
      
      for (const j of selectedJasas) {
        // Create pesanan
        const [resOrder] = await db.query(
          'INSERT INTO pesanan (client_id, jasa_id, status, catatan) VALUES (?, ?, ?, ?)',
          [c.id, j.id, 'selesai', 'Mohon dikerjakan sesuai spesifikasi dan detail deskripsi jasa. Terima kasih!']
        );
        const orderId = resOrder.insertId;
        
        // Create messages (pesan)
        await db.query(
          'INSERT INTO pesan (pesanan_id, sender_id, isi) VALUES (?, ?, ?)',
          [orderId, c.id, `Halo, saya memesan jasa "${j.judul}". Mohon diproses ya.`]
        );
        
        await db.query(
          'INSERT INTO pesan (pesanan_id, sender_id, isi) VALUES (?, ?, ?)',
          [orderId, j.freelancer_id, 'Halo! Baik, pesanan Anda telah saya terima dan akan segera saya kerjakan. Estimasi waktu 2 hari.']
        );
        
        await db.query(
          'INSERT INTO pesan (pesanan_id, sender_id, isi) VALUES (?, ?, ?)',
          [orderId, j.freelancer_id, 'Pesanan Anda telah selesai saya kerjakan. Silakan diperiksa kembali hasilnya.']
        );
        
        await db.query(
          'INSERT INTO pesan (pesanan_id, sender_id, isi) VALUES (?, ?, ?)',
          [orderId, c.id, 'Hasilnya sangat luar biasa dan sesuai keinginan! Saya selesaikan pesanannya ya. Terima kasih banyak.']
        );
        
        // Create ulasan
        const rating = Math.random() > 0.3 ? 5 : 4;
        const komentar = `Sangat direkomendasikan! Pengerjaan dari freelancer cepat, responsif, dan hasilnya sangat rapi.`;
        await db.query(
          'INSERT INTO ulasan (pesanan_id, client_id, rating, komentar) VALUES (?, ?, ?, ?)',
          [orderId, c.id, rating, komentar]
        );
      }
    }
    
    res.status(200).json({ success: true, message: 'Database simulation seeding completed successfully!' });
  } catch (err) {
    console.error('Seeding route failed:', err);
    res.status(500).json({ success: false, message: 'Seeding failed', error: err.message });
  }
};

module.exports = { register, login, logout, me, seedProductionDatabase };
