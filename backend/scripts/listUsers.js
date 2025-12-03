const path = require('path');

// Force SQLite database URL for local development
process.env.DATABASE_URL = 'file:' + path.join(__dirname, '..', 'prisma', 'dev.db');

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true
      }
    });

    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      console.log('Users in the system:');
      console.log('====================');
      users.forEach(user => {
        console.log(`ID: ${user.id}`);
        console.log(`Username: ${user.username}`);
        console.log(`Email: ${user.email}`);
        console.log(`Created: ${user.createdAt}`);
        console.log('--------------------');
      });
      console.log(`Total: ${users.length} user(s)`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
