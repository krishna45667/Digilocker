const SharedDocument = require('../models/SharedDocument');
const Document = require('../models/Document');
const User = require('../models/User');

// @desc    Share Document
// @route   POST /api/share
// @access  Private
const shareDocument = async (req, res, next) => {
    try {
        const { document_id, shared_with_email, permission_type } = req.body;

        if (!document_id || !shared_with_email) {
            res.status(400);
            throw new Error('Please provide document_id and shared_with_email');
        }

        // Find recipient user by email
        const targetUser = await User.findOne({ email: shared_with_email.toLowerCase().trim() });
        if (!targetUser) {
            res.status(404);
            throw new Error('User to share with not found');
        }

        if (targetUser._id.toString() === req.user._id.toString()) {
            res.status(400);
            throw new Error('You cannot share a document with yourself');
        }

        // Ensure requesting user owns the document
        const doc = await Document.findOne({ _id: document_id, user: req.user._id });
        if (!doc) {
            res.status(401);
            throw new Error('Document unauthorized or does not exist');
        }

        // Upsert or create share record
        const share = await SharedDocument.findOneAndUpdate(
            { document: document_id, shared_with_user: targetUser._id },
            { permission_type: permission_type || 'VIEW', shared_at: new Date() },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );

        res.status(201).json({
            message: 'Document shared successfully',
            share_id: share._id.toString(),
        });
    } catch (error) {
        next(error);
    }
};

// @desc    View Shared Documents (Docs shared WITH the logged in user)
// @route   GET /api/share
// @access  Private
const getSharedDocuments = async (req, res, next) => {
    try {
        const sharedDocs = await SharedDocument.find({ shared_with_user: req.user._id })
            .populate({
                path: 'document',
                populate: {
                    path: 'user',
                    select: 'name email',
                },
            })
            .sort({ createdAt: -1 });

        // Filter out records where underlying document may have been deleted
        const formatted = sharedDocs
            .filter((sd) => sd.document && sd.document.user)
            .map((sd) => ({
                share_id: sd._id.toString(),
                id: sd._id.toString(),
                file_name: sd.document.file_name,
                file_path: sd.document.file_path,
                file_type: sd.document.file_type,
                owner_name: sd.document.user.name,
                owner_email: sd.document.user.email,
                permission_type: sd.permission_type,
                shared_at: sd.shared_at || sd.createdAt,
            }));

        res.json(formatted);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    shareDocument,
    getSharedDocuments,
};
