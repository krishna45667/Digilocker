const express = require('express');
const router = express.Router();
const { shareDocument, getSharedDocuments } = require('../controllers/shareController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, shareDocument)
    .get(protect, getSharedDocuments);

module.exports = router;
