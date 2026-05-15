const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorMiddleware');
const initDB = require('./config/initDB');
const path = require('path');

// Load env vars
dotenv.config();

const app = express();

// Enable CORS for the React frontend (Vite dev server)
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Make uploads folder publicly accessible for viewing documents
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/share', require('./routes/shareRoutes'));

// Custom Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Initialize DB then start the server
const startServer = async () => {
    await initDB(); // Creates DB + tables if they don't exist
    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
};

startServer();
