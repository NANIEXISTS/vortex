
const test = require('node:test');
const assert = require('node:assert');
const app = require('../index');
const jwt = require('jsonwebtoken');

// Mock external dependencies
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to start/stop server
let server;
const PORT = 3001;

test.before(async () => {
    // Ensure we are using test DB
    // Seed test data if needed
    server = app.listen(PORT);
});

test.after(() => {
    server.close();
    prisma.$disconnect();
});

test.describe('Authentication API', () => {
    test('POST /api/login should succeed with valid credentials', async () => {
        const response = await fetch(`http://localhost:${PORT}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'demo', password: 'demo123' })
        });

        assert.strictEqual(response.status, 200);
        const data = await response.json();
        assert.ok(data.success);
        assert.ok(data.token);
    });

    test('POST /api/login should fail with invalid credentials', async () => {
        const response = await fetch(`http://localhost:${PORT}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'demo', password: 'wrongpassword' })
        });

        assert.strictEqual(response.status, 401);
    });
});

test.describe('Data Retrieval API', () => {
    let token;

    test.before(async () => {
        // Login to get token
        const response = await fetch(`http://localhost:${PORT}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'demo', password: 'demo123' })
        });
        const data = await response.json();
        token = data.token;
    });

    test('GET /api/data should return inventory data', async () => {
        const response = await fetch(`http://localhost:${PORT}/api/data`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        assert.strictEqual(response.status, 200);
        const data = await response.json();

        assert.ok(Array.isArray(data.schools));
        assert.ok(Array.isArray(data.items));
        assert.ok(Array.isArray(data.publishers));
    });

    test('GET /api/data without token should be unauthorized', async () => {
        const response = await fetch(`http://localhost:${PORT}/api/data`);
        assert.strictEqual(response.status, 401);
    });
});

test.describe('Data Ingestion API', () => {
    let token;

    test.before(async () => {
        const response = await fetch(`http://localhost:${PORT}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'demo', password: 'demo123' })
        });
        const data = await response.json();
        token = data.token;
    });

    test('POST /api/ingest should add new items', async () => {
        const newItem = {
            title: 'Test Book',
            publisher: 'Pearson',
            grade: '10',
            quantity: 50,
            subject: 'Math'
        };

        const response = await fetch(`http://localhost:${PORT}/api/ingest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                schoolName: 'Test School',
                items: [newItem]
            })
        });

        assert.strictEqual(response.status, 200);
        const data = await response.json();
        assert.ok(data.success);

        // Verify item was added
        const addedItem = data.items.find(i => i.title === 'Test Book');
        assert.ok(addedItem);
        assert.strictEqual(addedItem.quantity, 50);
    });
});
