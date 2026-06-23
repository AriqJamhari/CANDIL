const express = require('express');
const router = express.Router();
const { getUsers, getJasa, getPesanan, broadcastNotification, updateJasaStatus } = require('../controllers/adminController');
const verifyToken = require('../middleware/auth');
const roleGuard = require('../middleware/role');

// All admin routes are guarded by verifyToken and roleGuard(['admin'])
router.use(verifyToken, roleGuard(['admin']));

router.get('/users', getUsers);
router.get('/jasa', getJasa);
router.get('/pesanan', getPesanan);
router.post('/notifikasi', broadcastNotification);
router.patch('/jasa/:id/status', updateJasaStatus);

module.exports = router;
