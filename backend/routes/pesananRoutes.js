const express = require('express');
const router = express.Router();
const {
  createPesanan,
  getPesanan,
  getPesananById,
  updatePesananStatus
} = require('../controllers/pesananController');
const verifyToken = require('../middleware/auth');
const roleGuard = require('../middleware/role');

// All order routes require authentication
router.post('/', verifyToken, roleGuard(['client']), createPesanan);
router.get('/', verifyToken, getPesanan);
router.get('/:id', verifyToken, getPesananById);
router.patch('/:id/status', verifyToken, updatePesananStatus);

module.exports = router;
