const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  ajukanPremium,
  getStatusPremium,
  getAllRequests,
  verifikasiPremium
} = require('../controllers/premiumController');

const verifyToken = require('../middleware/auth');
const roleGuard = require('../middleware/role');

// Configure Multer Storage for Premium Requests
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `premium_${Date.now()}${ext}`);
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

// Routes configuration
router.post('/ajukan', verifyToken, roleGuard(['freelancer']), upload.single('bukti_bayar'), ajukanPremium);
router.get('/status', verifyToken, roleGuard(['freelancer']), getStatusPremium);
router.get('/requests', verifyToken, roleGuard(['admin']), getAllRequests);
router.patch('/requests/:id/verify', verifyToken, roleGuard(['admin']), verifikasiPremium);

module.exports = router;
