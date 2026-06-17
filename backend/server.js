const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const db = require('./db');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Dynamic CORS configuration to allow localhost and any vercel.app subdomain
const checkOrigin = (origin, callback) => {
  // Allow requests with no origin (like mobile apps or curl)
  if (!origin) return callback(null, true);
  
  const allowedOrigins = ['http://localhost:5173', 'http://localhost:5000'];
  const isVercel = origin.endsWith('.vercel.app');
  const isCustomFrontend = process.env.FRONTEND_URL && origin.startsWith(process.env.FRONTEND_URL.replace(/\/$/, ''));
  
  if (allowedOrigins.indexOf(origin) !== -1 || isVercel || isCustomFrontend) {
    callback(null, true);
  } else {
    callback(new Error('Blocked by CORS policy'));
  }
};

const io = socketIo(server, {
  cors: {
    origin: checkOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: checkOrigin,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Expose io in requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Create uploads folder statically accessible
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/authRoutes');
const jasaRoutes = require('./routes/jasaRoutes');
const pesananRoutes = require('./routes/pesananRoutes');
const ulasanRoutes = require('./routes/ulasanRoutes');
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notifikasiRoutes = require('./routes/notifikasiRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/jasa', jasaRoutes);
app.use('/api/pesanan', pesananRoutes);
app.use('/api/ulasan', ulasanRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifikasi', notifikasiRoutes);

app.get('/', (req, res) => {
  res.send('Freelance Service Platform API is running...');
});

// Helper to parse cookies from handshake headers
const parseCookies = (cookieString) => {
  if (!cookieString) return {};
  return cookieString.split(';').reduce((acc, cookie) => {
    const parts = cookie.split('=');
    const key = parts[0] ? parts[0].trim() : '';
    const val = parts[1] ? parts[1].trim() : '';
    if (key) acc[key] = decodeURIComponent(val);
    return acc;
  }, {});
};

// Socket.io Auth Middleware
io.use((socket, next) => {
  const cookieHeader = socket.handshake.headers.cookie;
  if (cookieHeader) {
    const cookies = parseCookies(cookieHeader);
    const token = cookies.token;
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          console.log('Socket JWT verification failed');
          return next(); // Proceed without auth
        }
        socket.user = decoded;
        next();
      });
      return;
    }
  }
  next();
});

// Socket.io Events
io.on('connection', (socket) => {
  const userLabel = socket.user ? `${socket.user.nama} (${socket.user.role})` : 'Anonymous';
  console.log(`User connected: ${userLabel} (Socket ID: ${socket.id})`);

  // Join Room
  socket.on('join_room', (pesananId) => {
    socket.join(`room_${pesananId}`);
    console.log(`Socket ${socket.id} joined room_${pesananId}`);
  });

  // Send Message
  socket.on('send_message', async ({ pesananId, isi }) => {
    if (!socket.user) {
      console.log('Unauthorized message block from anonymous socket');
      return;
    }

    const senderId = socket.user.id;
    const senderNama = socket.user.nama;
    const senderRole = socket.user.role;

    try {
      // Save to Database
      const [result] = await db.query(
        'INSERT INTO pesan (pesanan_id, sender_id, isi) VALUES (?, ?, ?)',
        [pesananId, senderId, isi]
      );
      
      const created_at = new Date();

      // Emit back to Room
      io.to(`room_${pesananId}`).emit('receive_message', {
        id: result.insertId,
        pesanan_id: Number(pesananId),
        sender_id: senderId,
        sender_nama: senderNama,
        sender_role: senderRole,
        isi: isi,
        created_at: created_at.toISOString()
      });

      // Find recipient to notify
      const [pesanans] = await db.query(`
        SELECT p.client_id, j.freelancer_id, j.judul AS jasa_judul
        FROM pesanan p
        JOIN jasa j ON p.jasa_id = j.id
        WHERE p.id = ?
      `, [pesananId]);

      if (pesanans.length > 0) {
        const pesanan = pesanans[0];
        const recipientId = (senderId === pesanan.client_id) ? pesanan.freelancer_id : pesanan.client_id;
        
        const notificationText = `Pesan baru dari ${senderNama} pada Pesanan #${pesananId} ("${pesanan.jasa_judul}")`;
        
        // Save notification to DB
        await db.query(
          'INSERT INTO notifikasi (user_id, pesan, is_read) VALUES (?, ?, ?)',
          [recipientId, notificationText, false]
        );

        // Notify user if online
        io.emit(`notification_${recipientId}`, {
          pesan: notificationText
        });
      }
    } catch (err) {
      console.error('Socket error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
