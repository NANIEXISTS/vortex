const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for context data
app.use(express.static(path.join(__dirname, '../dist')));

// AI Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

/* --- Routes --- */

// Login (MERGED: Kept Security Validation)
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    // Security Fix: Validation
    if (typeof username !== 'string' || !username.trim() || username.length > 255) {
        return res.status(400).json({ success: false, message: 'Invalid or missing username' });
    }
    if (typeof password !== 'string' || !password.trim() || password.length > 255) {
        return res.status(400).json({ success: false, message: 'Invalid or missing password' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const token = jwt.sign({ username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
        res.json({ success: true, token, user: { username: user.username, role: user.role } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Data
app.get('/api/data', authenticateToken, async (req, res) => {
    try {
        const schools = await prisma.school.findMany();
        const items = await prisma.item.findMany();
        const publishers = await prisma.publisher.findMany();

        const formattedItems = items.map(i => ({
            ...i,
            createdAt: i.createdAt
        }));

        res.json({
            schools,
            items: formattedItems,
            publishers: publishers.map(p => p.name)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Ingest Data (MERGED: Kept Security Validation)
app.post('/api/ingest', authenticateToken, async (req, res) => {
    const { schoolName, items } = req.body;

    // Security Fix: Validation
    if (typeof schoolName !== 'string' || !schoolName.trim() || schoolName.length > 255) {
        return res.status(400).json({ error: 'Invalid or missing schoolName' });
    }
    if (!Array.isArray(items)) {
        return res.status(400).json({ error: 'items must be an array' });
    }

    // Security Fix: Detailed Item Validation
    for (const item of items) {
        if (!item || typeof item !== 'object' || Array.isArray(item)) {
            return res.status(400).json({ error: 'Invalid item in list' });
        }
        if (typeof item.title !== 'string' || !item.title.trim() || item.title.length > 255) {
            return res.status(400).json({ error: 'Invalid item title' });
        }
        if (typeof item.publisher !== 'string' || !item.publisher.trim() || item.publisher.length > 255) {
            return res.status(400).json({ error: 'Invalid item publisher' });
        }
        if (typeof item.quantity !== 'number') {
            return res.status(400).json({ error: 'Invalid item quantity' });
        }
    }

    try {
        let school = await prisma.school.findUnique({ where: { name: schoolName } });
        if (!school) {
            school = await prisma.school.create({ data: { name: schoolName } });
        }

        const createdItems = [];
        for (const item of items) {
            const newItem = await prisma.item.create({
                data: {
                    title: item.title,
                    publisher: item.publisher,
                    grade: item.grade,
                    quantity: item.quantity,
                    subject: item.subject,
                    schoolId: school.id
                }
            });
            createdItems.push(newItem);
        }

        // Return latest state
        const allItems = await prisma.item.findMany();
        res.json({ success: true, items: allItems });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// Analyze Document (MERGED: Kept Main Branch Async Logic for Performance)
app.post('/api/analyze', authenticateToken, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    try {
        const publishers = await prisma.publisher.findMany();
        const publisherListString = publishers.map(p => p.name).join('", "');

        // Read file & Convert to base64 (Async from Main Branch)
        const fileBuffer = await fs.promises.readFile(req.file.path);
        const base64Data = fileBuffer.toString('base64');
        const mimeType = req.file.mimetype;

        const modelName = 'gemini-flash-latest';

        const prompt = `
            You are Vortex Data Ingestion Engine.
            Analyze the uploaded document.

            Extract the following information in RAW JSON format:
            {
              "schoolName": "...",
              "items": [
                {
                  "title": "...",
                  "publisher": "...",
                  "grade": "...",
                  "quantity": 123,
                  "subject": "..."
                }
              ]
            }

            STRICT NORMALIZATION RULES FOR PUBLISHERS:
            You MUST map every publisher found in the image to one of the following strings EXACTLY:
            ["${publisherListString}"]

            If a publisher on the list is "OUP" or "Oxford", map it to the closest match in the list above.
            If the publisher is NOT in the allowed list, map it to "Other".

            IMPORTANT: Return ONLY the JSON object. No markdown.
        `;

        const response = await ai.models.generateContent({
            model: modelName,
            contents: {
                parts: [
                    { inlineData: { data: base64Data, mimeType } },
                    { text: prompt }
                ]
            }
        });

        // Cleanup uploaded file (Async from Main Branch)
        await fs.promises.unlink(req.file.path);

        let text = "{}";
        if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
            text = response.candidates[0].content.parts[0].text || "{}";
        }

        // Clean markdown
        text = text.trim();
        if (text.startsWith("```json")) {
            text = text.replace(/^```json\n?/, "").replace(/\n?```$/, "");
        } else if (text.startsWith("```")) {
            text = text.replace(/^```\n?/, "").replace(/\n?```$/, "");
        }

        const data = JSON.parse(text);
        res.json(data);

    } catch (e) {
        console.error("AI Error:", e);
        if (req.file) {
            try {
                await fs.promises.unlink(req.file.path);
            } catch (unlinkError) {
                console.error("Error cleaning up file:", unlinkError);
            }
        }
        res.status(500).json({ error: 'AI Processing Failed' });
    }
});

// Chat with Agent (MERGED: Kept Security Validation)
app.post('/api/chat', authenticateToken, async (req, res) => {
    const { query, context } = req.body;

    // Security Fix: Validation
    if (typeof query !== 'string' || !query.trim() || query.length > 2000) {
        return res.status(400).json({ error: 'Invalid or missing query' });
    }
    if (context && (typeof context !== 'object' || Array.isArray(context))) {
        return res.status(400).json({ error: 'Invalid context' });
    }

    try {
        console.log("Received chat query:", query);
        const modelName = 'gemini-flash-latest';

        // Prepare context summary
        let contextString = "No data available.";
        if (context) {
            const itemCount = context.items ? context.items.length : 0;
            const schoolCount = context.schools ? context.schools.length : 0;
            const schoolNames = context.schools ? context.schools.map(s => s.name).join(', ') : '';

            // Summarize items by publisher for sales/volume analysis
            const publisherStats = {};
            if (context.items) {
                context.items.forEach(i => {
                    publisherStats[i.publisher] = (publisherStats[i.publisher] || 0) + (i.quantity || 0);
                });
            }
            const publisherStatsStr = JSON.stringify(publisherStats);

            contextString = `
                Inventory Data Summary:
                - Total Unique Book Items: ${itemCount}
                - Total