const XLSX = require('xlsx');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const prisma = new PrismaClient();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const ai = genAI; // Alias for consistency

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../dist')));

// Simplified Multer for File Uploads
const upload = multer({ dest: 'uploads/' });

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Forbidden' });
        req.user = user;
        next();
    });
};

// Login Route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const token = jwt.sign({ username: user.username, role: user.role, fullName: user.fullName }, process.env.JWT_SECRET, { expiresIn: '8h' });
        res.json({
            success: true,
            token,
            user: {
                username: user.username,
                role: user.role,
                fullName: user.fullName
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Register User
app.post('/api/register', async (req, res) => {
    const { username, password, fullName } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password required' });
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Username already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                username,
                passwordHash: hashedPassword,
                fullName: fullName || '',
                role: 'user' // Default to normal user for self-registration
            }
        });

        // Auto-login after registration
        const token = jwt.sign({ username: user.username, role: user.role, fullName: user.fullName }, process.env.JWT_SECRET, { expiresIn: '8h' });

        res.json({ success: true, token, user: { username: user.username, role: user.role, fullName: user.fullName } });

    } catch (e) {
        console.error("Registration Error:", e);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Change Password
app.post('/api/user/change-password', authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const username = req.user.username;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { username } });

        const validPassword = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!validPassword) {
            return res.status(401).json({ success: false, message: 'Incorrect current password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { username },
            data: { passwordHash: hashedPassword }
        });

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (e) {
        console.error("Password Change Error:", e);
        res.status(500).json({ success: false, message: 'Server error' });
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

// Ingest Data
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

// Analyze Document
app.post('/api/analyze', authenticateToken, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    try {
        const publishers = await prisma.publisher.findMany();
        const publisherListString = publishers.map(p => p.name).join('", "');

        // Read file
        const fileBuffer = await fs.promises.readFile(req.file.path);
        const mimeType = req.file.mimetype;
        const modelName = 'gemini-1.5-flash'; 

        const prompt = `
            You are Vortex Data Ingestion Engine.
            Analyze the uploaded document data.

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
            You MUST map every publisher found to one of the following strings EXACTLY:
            ["${publisherListString}"]

            If a publisher on the list is "OUP" or "Oxford", map it to the closest match in the list above.
            If the publisher is NOT in the allowed list, map it to "Other".

            IMPORTANT: Return ONLY the JSON object. No markdown.
        `;

        let parts = [];
        
        // Check for Excel or CSV
        if (mimeType.includes('sheet') || mimeType.includes('excel') || mimeType.includes('csv') || req.file.originalname.match(/\.(xlsx|xls|csv)$/i)) {
             try {
                 const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
                 const sheetName = workbook.SheetNames[0];
                 const sheet = workbook.Sheets[sheetName];
                 const csv = XLSX.utils.sheet_to_csv(sheet);
                 parts = [{ text: prompt + "\n\nDATA TO ANALYZE (CSV Format):\n" + csv }];
             } catch (parseError) {
                 console.error("Excel Parse Error:", parseError);
                 throw new Error('Failed to parse Excel/CSV file');
             }
        } else {
             // Standard Image/PDF
             const base64Data = fileBuffer.toString('base64');
             parts = [
                { inlineData: { data: base64Data, mimeType } },
                { text: prompt }
            ];
        }

        // Standard GenAI usage
        const model = ai.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(parts);
        const response = result.response;
        let text = response.text();

        // Cleanup
        try { await fs.promises.unlink(req.file.path); } catch (u) {}

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
            try { await fs.promises.unlink(req.file.path); } catch (u) {}
        }
        res.status(500).json({ error: 'AI Processing Failed' });
    }
});

app.post('/api/chat', authenticateToken, async (req, res) => {
    const { query, context } = req.body;

    if (typeof query !== 'string' || !query.trim() || query.length > 2000) {
        return res.status(400).json({ error: 'Invalid or missing query' });
    }

    try {
        console.log("Received chat query:", query);
        const modelName = 'gemini-1.5-flash';

        // Prepare context summary
        let contextString = "No data available.";
        if (context) {
            const itemCount = context.items ? context.items.length : 0;
            const schoolCount = context.schools ? context.schools.length : 0;
            const schoolNames = context.schools ? context.schools.map(s => s.name).join(', ') : '';
            
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
                - Total Schools Serviced: ${schoolCount}
                - School Names: ${schoolNames}
                - Publisher Volume Distribution: ${publisherStatsStr}
            `;
        }

        const prompt = `
            You are Vortex Agent, an AI supply chain assistant.
            
            User Query: "${query}"
            
            Context Data:
            ${contextString}
            
            Instructions:
            - Answer the user's question based strictly on the provided context data.
            - If the user asks about "sales", refer to the 'quantity' of books as sales volume.
            - Be professional, concise, and helpful.
        `;

        // Standard GenAI Usage
        const model = ai.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        res.json({ response: text });

    } catch (e) {
        console.error("AI Chat Error Detailed:", e);
        res.status(500).json({ error: 'Chat Processing Failed', details: e.message });
    }
});

app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
