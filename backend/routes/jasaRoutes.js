const express = require('express');
const router = express.Router();
const {
  upload,
  getAllJasa,
  getJasaById,
  createJasa,
  updateJasa,
  deleteJasa
} = require('../controllers/jasaController');
const verifyToken = require('../middleware/auth');
const roleGuard = require('../middleware/role');

// Public routes
router.get('/', getAllJasa);
router.get('/:id', getJasaById);

// Protected routes (Freelancer only)
router.post('/', verifyToken, roleGuard(['freelancer']), upload.single('foto'), createJasa);
router.put('/:id', verifyToken, roleGuard(['freelancer', 'admin']), upload.single('foto'), updateJasa);
router.delete('/:id', verifyToken, roleGuard(['freelancer', 'admin']), deleteJasa);

module.exports = router;
