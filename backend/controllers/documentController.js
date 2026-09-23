const Document = require('../models/Document');
const SharedDocument = require('../models/SharedDocument');
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

        const userId = req.user._id;
        const fileName = req.body.fileName || req.file.originalname;
        const fileType = req.file.mimetype;
        const filePath = req.file.path.replace(/\\/g, '/'); // normalize path separators for web
        const fileSize = req.file.size;
        const categoryId = req.body.category_id || req.body.categoryId;

        const docData = {
            user: userId,
            file_name: fileName,
            file_type: fileType,
            file_path: filePath,
            file_size: fileSize,
        };

        if (categoryId) {
            docData.categories = [categoryId];
        }

        const doc = await Document.create(docData);

        res.status(201).json({
            id: doc._id.toString(),
            user_id: userId.toString(),
            file_name: doc.file_name,
            file_path: doc.file_path,
            file_type: doc.file_type,
            file_size: doc.file_size,
            upload_date: doc.upload_date,
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
        const documents = await Document.find({ user: req.user._id })
            .populate('categories', 'category_name')
            .sort({ createdAt: -1 });

        const formattedDocs = documents.map((doc) => ({
            id: doc._id.toString(),
            file_name: doc.file_name,
            file_type: doc.file_type,
            file_path: doc.file_path,
            file_size: doc.file_size,
            upload_date: doc.upload_date || doc.createdAt,
            category_name: doc.categories && doc.categories.length > 0 ? doc.categories[0].category_name : '',
        }));

        res.json(formattedDocs);
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
        const doc = await Document.findOne({ _id: docId, user: req.user._id });
        if (!doc) {
            res.status(404);
            throw new Error('Document not found or unauthorized');
        }

        // Delete from database
        await Document.findByIdAndDelete(docId);

        // Cascade delete shared documents associated with this document (NoSQL cascade)
        await SharedDocument.deleteMany({ document: docId });

        // Remove from local filesystem
        const fullPath = path.join(__dirname, '..', doc.file_path);
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

        // Ensure ownership and update
        const doc = await Document.findOneAndUpdate(
            { _id: docId, user: req.user._id },
            { file_name: file_name.trim() },
            { returnDocument: 'after' }
        );

        if (!doc) {
            res.status(404);
            throw new Error('Document not found or unauthorized');
        }

        res.json({ message: 'Document updated successfully', id: docId });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    uploadDocument,
    getDocuments,
    deleteDocument,
    updateDocument,
};
