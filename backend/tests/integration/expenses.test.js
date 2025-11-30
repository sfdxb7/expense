import request from 'supertest';
import express from 'express';
import path from 'path';
import fs from 'fs';
import expenseRoutes from '../../src/routes/expenses.js';
import authMiddleware from '../../src/middleware/auth.js';
import {
  createTestUser,
  createTestProperty,
  createTestCategory,
  createTestExpense,
  generateTestToken,
  cleanupTestData,
  prisma,
} from '../helpers/testHelpers.js';

const app = express();
app.use(express.json());
app.use(authMiddleware);
app.use('/api/expenses', expenseRoutes);

describe('Expenses API', () => {
  let testUser;
  let authToken;
  let testProperty;
  let testCategory;

  beforeEach(async () => {
    await cleanupTestData();
    testUser = await createTestUser({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });
    authToken = generateTestToken(testUser.id);
    testProperty = await createTestProperty(testUser.id);
    testCategory = await createTestCategory(testProperty.id, {
      name: 'Test Category',
    });
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  describe('GET /api/expenses/property/:propertyId', () => {
    it('should return all expenses for a property', async () => {
      await createTestExpense(testProperty.id, testCategory.id, {
        description: 'Expense 1',
        amount: 100,
      });
      await createTestExpense(testProperty.id, testCategory.id, {
        description: 'Expense 2',
        amount: 200,
      });

      const response = await request(app)
        .get(`/api/expenses/property/${testProperty.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('category');
      expect(response.body[0].category).toHaveProperty('name', 'Test Category');
    });

    it('should filter expenses by date range', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      await createTestExpense(testProperty.id, testCategory.id, {
        date: yesterday,
        description: 'Yesterday',
      });
      await createTestExpense(testProperty.id, testCategory.id, {
        date: twoDaysAgo,
        description: 'Two days ago',
      });

      const response = await request(app)
        .get(`/api/expenses/property/${testProperty.id}`)
        .query({
          startDate: yesterday.toISOString(),
          endDate: today.toISOString(),
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('description', 'Yesterday');
    });

    it('should filter expenses by category', async () => {
      const category2 = await createTestCategory(testProperty.id, {
        name: 'Category 2',
      });

      await createTestExpense(testProperty.id, testCategory.id, {
        description: 'Category 1 Expense',
      });
      await createTestExpense(testProperty.id, category2.id, {
        description: 'Category 2 Expense',
      });

      const response = await request(app)
        .get(`/api/expenses/property/${testProperty.id}`)
        .query({ categoryId: testCategory.id })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('description', 'Category 1 Expense');
    });

    it('should not allow access to other users properties', async () => {
      const otherUser = await createTestUser({
        username: 'otheruser',
        email: 'other@example.com',
      });
      const otherProperty = await createTestProperty(otherUser.id);

      const response = await request(app)
        .get(`/api/expenses/property/${otherProperty.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/expenses/property/:propertyId', () => {
    it('should create a new expense', async () => {
      const expenseData = {
        date: new Date().toISOString(),
        amount: 150.50,
        description: 'New Expense',
        categoryId: testCategory.id,
      };

      const response = await request(app)
        .post(`/api/expenses/property/${testProperty.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(expenseData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('amount', '150.50');
      expect(response.body).toHaveProperty('description', 'New Expense');
      expect(response.body).toHaveProperty('categoryId', testCategory.id);
    });

    it('should fail without required fields', async () => {
      const response = await request(app)
        .post(`/api/expenses/property/${testProperty.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Missing required fields',
        });

      expect(response.status).toBe(400);
    });

    it('should fail with invalid category', async () => {
      const response = await request(app)
        .post(`/api/expenses/property/${testProperty.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: new Date().toISOString(),
          amount: 100,
          categoryId: 99999,
        });

      expect(response.status).toBe(400);
    });

    it('should not allow creating expense in other users property', async () => {
      const otherUser = await createTestUser({
        username: 'otheruser',
        email: 'other@example.com',
      });
      const otherProperty = await createTestProperty(otherUser.id);

      const response = await request(app)
        .post(`/api/expenses/property/${otherProperty.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: new Date().toISOString(),
          amount: 100,
          description: 'Unauthorized',
          categoryId: testCategory.id,
        });

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/expenses/property/:propertyId/:id', () => {
    it('should update an expense', async () => {
      const expense = await createTestExpense(testProperty.id, testCategory.id, {
        description: 'Original',
        amount: 100,
      });

      const response = await request(app)
        .put(`/api/expenses/property/${testProperty.id}/${expense.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Updated',
          amount: 200,
          categoryId: testCategory.id,
          date: expense.date.toISOString(),
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('description', 'Updated');
      expect(response.body).toHaveProperty('amount', '200');
    });

    it('should not allow updating other users expenses', async () => {
      const otherUser = await createTestUser({
        username: 'otheruser',
        email: 'other@example.com',
      });
      const otherProperty = await createTestProperty(otherUser.id);
      const otherCategory = await createTestCategory(otherProperty.id);
      const otherExpense = await createTestExpense(
        otherProperty.id,
        otherCategory.id
      );

      const response = await request(app)
        .put(`/api/expenses/property/${otherProperty.id}/${otherExpense.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Hacked',
          amount: 999,
          categoryId: otherCategory.id,
          date: new Date().toISOString(),
        });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/expenses/property/:propertyId/:id', () => {
    it('should delete an expense', async () => {
      const expense = await createTestExpense(
        testProperty.id,
        testCategory.id
      );

      const response = await request(app)
        .delete(`/api/expenses/property/${testProperty.id}/${expense.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Expense deleted');

      // Verify it's deleted
      const expenses = await prisma.expense.findMany({
        where: { id: expense.id },
      });
      expect(expenses).toHaveLength(0);
    });

    it('should not allow deleting other users expenses', async () => {
      const otherUser = await createTestUser({
        username: 'otheruser',
        email: 'other@example.com',
      });
      const otherProperty = await createTestProperty(otherUser.id);
      const otherCategory = await createTestCategory(otherProperty.id);
      const otherExpense = await createTestExpense(
        otherProperty.id,
        otherCategory.id
      );

      const response = await request(app)
        .delete(`/api/expenses/property/${otherProperty.id}/${otherExpense.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });
  });
});
