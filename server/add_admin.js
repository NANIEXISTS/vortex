
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.create({
            data: {
                username: 'admin',
                passwordHash: hashedPassword,
                role: 'admin'
            }
        });
        console.log('Created user:', user);
    } catch (e) {
        if (e.code === 'P2002') {
            console.log('User admin already exists, updating password...');
            const user = await prisma.user.update({
                where: { username: 'admin' },
                data: { passwordHash: hashedPassword }
            });
            console.log('Updated user:', user);
        } else {
            console.error(e);
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();
