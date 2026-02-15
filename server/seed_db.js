const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash('demo123', 10);

    await prisma.user.upsert({
        where: { username: 'demo' },
        update: {},
        create: {
            username: 'demo',
            passwordHash,
            role: 'admin'
        },
    });

    const publisherNames = [
        'Oxford University Press',
        'Cambridge University Press',
        'Pearson',
        'Macmillan',
        'S. Chand',
        'Orient Blackswan',
        'NCERT',
        'Ratna Sagar'
    ];

    for (const name of publisherNames) {
        try {
            await prisma.publisher.upsert({
                where: { name },
                update: {},
                create: { name },
            });
        } catch (e) {
            // ignore unique constraint
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
