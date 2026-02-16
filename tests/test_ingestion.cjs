const fs = require('fs');
const path = require('path');

async function main() {
    const LOGIN_URL = 'http://localhost:3000/api/login';
    const ANALYZE_URL = 'http://localhost:3000/api/analyze';

    // 1. Login
    console.log('Logging in...');
    const loginRes = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'demo', password: 'demo123' })
    });

    if (!loginRes.ok) {
        console.error('Login failed:', await loginRes.text());
        return;
    }

    const { token } = await loginRes.json();
    console.log('Got token:', token);

    // 2. Create dummy file
    const filePath = path.join(__dirname, 'dummy.txt');
    fs.writeFileSync(filePath, 'Test file content');

    // 3. Upload file
    const fileContent = fs.readFileSync(filePath);
    const fileBlob = new Blob([fileContent], { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', fileBlob, 'dummy.txt');

    console.log('Uploading file...');
    const analyzeRes = await fetch(ANALYZE_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });

    console.log('Status:', analyzeRes.status);
    const result = await analyzeRes.json();
    console.log('Result:', result);

    // Cleanup
    fs.unlinkSync(filePath);
}

main().catch(console.error);
