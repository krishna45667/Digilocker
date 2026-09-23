const Category = require('../models/Category');
const connectDB = require('./db');

const initDB = async () => {
    try {
        await connectDB();

        // Seed default categories if none exist
        const count = await Category.countDocuments();
        if (count === 0) {
            const defaultCategories = [
                { category_name: 'Aadhar Card' },
                { category_name: 'PAN Card' },
                { category_name: 'Driving License' },
                { category_name: 'Educational Certificate' },
                { category_name: 'Health Records' },
                { category_name: 'Other' },
            ];
            await Category.insertMany(defaultCategories);
            console.log('[DB] Seeded default categories in MongoDB.');
        } else {
            console.log(`[DB] Found ${count} categories in MongoDB.`);
        }
        console.log('[DB] Database & Collections initialized successfully.\n');
    } catch (err) {
        console.error('[DB] Initialization failed:', err.message);
        process.exit(1);
    }
};

module.exports = initDB;
