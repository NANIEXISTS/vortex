const fs = require('fs');

async function main() {
    const BASE_URL = 'http://localhost:3000/api';

    // 1. Login as Admin
    console.log('Logging in as Admin...');
    const loginRes = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'demo', password: 'demo123' })
    });
    const { token } = await loginRes.json();
    console.log('Admin Token:', token ? 'OK' : 'FAIL');

    // 2. Get Me
    console.log('Getting /me...');
    const meRes = await fetch(`${BASE_URL}/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('/me status:', meRes.status);
    console.log('/me data:', await meRes.json());

    // 3. Get Users
    console.log('Getting /users...');
    const usersRes = await fetch(`${BASE_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('/users status:', usersRes.status);
    console.log('/users data:', await usersRes.json());

    // 4. Create User
    console.log('Creating user employee1...');
    const createRes = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: 'employee1', password: 'password123', role: 'user' })
    });
    console.log('Create user status:', createRes.status);
    const createdUser = await createRes.json();
    console.log('Created user:', createdUser);

    // 5. Login as Employee
    console.log('Logging in as Employee...');
    const empLoginRes = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'employee1', password: 'password123' })
    });
    const empData = await empLoginRes.json();
    console.log('Employee Token:', empData.token ? 'OK' : 'FAIL');

    // 6. Access Admin Route as Employee
    console.log('Accessing /users as Employee...');
    const forbiddenRes = await fetch(`${BASE_URL}/users`, {
        headers: { 'Authorization': `Bearer ${empData.token}` }
    });
    console.log('Forbidden status (expect 403):', forbiddenRes.status);
}

main().catch(console.error);
