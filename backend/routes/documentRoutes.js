const express = require('express');
const router = express.Router();
const { uploadDocument, getDocuments, deleteDocument, updateDocument } = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .post(protect, upload.single('document'), uploadDocument)
    .get(protect, getDocuments);

router.route('/:id')
    .put(protect, updateDocument)
    .delete(protect, deleteDocument);

module.exports = router;
