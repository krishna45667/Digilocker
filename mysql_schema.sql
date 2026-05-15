-- =================================================================================
-- COMPLETE MYSQL SCHEMA FOR DIGILOCKER-LIKE SYSTEM
-- =================================================================================

-- 1. Users Table
CREATE TABLE Users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for searching users by email efficiently
CREATE INDEX idx_users_email ON Users(email);


-- 2. Categories Table
CREATE TABLE Categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) UNIQUE NOT NULL
);


-- 3. Documents Table
CREATE TABLE Documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- e.g., 'application/pdf', 'image/jpeg'
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL, -- size in bytes
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Indexes for quick fetching of documents by owner, and by name
CREATE INDEX idx_documents_userid ON Documents(user_id);
CREATE INDEX idx_documents_filename ON Documents(file_name);


-- 4. Document_Category Table (Many-to-Many mapping)
CREATE TABLE Document_Category (
    document_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (document_id, category_id),
    FOREIGN KEY (document_id) REFERENCES Documents(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Categories(id) ON DELETE CASCADE
);


-- 5. Shared_Documents Table
CREATE TABLE Shared_Documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    document_id INT NOT NULL,
    shared_with_user_id INT NOT NULL,
    permission_type ENUM('VIEW', 'DOWNLOAD', 'EDIT') DEFAULT 'VIEW',
    shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES Documents(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_with_user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Index to quickly find documents shared with a specific user
CREATE INDEX idx_shared_with ON Shared_Documents(shared_with_user_id);


-- =================================================================================
-- INSERT SAMPLE DATA
-- =================================================================================

-- Insert Sample Users
INSERT INTO Users (name, email, password) VALUES
('Ravi Kumar', 'ravi@example.com', 'hashed_pass_1'),
('Priya Sharma', 'priya@example.com', 'hashed_pass_2'),
('Amit Patel', 'amit@example.com', 'hashed_pass_3');

-- Insert Sample Categories
INSERT INTO Categories (category_name) VALUES
('Aadhar Card'),
('PAN Card'),
('Educational Certificates'),
('Driving License'),
('Health Records');

-- Insert Sample Documents
INSERT INTO Documents (user_id, file_name, file_type, file_path, file_size) VALUES
(1, 'Ravi_Aadhar.pdf', 'application/pdf', '/storage/docs/ravi_aadhar.pdf', 1024000),
(1, 'Ravi_BTech_Degree.pdf', 'application/pdf', '/storage/docs/ravi_btech.pdf', 3048000),
(2, 'Priya_PAN.jpg', 'image/jpeg', '/storage/docs/priya_pan.jpg', 512000),
(3, 'Amit_DL.jpeg', 'image/jpeg', '/storage/docs/amit_dl.jpeg', 805000);

-- Map Documents to Categories
INSERT INTO Document_Category (document_id, category_id) VALUES
(1, 1), -- Ravi_Aadhar -> Aadhar Card
(2, 3), -- Ravi_BTech -> Educational Certificates
(3, 2), -- Priya_PAN -> PAN Card
(4, 4); -- Amit_DL -> Driving License

-- Insert Sample Shares (Ravi shares BTech Degree with Amit, Priya shares PAN with Ravi)
INSERT INTO Shared_Documents (document_id, shared_with_user_id, permission_type) VALUES
(2, 3, 'VIEW'),
(3, 1, 'DOWNLOAD');


-- =================================================================================
-- CRUD OPERATIONS (QUERIES)
-- =================================================================================

-- 1. CREATE (Insert operations already shown above as sample data)
-- For example, uploading a new document for User 2 (Priya):
/*
INSERT INTO Documents (user_id, file_name, file_type, file_path, file_size)
VALUES (2, 'Priya_Passport.pdf', 'application/pdf', '/storage/docs/priya_passport.pdf', 4500000);
*/

-- 2. READ (Select Operations)

-- 2.a Get all documents for a specific user (e.g., User 1 - Ravi)
SELECT file_name, file_type, file_size, upload_date
FROM Documents
WHERE user_id = 1;

-- 2.b Get documents along with their category names for a specific user
SELECT d.file_name, c.category_name
FROM Documents d
JOIN Document_Category dc ON d.id = dc.document_id
JOIN Categories c ON dc.category_id = c.id
WHERE d.user_id = 1;

-- 2.c Find all documents shared WITH a particular user (e.g., User 3 - Amit)
SELECT d.file_name, u_owner.name AS owner_name, sd.permission_type, sd.shared_at
FROM Shared_Documents sd
JOIN Documents d ON sd.document_id = d.id
JOIN Users u_owner ON d.user_id = u_owner.id
WHERE sd.shared_with_user_id = 3;

-- 3. UPDATE

-- 3.a Update document file path (e.g., document id 1 was moved to a new bucket/location)
UPDATE Documents 
SET file_path = '/storage/new_bucket/ravi_aadhar.pdf'
WHERE id = 1;

-- 3.b Update sharing permissions (e.g., change Amit's permission on Ravi's BTech degree to DOWNLOAD)
UPDATE Shared_Documents
SET permission_type = 'DOWNLOAD'
WHERE document_id = 2 AND shared_with_user_id = 3;

-- 4. DELETE

-- 4.a Revoke a shared document access (Delete from Shared_Documents)
DELETE FROM Shared_Documents 
WHERE document_id = 3 AND shared_with_user_id = 1;

-- 4.b Delete a document entirely 
-- (Due to ON DELETE CASCADE in the schema, this automatically removes mapped categories and shares related to this document!)
DELETE FROM Documents 
WHERE id = 4;
