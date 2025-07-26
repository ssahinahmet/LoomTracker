const express = require('express');
const router = express.Router();

const {
  loginUser,
  createUser,
  deleteUser,
  listUsers
} = require('../controllers/authController');

const {
  authenticate,
  isAdmin
} = require('../middleware/auth');

/**
 * @route   POST /api/auth/login
 * @desc    Kullanıcı giriş işlemi. PIN ile kimlik doğrulama yapılır.
 * @access  Public (middleware yok)
 */
router.post('/login', loginUser);

/**
 * @route   POST /api/auth/create
 * @desc    Yeni kullanıcı oluşturma. Sadece admin yetkisi ile erişilebilir.
 * @access  Private (admin)
 */
router.post('/create', authenticate, isAdmin, createUser);

/**
 * @route   DELETE /api/auth/:userId
 * @desc    Kullanıcı silme işlemi. Sadece admin yetkisi ile erişilebilir.
 * @param   userId  Silinecek kullanıcının userId'si (pizza000001 gibi)
 * @access  Private (admin)
 */
router.delete('/:userId', authenticate, isAdmin, deleteUser);

/**
 * @route   GET /api/auth/
 * @desc    Kullanıcı listesini getirir. Sadece admin yetkisi ile erişilebilir.
 * @access  Private (admin)
 */
router.get('/', authenticate, isAdmin, listUsers);

module.exports = router;
