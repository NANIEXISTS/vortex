
const test = require('node:test');
const assert = require('node:assert');
const { spawn } = require('child_process');
const http = require('http');

// This script simulates a user flow by:
// 1. Starting the full application stack (server which serves the React build)
// 2. Performing a sequence of HTTP requests that mimic a user's actions
// 3. Verifying the application state at each step

const PORT = 3002;
let serverProcess;

function waitForServer(port) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const interval = setInterval(() => {
      if (Date.now() - start > 10000) {
        clearInterval(interval);
        reject(new Error('Server timeout'));
      }
      const req = http.get(`http://localhost:${port}/`, (res) => {
        if (res.statusCode === 200) {
          clearInterval(interval);
          resolve();
        }
      });
      req.on('error', () => {}); // Ignore errors while waiting
      req.end();
    }, 500);
  });
}

test.before(async () => {
    console.log('Starting server for User Simulation...');

    // Start the server process, overriding PORT
    serverProcess = spawn('node', ['server/index.js'], {
        env: { ...process.env, PORT: PORT, DATABASE_URL: 'file:./dev.db' },
        stdio: 'inherit' // Pipe output to console for debugging
    });

    await waitForServer(PORT);
    console.log('Server is up and running.');
});

test.after(() => {
    if (serverProcess) {
        console.log('Stopping server...');
        serverProcess.kill();
    }
});

test('User Journey Simulation', async (t) => {
    let authToken;

    await t.test('1. User visits the home page', async () => {
        const response = await fetch(`http://localhost:${PORT}/`);
        assert.strictEqual(response.status, 200);
        const text = await response.text();
        assert.ok(text.includes('<title>Vortex AI</title>'), 'Page title should be Vortex AI');
    });

    await t.test('2. User logs in with demo credentials', async () => {
        const response = await fetch(`http://localhost:${PORT}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'demo', password: 'demo123' })
        });

        assert.strictEqual(response.status, 200);
        const data = await response.json();
        assert.ok(data.success, 'Login should be successful');
        authToken = data.token;
        assert.ok(authToken, 'Token should be received');
    });

    await t.test('3. User views the dashboard (data fetch)', async () => {
        const response = await fetch(`http://localhost:${PORT}/api/data`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        assert.strictEqual(response.status, 200);
        const data = await response.json();

        // Check if basic data structures are present
        assert.ok(Array.isArray(data.items), 'Should receive items list');
        assert.ok(Array.isArray(data.schools), 'Should receive schools list');

        console.log(`User sees ${data.items.length} items and ${data.schools.length} schools.`);
    });

    await t.test('4. User simulates uploading a file (Analyze Endpoint)', async () => {
        // Since we cannot easily upload a real file via fetch without FormData logic that matches browser exactly,
        // and we don't have a real Gemini Key, we expect a 500 error or specific handling.
        // However, we can test that the endpoint protects itself against bad requests (no file).

        const response = await fetch(`http://localhost:${PORT}/api/analyze`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        // Expect 400 Bad Request because no file was attached
        assert.strictEqual(response.status, 400);
        const data = await response.json();
        assert.strictEqual(data.error, 'No file uploaded');
    });

    await t.test('5. User asks a question to the Chat Agent', async () => {
        const response = await fetch(`http://localhost:${PORT}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                query: "How many books do we have?",
                context: { items: [], schools: [] } // Sending empty context for simulation
            })
        });

        // Since we are using a dummy key, the Google API will reject the request.
        // The server catches this error and returns 500.
        // In a real environment with a valid key, this would be 200.
        // For this test simulation without external dependencies, we accept 500 as "Server handled the request (even if it failed upstream)".

        if (response.status === 200) {
            const data = await response.json();
            assert.ok(data.response, 'Should receive a chat response');
            console.log('Agent says:', data.response);
        } else {
             assert.strictEqual(response.status, 500);
             const data = await response.json();
             assert.ok(data.error === 'AI Chat Failed', 'Should report AI failure due to missing key');
             console.log('Agent failed (expected with dummy key):', data.error);
        }
    });
});
