import request from 'supertest';
import express from 'express';
import categoryRoutes from '../../src/routes/categories.js';
import authMiddleware from '../../src/middleware/auth.js';
import {
  createTestUser,
  createTestProperty,
  createTestCategory,
  generateTestToken,
  cleanupTestData,
  prisma,
} from '../helpers/testHelpers.js';

const app = express();
app.use(express.json());
app.use(authMiddleware);
app.use('/api/categories', categoryRoutes);

describe('Categories API', () => {
  let testUser;
  let authToken;
  let testProperty;

  beforeEach(async () => {
    await cleanupTestData();
    testUser = await createTestUser({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });
    authToken = generateTestToken(testUser.id);
    testProperty = await createTestProperty(testUser.id);
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  describe('GET /api/categories/property/:propertyId', () => {
    it('should return all categories for a property', async () => {
      await createTestCategory(testProperty.id, { name: 'Category 1' });
      await createTestCategory(testProperty.id, { name: 'Category 2' });

      const response = await request(app)
        .get(`/api/categories/property/${testProperty.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('_count');
    });

    it('should return empty array when property has no categories', async () => {
      const response = await request(app)
        .get(`/api/categories/property/${testProperty.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    it('should not allow access to other users properties', async () => {
      const otherUser = await createTestUser({
        username: 'otheruser',
        email: 'other@example.com',
      });
      const otherProperty = await createTestProperty(otherUser.id);

      const response = await request(app)
        .get(`/api/categories/property/${otherProperty.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/categories/property/:propertyId', () => {
    it('should create a new category', async () => {
      const response = await request(app)
        .post(`/api/categories/property/${testProperty.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'New Category',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'New Category');
      expect(response.body).toHaveProperty('propertyId', testProperty.id);
    });

    it('should fail without name', async () => {
      const response = await request(app)
        .post(`/api/categories/property/${testProperty.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('should fail with duplicate category name in same property', async () => {
      await createTestCategory(testProperty.id, { name: 'Duplicate' });

      const response = await request(app)
        .post(`/api/categories/property/${testProperty.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Duplicate',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        'error',
        'Category already exists in this property'
      );
    });

    it('should allow same category name in different properties', async () => {
      const property2 = await createTestProperty(testUser.id, {
        name: 'Property 2',
      });

      await createTestCategory(testProperty.id, { name: 'Same Name' });

      const response = await request(app)
        .post(`/api/categories/property/${property2.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Same Name',
        });

      expect(response.status).toBe(201);
    });
  });

  describe('PUT /api/categories/property/:propertyId/:id', () => {
    it('should update a category', async () => {
      const category = await createTestCategory(testProperty.id, {
        name: 'Original Name',
      });

      const response = await request(app)
        .put(`/api/categories/property/${testProperty.id}/${category.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Updated Name');
    });

    it('should not allow updating to duplicate name', async () => {
      const category1 = await createTestCategory(testProperty.id, {
        name: 'Category 1',
      });
      const category2 = await createTestCategory(testProperty.id, {
        name: 'Category 2',
      });

      const response = await request(app)
        .put(`/api/categories/property/${testProperty.id}/${category2.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Category 1',
        });

      expect(response.status).toBe(400);
    });

    it('should not allow updating other users categories', async () => {
      const otherUser = await createTestUser({
        username: 'otheruser',
        email: 'other@example.com',
      });
      const otherProperty = await createTestProperty(otherUser.id);
      const otherCategory = await createTestCategory(otherProperty.id);

      const response = await request(app)
        .put(`/api/categories/property/${otherProperty.id}/${otherCategory.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Hacked',
        });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/categories/property/:propertyId/:id', () => {
    it('should delete a category', async () => {
      const category = await createTestCategory(testProperty.id);

      const response = await request(app)
        .delete(`/api/categories/property/${testProperty.id}/${category.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Category deleted');

      // Verify it's deleted
      const categories = await prisma.category.findMany({
        where: { id: category.id },
      });
      expect(categories).toHaveLength(0);
    });

    it('should cascade delete expenses when category is deleted', async () => {
      const category = await createTestCategory(testProperty.id);
      const expense = await prisma.expense.create({
        data: {
          date: new Date(),
          amount: 100,
          description: 'Test',
          categoryId: category.id,
          propertyId: testProperty.id,
        },
      });

      await request(app)
        .delete(`/api/categories/property/${testProperty.id}/${category.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Verify expense is also deleted
      const expenses = await prisma.expense.findMany({
        where: { id: expense.id },
      });
      expect(expenses).toHaveLength(0);
    });
  });
});
