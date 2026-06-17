const express = require('express');
const router = express.Router();
const { createUlasan, getUlasanByJasa } = require('../controllers/ulasanController');
const verifyToken = require('../middleware/auth');
const roleGuard = require('../middleware/role');

router.post('/:pesananId', verifyToken, roleGuard(['client']), createUlasan);
router.get('/jasa/:jasaId', getUlasanByJasa);

module.exports = router;
