import request from 'supertest';
import express from 'express';
import propertyRoutes from '../../src/routes/properties.js';
import authMiddleware from '../../src/middleware/auth.js';
import {
  createTestUser,
  createTestProperty,
  generateTestToken,
  cleanupTestData,
  prisma,
} from '../helpers/testHelpers.js';

const app = express();
app.use(express.json());
app.use(authMiddleware);
app.use('/api/properties', propertyRoutes);

describe('Properties API', () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    await cleanupTestData();
    testUser = await createTestUser({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });
    authToken = generateTestToken(testUser.id);
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  describe('GET /api/properties', () => {
    it('should return all properties for authenticated user', async () => {
      // Create test properties
      await createTestProperty(testUser.id, { name: 'Property 1' });
      await createTestProperty(testUser.id, { name: 'Property 2' });

      const response = await request(app)
        .get('/api/properties')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('name', 'Property 1');
      expect(response.body[1]).toHaveProperty('name', 'Property 2');
    });

    it('should return empty array when user has no properties', async () => {
      const response = await request(app)
        .get('/api/properties')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    it('should include counts for categories, expenses, and debtors', async () => {
      const property = await createTestProperty(testUser.id);

      const response = await request(app)
        .get('/api/properties')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body[0]).toHaveProperty('_count');
      expect(response.body[0]._count).toHaveProperty('categories');
      expect(response.body[0]._count).toHaveProperty('expenses');
      expect(response.body[0]._count).toHaveProperty('debtors');
    });
  });

  describe('GET /api/properties/:id', () => {
    it('should return a single property with details', async () => {
      const property = await createTestProperty(testUser.id, {
        name: 'Test Property',
        description: 'Test Description',
      });

      const response = await request(app)
        .get(`/api/properties/${property.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', property.id);
      expect(response.body).toHaveProperty('name', 'Test Property');
      expect(response.body).toHaveProperty('description', 'Test Description');
      expect(response.body).toHaveProperty('categories');
      expect(response.body).toHaveProperty('debtors');
    });

    it('should return 404 for non-existent property', async () => {
      const response = await request(app)
        .get('/api/properties/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Property not found');
    });

    it('should not allow access to other users properties', async () => {
      // Create another user and their property
      const otherUser = await createTestUser({
        username: 'otheruser',
        email: 'other@example.com',
      });
      const otherProperty = await createTestProperty(otherUser.id);

      const response = await request(app)
        .get(`/api/properties/${otherProperty.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/properties', () => {
    it('should create a new property', async () => {
      const response = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'New Property',
          description: 'New Description',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'New Property');
      expect(response.body).toHaveProperty('description', 'New Description');
      expect(response.body).toHaveProperty('userId', testUser.id);
    });

    it('should create property without description', async () => {
      const response = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Property Without Description',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('name', 'Property Without Description');
    });

    it('should fail without name', async () => {
      const response = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Description only',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/properties/:id', () => {
    it('should update a property', async () => {
      const property = await createTestProperty(testUser.id, {
        name: 'Original Name',
        description: 'Original Description',
      });

      const response = await request(app)
        .put(`/api/properties/${property.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name',
          description: 'Updated Description',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Updated Name');
      expect(response.body).toHaveProperty('description', 'Updated Description');
    });

    it('should not allow updating other users properties', async () => {
      const otherUser = await createTestUser({
        username: 'otheruser',
        email: 'other@example.com',
      });
      const otherProperty = await createTestProperty(otherUser.id);

      const response = await request(app)
        .put(`/api/properties/${otherProperty.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Hacked Name',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/properties/:id', () => {
    it('should delete a property', async () => {
      const property = await createTestProperty(testUser.id);

      const response = await request(app)
        .delete(`/api/properties/${property.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Property deleted');

      // Verify it's actually deleted
      const checkResponse = await request(app)
        .get(`/api/properties/${property.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(checkResponse.status).toBe(404);
    });

    it('should not allow deleting other users properties', async () => {
      const otherUser = await createTestUser({
        username: 'otheruser',
        email: 'other@example.com',
      });
      const otherProperty = await createTestProperty(otherUser.id);

      const response = await request(app)
        .delete(`/api/properties/${otherProperty.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});
