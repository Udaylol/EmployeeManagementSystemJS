const express = require('express');
const { authenticate } = require('../middlewares/auth');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.post('/', authenticate, adminController.createAdmin);
router.get('/', authenticate, adminController.listAdmins);
router.get('/:id', authenticate, adminController.getAdminById);
router.put('/:id', authenticate, adminController.updateAdmin);
router.delete('/:id', authenticate, adminController.deleteAdmin);

module.exports = router;