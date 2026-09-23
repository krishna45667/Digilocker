const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/digilocker_db');
        console.log(`[DB] MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`[DB] MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
