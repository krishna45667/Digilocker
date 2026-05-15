const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const initDB = async () => {
    let connection;
    try {
        // Connect WITHOUT specifying a database first
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            multipleStatements: true,
        });

        // Use query() for DDL — execute() (prepared statements) doesn't support CREATE/USE
        await connection.query(
            `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``
        );
        console.log(`[DB] Database '${process.env.DB_NAME}' ready.`);

        await connection.query(`USE \`${process.env.DB_NAME}\``);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS Users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('[DB] Table: Users ready.');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS Categories (
                id INT PRIMARY KEY AUTO_INCREMENT,
                category_name VARCHAR(100) UNIQUE NOT NULL
            )
        `);
        console.log('[DB] Table: Categories ready.');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS Documents (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                file_type VARCHAR(50) NOT NULL,
                file_path VARCHAR(500) NOT NULL,
                file_size INT NOT NULL,
                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
            )
        `);
        console.log('[DB] Table: Documents ready.');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS Document_Category (
                document_id INT NOT NULL,
                category_id INT NOT NULL,
                PRIMARY KEY (document_id, category_id),
                FOREIGN KEY (document_id) REFERENCES Documents(id) ON DELETE CASCADE,
                FOREIGN KEY (category_id) REFERENCES Categories(id) ON DELETE CASCADE
            )
        `);
        console.log('[DB] Table: Document_Category ready.');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS Shared_Documents (
                id INT PRIMARY KEY AUTO_INCREMENT,
                document_id INT NOT NULL,
                shared_with_user_id INT NOT NULL,
                permission_type ENUM('VIEW', 'DOWNLOAD', 'EDIT') DEFAULT 'VIEW',
                shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (document_id) REFERENCES Documents(id) ON DELETE CASCADE,
                FOREIGN KEY (shared_with_user_id) REFERENCES Users(id) ON DELETE CASCADE
            )
        `);
        console.log('[DB] Table: Shared_Documents ready.');

        // Seed default categories only if table is empty
        const [rows] = await connection.query('SELECT COUNT(*) as count FROM Categories');
        if (rows[0].count === 0) {
            await connection.query(`
                INSERT INTO Categories (category_name) VALUES
                ('Aadhar Card'), ('PAN Card'), ('Driving License'),
                ('Educational Certificate'), ('Health Records'), ('Other')
            `);
            console.log('[DB] Seeded default categories.');
        }

        console.log('[DB] All tables initialized successfully.\n');
    } catch (err) {
        console.error('[DB] Initialization failed:', err.message);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
};

module.exports = initDB;
