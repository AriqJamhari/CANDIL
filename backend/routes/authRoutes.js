const express = require('express');
const router = express.Router();
const { register, login, logout, me, seedProductionDatabase } = require('../controllers/authController');
const verifyToken = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', verifyToken, me);
router.get('/seed-production-db-candil-12345', seedProductionDatabase);

module.exports = router;
