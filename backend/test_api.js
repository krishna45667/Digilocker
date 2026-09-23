const http = require('http');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const initDB = require('./config/initDB');
const User = require('./models/User');
const Category = require('./models/Category');
const Document = require('./models/Document');
const SharedDocument = require('./models/SharedDocument');

const PORT = 5099; // Isolated test port
process.env.PORT = PORT;

const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/share', require('./routes/shareRoutes'));
app.use(errorHandler);

let server;

const request = (method, path, body = null, token = null) => {
    return new Promise((resolve, reject) => {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const req = http.request(
            {
                hostname: '127.0.0.1',
                port: PORT,
                path: `/api${path}`,
                method,
                headers,
            },
            (res) => {
                let data = '';
                res.on('data', (chunk) => (data += chunk));
                res.on('end', () => {
                    try {
                        const parsed = data ? JSON.parse(data) : {};
                        resolve({ status: res.statusCode, data: parsed });
                    } catch (e) {
                        resolve({ status: res.statusCode, data });
                    }
                });
            }
        );
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
};

const uploadFileRequest = (filePath, fileName, categoryId, token) => {
    return new Promise((resolve, reject) => {
        const form = new FormData();
        form.append('document', fs.createReadStream(filePath));
        if (fileName) form.append('fileName', fileName);
        if (categoryId) form.append('category_id', categoryId);

        const formHeaders = form.getHeaders();
        if (token) formHeaders['Authorization'] = `Bearer ${token}`;

        const req = http.request(
            {
                hostname: '127.0.0.1',
                port: PORT,
                path: '/api/documents',
                method: 'POST',
                headers: formHeaders,
            },
            (res) => {
                let data = '';
                res.on('data', (chunk) => (data += chunk));
                res.on('end', () => {
                    try {
                        resolve({ status: res.statusCode, data: JSON.parse(data) });
                    } catch (e) {
                        resolve({ status: res.statusCode, data });
                    }
                });
            }
        );
        req.on('error', reject);
        form.pipe(req);
    });
};

async function runTests() {
    try {
        console.log('--- Starting MongoDB Backend Integration Tests ---');
        await initDB();

        server = app.listen(PORT);
        console.log(`Test server running on port ${PORT}`);

        // Cleanup test users if existing
        await User.deleteMany({ email: { $in: ['test_user1@example.com', 'test_user2@example.com'] } });

        // Test 1: Categories seeded
        const catsRes = await request('GET', '/categories');
        console.log('✔ Test 1: GET /api/categories -> Count:', catsRes.data.length);
        if (catsRes.data.length === 0) throw new Error('Categories were not seeded');
        const defaultCategory = catsRes.data[0];

        // Test 2: User 1 Registration
        const user1Reg = await request('POST', '/auth/register', {
            name: 'Ravi Kumar',
            email: 'test_user1@example.com',
            password: 'password123',
        });
        console.log('✔ Test 2: User 1 Registered -> ID:', user1Reg.data.id);
        if (user1Reg.status !== 201 || !user1Reg.data.token) throw new Error('User 1 registration failed');
        const user1Token = user1Reg.data.token;

        // Test 3: User 2 Registration
        const user2Reg = await request('POST', '/auth/register', {
            name: 'Amit Patel',
            email: 'test_user2@example.com',
            password: 'password456',
        });
        console.log('✔ Test 3: User 2 Registered -> ID:', user2Reg.data.id);
        if (user2Reg.status !== 201) throw new Error('User 2 registration failed');
        const user2Token = user2Reg.data.token;

        // Test 4: User 1 Login
        const user1Login = await request('POST', '/auth/login', {
            email: 'test_user1@example.com',
            password: 'password123',
        });
        console.log('✔ Test 4: User 1 Login success');
        if (user1Login.status !== 200 || !user1Login.data.token) throw new Error('User 1 login failed');

        // Test 5: Upload Document for User 1
        const dummyFilePath = path.join(__dirname, 'dummy_test_doc.pdf');
        fs.writeFileSync(dummyFilePath, '%PDF-1.4 sample content for DigiLocker test.');
        
        const uploadRes = await uploadFileRequest(dummyFilePath, 'Aadhar Card Scan', defaultCategory.id, user1Token);
        console.log('✔ Test 5: Upload Document status:', uploadRes.status, 'body:', uploadRes.data);
        if (uploadRes.status !== 201 || !uploadRes.data.id) throw new Error('Document upload failed');
        const docId = uploadRes.data.id;

        // Test 6: Fetch Documents for User 1
        const user1Docs = await request('GET', '/documents', null, user1Token);
        console.log('✔ Test 6: GET /api/documents for User 1 -> Count:', user1Docs.data.length);
        if (user1Docs.data.length !== 1 || user1Docs.data[0].id !== docId) throw new Error('Document list mismatch');

        // Test 7: Update Document Name
        const updateDocRes = await request('PUT', `/documents/${docId}`, { file_name: 'Aadhar Card Final' }, user1Token);
        console.log('✔ Test 7: PUT /api/documents/:id ->', updateDocRes.data.message);
        if (updateDocRes.status !== 200) throw new Error('Document update failed');

        // Test 8: Share Document with User 2
        const shareRes = await request(
            'POST',
            '/share',
            {
                document_id: docId,
                shared_with_email: 'test_user2@example.com',
                permission_type: 'DOWNLOAD',
            },
            user1Token
        );
        console.log('✔ Test 8: Share Document -> Share ID:', shareRes.data.share_id);
        if (shareRes.status !== 201) throw new Error('Document sharing failed');

        // Test 9: Get Shared Documents as User 2
        const user2Shares = await request('GET', '/share', null, user2Token);
        console.log('✔ Test 9: GET /api/share for User 2 -> Count:', user2Shares.data.length, 'Owner:', user2Shares.data[0]?.owner_name);
        if (user2Shares.data.length !== 1 || user2Shares.data[0].file_name !== 'Aadhar Card Final') {
            throw new Error('Shared documents list mismatch');
        }

        // Test 10: Delete Document and Verify Cascade Deletion
        const deleteDocRes = await request('DELETE', `/documents/${docId}`, null, user1Token);
        console.log('✔ Test 10: DELETE /api/documents/:id ->', deleteDocRes.data.message);
        if (deleteDocRes.status !== 200) throw new Error('Document deletion failed');

        const remainingShares = await SharedDocument.countDocuments({ document: docId });
        console.log('✔ Test 10.b: Cascading check in MongoDB -> Remaining shares count for deleted doc:', remainingShares);
        if (remainingShares !== 0) throw new Error('Cascade deletion failed');

        // Clean up dummy file
        if (fs.existsSync(dummyFilePath)) fs.unlinkSync(dummyFilePath);

        console.log('\n=============================================');
        console.log('🎉 ALL 10 MONGODB INTEGRATION TESTS PASSED!');
        console.log('=============================================\n');
    } catch (err) {
        console.error('❌ Test failed with error:', err);
        process.exitCode = 1;
    } finally {
        if (server) server.close();
        await mongoose.connection.close();
        process.exit(process.exitCode || 0);
    }
}

runTests();
