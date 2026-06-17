const express = require('express');
const router = express.Router();
const { getMyNotifications, markAsRead, markAllAsRead } = require('../controllers/notifikasiController');
const verifyToken = require('../middleware/auth');

router.get('/', verifyToken, getMyNotifications);
router.patch('/read-all', verifyToken, markAllAsRead);
router.patch('/:id/read', verifyToken, markAsRead);

module.exports = router;
