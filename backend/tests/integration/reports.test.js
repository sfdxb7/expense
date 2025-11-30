import request from 'supertest';
import express from 'express';
import reportRoutes from '../../src/routes/reports.js';
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
app.use('/api/reports', reportRoutes);

describe('Reports API', () => {
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

  describe('GET /api/reports/property/:propertyId', () => {
    it('should generate a basic report', async () => {
      await createTestExpense(testProperty.id, testCategory.id, {
        amount: 100,
        description: 'Expense 1',
      });
      await createTestExpense(testProperty.id, testCategory.id, {
        amount: 200,
        description: 'Expense 2',
      });

      const response = await request(app)
        .get(`/api/reports/property/${testProperty.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalExpenses', '300');
      expect(response.body).toHaveProperty('expenseCount', 2);
      expect(response.body).toHaveProperty('categoryBreakdown');
      expect(Array.isArray(response.body.categoryBreakdown)).toBe(true);
    });

    it('should filter report by date range', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);

      await createTestExpense(testProperty.id, testCategory.id, {
        date: yesterday,
        amount: 100,
      });
      await createTestExpense(testProperty.id, testCategory.id, {
        date: lastWeek,
        amount: 200,
      });

      const response = await request(app)
        .get(`/api/reports/property/${testProperty.id}`)
        .query({
          startDate: yesterday.toISOString(),
          endDate: today.toISOString(),
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalExpenses', '100');
      expect(response.body).toHaveProperty('expenseCount', 1);
    });

    it('should include category breakdown', async () => {
      const category2 = await createTestCategory(testProperty.id, {
        name: 'Category 2',
      });

      await createTestExpense(testProperty.id, testCategory.id, { amount: 100 });
      await createTestExpense(testProperty.id, testCategory.id, { amount: 150 });
      await createTestExpense(testProperty.id, category2.id, { amount: 200 });

      const response = await request(app)
        .get(`/api/reports/property/${testProperty.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.categoryBreakdown).toHaveLength(2);

      const cat1Breakdown = response.body.categoryBreakdown.find(
        (c) => c.categoryName === 'Test Category'
      );
      expect(cat1Breakdown).toHaveProperty('total', '250');
      expect(cat1Breakdown).toHaveProperty('count', 2);

      const cat2Breakdown = response.body.categoryBreakdown.find(
        (c) => c.categoryName === 'Category 2'
      );
      expect(cat2Breakdown).toHaveProperty('total', '200');
      expect(cat2Breakdown).toHaveProperty('count', 1);
    });

    it('should not allow access to other users properties', async () => {
      const otherUser = await createTestUser({
        username: 'otheruser',
        email: 'other@example.com',
      });
      const otherProperty = await createTestProperty(otherUser.id);

      const response = await request(app)
        .get(`/api/reports/property/${otherProperty.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/reports/property/:propertyId/year/:year', () => {
    it('should generate a yearly report', async () => {
      const currentYear = new Date().getFullYear();

      await createTestExpense(testProperty.id, testCategory.id, {
        date: new Date(currentYear, 0, 15), // January
        amount: 100,
      });
      await createTestExpense(testProperty.id, testCategory.id, {
        date: new Date(currentYear, 5, 15), // June
        amount: 200,
      });
      await createTestExpense(testProperty.id, testCategory.id, {
        date: new Date(currentYear - 1, 0, 15), // Last year
        amount: 300,
      });

      const response = await request(app)
        .get(`/api/reports/property/${testProperty.id}/year/${currentYear}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('year', currentYear);
      expect(response.body).toHaveProperty('totalExpenses', '300');
      expect(response.body).toHaveProperty('expenseCount', 2);
      expect(response.body).toHaveProperty('monthlyBreakdown');
      expect(Array.isArray(response.body.monthlyBreakdown)).toBe(true);
      expect(response.body.monthlyBreakdown).toHaveLength(12);
    });

    it('should include monthly breakdown with all 12 months', async () => {
      const currentYear = new Date().getFullYear();

      const response = await request(app)
        .get(`/api/reports/property/${testProperty.id}/year/${currentYear}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.monthlyBreakdown).toHaveLength(12);

      // Check that all months are present
      const months = response.body.monthlyBreakdown.map((m) => m.month);
      expect(months).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    });

    it('should populate months with expenses correctly', async () => {
      const currentYear = new Date().getFullYear();

      await createTestExpense(testProperty.id, testCategory.id, {
        date: new Date(currentYear, 0, 15), // January (month 0)
        amount: 100,
      });
      await createTestExpense(testProperty.id, testCategory.id, {
        date: new Date(currentYear, 0, 20), // Another January expense
        amount: 50,
      });

      const response = await request(app)
        .get(`/api/reports/property/${testProperty.id}/year/${currentYear}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      const januaryData = response.body.monthlyBreakdown.find((m) => m.month === 1);
      expect(januaryData).toHaveProperty('total', '150');
      expect(januaryData).toHaveProperty('count', 2);

      const februaryData = response.body.monthlyBreakdown.find((m) => m.month === 2);
      expect(februaryData).toHaveProperty('total', '0');
      expect(februaryData).toHaveProperty('count', 0);
    });
  });
});
