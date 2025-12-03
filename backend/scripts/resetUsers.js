const path = require('path');
process.env.DATABASE_URL = 'file:' + path.join(__dirname, '..', 'prisma', 'dev.db');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function reset() {
  const result = await prisma.user.deleteMany({});
  console.log('Deleted', result.count, 'users');
  await prisma.$disconnect();
}

reset();
