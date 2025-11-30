import { PrismaClient } from '@prisma/client';

// Mock Prisma client for tests
global.prisma = new PrismaClient();

// Setup environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/expensetracker_test';

// Clean up after all tests
afterAll(async () => {
  await global.prisma.$disconnect();
});
