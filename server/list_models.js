
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function listModels() {
    try {
        const models = await client.models.list();
        console.log('Models:', models);
    } catch (e) {
        console.error('Error listing models:', e);
    }
}

listModels();
