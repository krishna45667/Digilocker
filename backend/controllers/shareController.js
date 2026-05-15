const pool = require('../config/db');

// @desc    Share Document
// @route   POST /api/share
// @access  Private
const shareDocument = async (req, res, next) => {
    try {
        const { document_id, shared_with_email, permission_type } = req.body;

        // Find user_id by email
        const [users] = await pool.execute('SELECT id FROM Users WHERE email = ?', [shared_with_email]);
        if (users.length === 0) {
            res.status(404);
            throw new Error('User to share with not found');
        }
        const sharedWithUserId = users[0].id;

        // Ensure request user owns document
        const [docs] = await pool.execute('SELECT id FROM Documents WHERE id = ? AND user_id = ?', [document_id, req.user.id]);
        if (docs.length === 0) {
            res.status(401);
            throw new Error('Document unauthorized or does not exist');
        }

        // Insert share
        const [result] = await pool.execute(
            'INSERT INTO Shared_Documents (document_id, shared_with_user_id, permission_type) VALUES (?, ?, ?)',
            [document_id, sharedWithUserId, permission_type || 'VIEW']
        );

        res.status(201).json({ message: 'Document shared successfully', share_id: result.insertId });
    } catch (error) {
        next(error);
    }
};

// @desc    View Shared Documents (Docs shared WITH the logged in user)
// @route   GET /api/share
// @access  Private
const getSharedDocuments = async (req, res, next) => {
    try {
        const [sharedDocs] = await pool.execute(`
            SELECT sd.id as share_id, d.file_name, d.file_path, u.name as owner_name, sd.permission_type, sd.shared_at
            FROM Shared_Documents sd
            JOIN Documents d ON sd.document_id = d.id
            JOIN Users u ON d.user_id = u.id
            WHERE sd.shared_with_user_id = ?
        `, [req.user.id]);

        res.json(sharedDocs);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    shareDocument,
    getSharedDocuments
};
