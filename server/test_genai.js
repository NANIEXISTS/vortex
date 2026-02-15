
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
    try {
        console.log('Testing generateContent...');
        const response = await client.models.generateContent({
            model: 'gemini-flash-latest',
            contents: {
                parts: [
                    { text: 'Hello' }
                ]
            }
        });

        console.log('Response keys:', Object.keys(response));
        console.log('Response:', JSON.stringify(response, null, 2));

        if (typeof response.text === 'function') {
            console.log('response.text():', response.text());
        } else {
            console.log('response.text is NOT a function');
        }

    } catch (e) {
        console.error('Error:', e);
    }
}

test();
