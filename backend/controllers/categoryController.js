const Category = require('../models/Category');
const Document = require('../models/Document');

// @desc    Get all Categories
// @route   GET /api/categories
// @access  Public / Private
const getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find().sort({ category_name: 1 });
        res.json(categories.map((c) => ({ id: c._id.toString(), category_name: c.category_name })));
    } catch (error) {
        next(error);
    }
};

// @desc    Add a Category
// @route   POST /api/categories
// @access  Private / Admin
const addCategory = async (req, res, next) => {
    try {
        const { category_name } = req.body;
        if (!category_name) {
            res.status(400);
            throw new Error('Category name is required');
        }

        const category = await Category.create({ category_name: category_name.trim() });
        res.status(201).json({ id: category._id.toString(), category_name: category.category_name });
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
        const doc = await Document.findOne({ _id: document_id, user: req.user._id });
        if (!doc) {
            res.status(401);
            throw new Error('Document unauthorized or does not exist');
        }

        // Verify category exists
        const cat = await Category.findById(category_id);
        if (!cat) {
            res.status(404);
            throw new Error('Category does not exist');
        }

        await Document.findByIdAndUpdate(document_id, {
            $addToSet: { categories: category_id },
        });

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
        const { categoryId } = req.params;
        const documents = await Document.find({
            user: req.user._id,
            categories: categoryId,
        }).populate('categories', 'category_name');

        const formattedDocs = documents.map((d) => ({
            id: d._id.toString(),
            file_name: d.file_name,
            file_path: d.file_path,
            category_name: d.categories?.[0]?.category_name || '',
        }));

        res.json(formattedDocs);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCategories,
    addCategory,
    assignCategory,
    getDocumentsByCategory,
};
