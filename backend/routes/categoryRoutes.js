const express = require('express');
const router = express.Router();
const { addCategory, assignCategory, getDocumentsByCategory } = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', addCategory);
router.post('/assign', protect, assignCategory);
router.get('/:categoryId/documents', protect, getDocumentsByCategory);

module.exports = router;
