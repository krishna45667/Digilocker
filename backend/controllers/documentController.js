const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

// @desc    Upload document
// @route   POST /api/documents
// @access  Private
const uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400);
            throw new Error('Please upload a file');
        }

        const userId = req.user.id;
        const fileName = req.body.fileName || req.file.originalname;
        const fileType = req.file.mimetype;
        const filePath = req.file.path; // e.g., 'uploads/file-12345.pdf'
        const fileSize = req.file.size;

        const [result] = await pool.execute(
            'INSERT INTO Documents (user_id, file_name, file_type, file_path, file_size) VALUES (?, ?, ?, ?, ?)',
            [userId, fileName, fileType, filePath, fileSize]
        );

        res.status(201).json({
            id: result.insertId,
            user_id: userId,
            file_name: fileName,
            file_path: filePath
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all documents of user
// @route   GET /api/documents
// @access  Private
const getDocuments = async (req, res, next) => {
    try {
        const [documents] = await pool.execute(
            'SELECT id, file_name, file_type, file_path, file_size, upload_date FROM Documents WHERE user_id = ?',
            [req.user.id]
        );
        res.json(documents);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = async (req, res, next) => {
    try {
        const docId = req.params.id;

        // Ensure user owns document
        const [docs] = await pool.execute('SELECT file_path FROM Documents WHERE id = ? AND user_id = ?', [docId, req.user.id]);
        if (docs.length === 0) {
            res.status(404);
            throw new Error('Document not found or unauthorized');
        }

        const filePath = docs[0].file_path;

        // Delete from database
        await pool.execute('DELETE FROM Documents WHERE id = ?', [docId]);

        // Remove from local filesystem
        const fullPath = path.join(__dirname, '..', filePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }

        res.json({ message: 'Document removed', id: docId });
    } catch (error) {
        next(error);
    }
};

// @desc    Update document details (name)
// @route   PUT /api/documents/:id
// @access  Private
const updateDocument = async (req, res, next) => {
    try {
        const docId = req.params.id;
        const { file_name } = req.body;

        if (!file_name) {
            res.status(400);
            throw new Error('Please provide a new file name');
        }

        // Ensure ownership
        const [docs] = await pool.execute('SELECT id FROM Documents WHERE id = ? AND user_id = ?', [docId, req.user.id]);
        if (docs.length === 0) {
            res.status(404);
            throw new Error('Document not found or unauthorized');
        }

        await pool.execute('UPDATE Documents SET file_name = ? WHERE id = ?', [file_name, docId]);

        res.json({ message: 'Document updated successfully', id: docId });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    uploadDocument,
    getDocuments,
    deleteDocument,
    updateDocument
};
