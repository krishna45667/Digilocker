const pool = require('../config/db');

// @desc    Add a Category
// @route   POST /api/categories
// @access  Private (Could be Admin-only in robust systems, set private for simplicity)
const addCategory = async (req, res, next) => {
    try {
        const { category_name } = req.body;
        if (!category_name) {
            res.status(400);
            throw new Error('Category name is required');
        }

        const [result] = await pool.execute('INSERT INTO Categories (category_name) VALUES (?)', [category_name]);
        
        res.status(201).json({ id: result.insertId, category_name });
    } catch (error) {
        next(error);
    }
};

// @desc    Assign Category to Document
// @route   POST /api/categories/assign
// @access  Private
const assignCategory = async (req, res, next) => {
    try {
        const { document_id, category_id } = req.body;

        // Check if user owns document
        const [docs] = await pool.execute('SELECT id FROM Documents WHERE id = ? AND user_id = ?', [document_id, req.user.id]);
        if (docs.length === 0) {
            res.status(401);
            throw new Error('Document unauthorized or does not exist');
        }

        await pool.execute('INSERT INTO Document_Category (document_id, category_id) VALUES (?, ?)', [document_id, category_id]);

        res.status(201).json({ message: 'Category assigned successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get Documents by Category (Returns all docs of logged-in user under specific category)
// @route   GET /api/categories/:categoryId/documents
// @access  Private
const getDocumentsByCategory = async (req, res, next) => {
    try {
        const categoryId = req.params.categoryId;
        const [documents] = await pool.execute(`
            SELECT d.id, d.file_name, d.file_path, c.category_name 
            FROM Documents d
            JOIN Document_Category dc ON d.id = dc.document_id
            JOIN Categories c ON dc.category_id = c.id
            WHERE d.user_id = ? AND c.id = ?
        `, [req.user.id, categoryId]);

        res.json(documents);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addCategory,
    assignCategory,
    getDocumentsByCategory
};
