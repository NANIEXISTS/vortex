
const bcrypt = require('bcryptjs');

const hash = '$2b$10$EOdXSuM1g6ehLfYGFFBCJuqsl7MteepxOiO7xcf.ozVnOKFRdtDV2';

async function check() {
    console.log('Checking "demo123":', await bcrypt.compare('demo123', hash));
    console.log('Checking "password123":', await bcrypt.compare('password123', hash));

    // Generate new hash for demo123 just in case
    const newHash = await bcrypt.hash('demo123', 10);
    console.log('New hash for "demo123":', newHash);
}

check();
