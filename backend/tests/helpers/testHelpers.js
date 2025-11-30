import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generate a JWT token for testing
 */
export const generateTestToken = (userId = 1) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

/**
 * Hash a password for testing
 */
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

/**
 * Create a test user
 */
export const createTestUser = async (data = {}) => {
  const hashedPassword = await hashPassword(data.password || 'testpassword123');

  return await prisma.user.create({
    data: {
      username: data.username || `testuser_${Date.now()}`,
      email: data.email || `test_${Date.now()}@example.com`,
      password: hashedPassword,
    },
  });
};

/**
 * Create a test property
 */
export const createTestProperty = async (userId, data = {}) => {
  return await prisma.property.create({
    data: {
      name: data.name || `Test Property ${Date.now()}`,
      description: data.description || 'Test property description',
      userId,
    },
  });
};

/**
 * Create a test category
 */
export const createTestCategory = async (propertyId, data = {}) => {
  return await prisma.category.create({
    data: {
      name: data.name || `Test Category ${Date.now()}`,
      propertyId,
    },
  });
};

/**
 * Create a test expense
 */
export const createTestExpense = async (propertyId, categoryId, data = {}) => {
  return await prisma.expense.create({
    data: {
      date: data.date || new Date(),
      amount: data.amount || 100.50,
      description: data.description || 'Test expense',
      categoryId,
      propertyId,
      receiptPath: data.receiptPath,
    },
  });
};

/**
 * Create a test debtor
 */
export const createTestDebtor = async (propertyId, data = {}) => {
  return await prisma.debtor.create({
    data: {
      name: data.name || `Test Debtor ${Date.now()}`,
      propertyId,
    },
  });
};

/**
 * Create a test payment
 */
export const createTestPayment = async (debtorId, data = {}) => {
  return await prisma.payment.create({
    data: {
      amount: data.amount || 50.00,
      date: data.date || new Date(),
      notes: data.notes || 'Test payment',
      debtorId,
    },
  });
};

/**
 * Clean up test data
 */
export const cleanupTestData = async () => {
  await prisma.payment.deleteMany({});
  await prisma.debtor.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.user.deleteMany({
    where: {
      email: {
        contains: '@example.com'
      }
    }
  });
};

/**
 * Clean up specific user and all related data
 */
export const cleanupUser = async (userId) => {
  await prisma.user.delete({
    where: { id: userId }
  });
};

export { prisma };
