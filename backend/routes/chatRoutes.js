const express = require('express');
const router = express.Router();
const { getChatHistory } = require('../controllers/chatController');
const verifyToken = require('../middleware/auth');

router.get('/:pesananId', verifyToken, getChatHistory);

module.exports = router;
