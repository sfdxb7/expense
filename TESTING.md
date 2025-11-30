# Testing Guide - ExpenseTracker Application

This document provides comprehensive information about the testing infrastructure for the ExpenseTracker application.

## Table of Contents

1. [Overview](#overview)
2. [Test Structure](#test-structure)
3. [Backend Tests](#backend-tests)
4. [Frontend Tests](#frontend-tests)
5. [Running Tests](#running-tests)
6. [Test Coverage](#test-coverage)
7. [Writing New Tests](#writing-new-tests)
8. [CI/CD Integration](#cicd-integration)

---

## Overview

The ExpenseTracker application uses a comprehensive testing strategy covering both backend and frontend components:

- **Backend**: Jest + Supertest for API integration tests
- **Frontend**: Vitest + React Testing Library for component tests
- **Integration**: End-to-end API testing with database interactions
- **Coverage**: Automated code coverage reporting

---

## Test Structure

```
ExpenseTracker/
├── backend/
│   ├── tests/
│   │   ├── setup.js                    # Global test setup
│   │   ├── helpers/
│   │   │   └── testHelpers.js         # Test utility functions
│   │   └── integration/
│   │       ├── auth.test.js           # Authentication tests
│   │       ├── properties.test.js     # Property API tests
│   │       ├── expenses.test.js       # Expense API tests
│   │       ├── categories.test.js     # Category API tests
│   │       └── reports.test.js        # Report API tests
│   └── jest.config.js                 # Jest configuration
│
└── frontend/
    ├── tests/
    │   ├── setup.js                   # Global test setup
    │   ├── helpers/
    │   │   └── testUtils.jsx          # Test utility functions
    │   └── components/
    │       ├── Login.test.jsx         # Login component tests
    │       └── Dashboard.test.jsx     # Dashboard component tests
    └── vitest.config.js               # Vitest configuration
```

---

## Backend Tests

### Technology Stack

- **Jest**: Testing framework
- **Supertest**: HTTP assertion library
- **Prisma**: Database ORM for test data management

### Test Categories

#### 1. Authentication Tests (`auth.test.js`)

Tests for user authentication and authorization:

- ✅ Login with valid credentials
- ✅ Login failure scenarios (invalid username, wrong password)
- ✅ Rate limiting enforcement (5 requests per 15 minutes)
- ✅ JWT token validation
- ✅ User profile retrieval
- ✅ Registration blocking in production

#### 2. Properties Tests (`properties.test.js`)

Tests for property management:

- ✅ Fetch all user properties
- ✅ Get single property with details
- ✅ Create new property
- ✅ Update property details
- ✅ Delete property (cascade)
- ✅ User isolation (cannot access others' properties)
- ✅ Property counts (categories, expenses, debtors)

#### 3. Expenses Tests (`expenses.test.js`)

Tests for expense management:

- ✅ List expenses with filtering (date range, category)
- ✅ Create expense with/without receipt
- ✅ Update expense details
- ✅ Delete expense
- ✅ Category validation
- ✅ User authorization
- ✅ Receipt file handling

#### 4. Categories Tests (`categories.test.js`)

Tests for category management:

- ✅ List categories with expense counts
- ✅ Create new category
- ✅ Update category name
- ✅ Delete category (cascade delete expenses)
- ✅ Duplicate name validation (per property)
- ✅ Cross-property category independence

#### 5. Reports Tests (`reports.test.js`)

Tests for analytics and reporting:

- ✅ Generate expense report with totals
- ✅ Category breakdown analysis
- ✅ Date range filtering
- ✅ Yearly reports with monthly breakdown
- ✅ All 12 months included in yearly report
- ✅ Accurate calculation of totals and counts

### Test Helpers

**File**: `backend/tests/helpers/testHelpers.js`

Utility functions for test data management:

```javascript
// User management
createTestUser(data)
cleanupUser(userId)

// Property management
createTestProperty(userId, data)

// Category management
createTestCategory(propertyId, data)

// Expense management
createTestExpense(propertyId, categoryId, data)

// Debtor management
createTestDebtor(propertyId, data)
createTestPayment(debtorId, data)

// Authentication
generateTestToken(userId)
hashPassword(password)

// Cleanup
cleanupTestData()
```

### Running Backend Tests

```bash
# Navigate to backend directory
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run only integration tests
npm run test:integration
```

---

## Frontend Tests

### Technology Stack

- **Vitest**: Testing framework (Vite-native)
- **React Testing Library**: Component testing utilities
- **@testing-library/user-event**: User interaction simulation
- **jsdom**: DOM implementation for testing

### Test Categories

#### 1. Login Component Tests (`Login.test.jsx`)

Tests for authentication UI:

- ✅ Renders login form correctly
- ✅ User input handling (username, password)
- ✅ Form validation
- ✅ Error message display
- ✅ Successful login flow
- ✅ Loading state during authentication
- ✅ Navigation after login

#### 2. Dashboard Component Tests (`Dashboard.test.jsx`)

Tests for main dashboard:

- ✅ Loading state display
- ✅ Property list rendering
- ✅ Empty state handling
- ✅ Create property dialog
- ✅ Property creation flow
- ✅ Navigation to property details
- ✅ Property deletion
- ✅ Error handling

### Test Utilities

**File**: `frontend/tests/helpers/testUtils.jsx`

Helper functions for component testing:

```javascript
// Custom render with providers
renderWithProviders(component, options)

// Mock data creators
createMockAuthState(overrides)
createMockProperty(overrides)
createMockExpense(overrides)
createMockCategory(overrides)
createMockDebtor(overrides)

// Async utilities
waitFor(callback, options)
```

### Running Frontend Tests

```bash
# Navigate to frontend directory
cd frontend

# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run with coverage report
npm run test:coverage
```

---

## Test Coverage

### Backend Coverage Goals

Target: **80%+ coverage** for all modules

Key areas:
- Controllers: 90%+
- Routes: 85%+
- Middleware: 90%+
- Utilities: 80%+

### Frontend Coverage Goals

Target: **75%+ coverage** for components

Key areas:
- Pages: 80%+
- Components: 75%+
- Context providers: 85%+
- Utilities: 80%+

### Viewing Coverage Reports

After running tests with coverage, open:

**Backend**: `backend/coverage/index.html`
**Frontend**: `frontend/coverage/index.html`

---

## Running Tests

### Prerequisites

1. **Database Setup** (for backend tests):
   ```bash
   # Create test database
   DATABASE_URL="postgresql://postgres:postgres@localhost:5433/expensetracker_test"

   # Run migrations
   cd backend
   npx prisma migrate deploy
   ```

2. **Environment Variables**:
   Create `.env.test` in backend directory:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5433/expensetracker_test
   JWT_SECRET=test-jwt-secret-key-for-testing-only
   NODE_ENV=test
   ```

### Quick Start

**Run all tests** (both backend and frontend):

```bash
# From project root
cd backend && npm test && cd ../frontend && npm test
```

**Backend only**:
```bash
cd backend
npm test
```

**Frontend only**:
```bash
cd frontend
npm test
```

**Watch mode** (auto-rerun on changes):
```bash
# Backend
cd backend && npm run test:watch

# Frontend
cd frontend && npm test  # Vitest runs in watch mode by default
```

---

## Writing New Tests

### Backend API Test Example

```javascript
import request from 'supertest';
import express from 'express';
import yourRoute from '../../src/routes/yourRoute.js';
import authMiddleware from '../../src/middleware/auth.js';
import {
  createTestUser,
  generateTestToken,
  cleanupTestData,
  prisma,
} from '../helpers/testHelpers.js';

const app = express();
app.use(express.json());
app.use(authMiddleware);
app.use('/api/your-route', yourRoute);

describe('Your API Endpoint', () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    await cleanupTestData();
    testUser = await createTestUser();
    authToken = generateTestToken(testUser.id);
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  it('should do something', async () => {
    const response = await request(app)
      .get('/api/your-route')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('expectedProperty');
  });
});
```

### Frontend Component Test Example

```javascript
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, createMockAuthState } from '../helpers/testUtils';
import YourComponent from '../../src/components/YourComponent';

describe('YourComponent', () => {
  it('renders correctly', () => {
    renderWithProviders(<YourComponent />, {
      initialAuthState: createMockAuthState(),
    });

    expect(screen.getByText(/expected text/i)).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    renderWithProviders(<YourComponent />);

    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/result/i)).toBeInTheDocument();
    });
  });
});
```

---

## CI/CD Integration

### GitHub Actions

Tests are automatically run on:
- Push to `main` or `develop` branches
- Pull requests to `main`
- Manual workflow dispatch

**Workflow file**: `.github/workflows/build-and-test.yml`

#### Test Steps in CI:

1. **Build Docker Images**
   - Backend image with test dependencies
   - Frontend image with test dependencies

2. **Start Services**
   - PostgreSQL database
   - Backend API server
   - Frontend Nginx server

3. **Run Health Checks**
   - Database connectivity
   - Backend `/health` endpoint
   - Frontend HTTP 200 response

4. **Run Test Suites** (to be added):
   ```yaml
   - name: Run backend tests
     run: |
       docker-compose exec -T backend npm test

   - name: Run frontend tests
     run: |
       docker-compose exec -T frontend npm test
   ```

5. **Upload Coverage Reports**
   - Code coverage artifacts
   - Test result summaries

---

## Best Practices

### General

1. ✅ Write tests before or alongside code (TDD approach)
2. ✅ Keep tests isolated and independent
3. ✅ Use descriptive test names (what it does, not how)
4. ✅ One assertion per test when possible
5. ✅ Clean up test data after tests
6. ✅ Mock external dependencies (APIs, file system)

### Backend

1. ✅ Test all API endpoints (happy path + error cases)
2. ✅ Test authorization and authentication
3. ✅ Test input validation
4. ✅ Test database constraints
5. ✅ Test cascade deletes
6. ✅ Test rate limiting
7. ✅ Use test helpers for data creation

### Frontend

1. ✅ Test user interactions, not implementation details
2. ✅ Use semantic queries (getByRole, getByLabelText)
3. ✅ Test accessibility
4. ✅ Mock API calls
5. ✅ Test loading and error states
6. ✅ Use `waitFor` for async operations
7. ✅ Avoid testing CSS or styling

---

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "Cannot find module"
```bash
# Solution: Ensure type: "module" is in package.json
# For Jest, use NODE_OPTIONS=--experimental-vm-modules
```

**Issue**: Database connection errors
```bash
# Solution: Verify DATABASE_URL in .env.test
# Ensure PostgreSQL is running on port 5433
docker-compose up db
```

**Issue**: "Port already in use" errors
```bash
# Solution: Kill existing processes
# Backend (port 3000)
npx kill-port 3000
# Frontend (port 5173)
npx kill-port 5173
```

**Issue**: Tests hang or timeout
```bash
# Solution: Increase timeout in test files
// Backend (Jest)
jest.setTimeout(10000);

// Frontend (Vitest)
test('...', async () => { ... }, 10000);
```

---

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Vitest Documentation](https://vitest.dev/guide/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)

---

## Contributing

When adding new features:

1. Write tests for new functionality
2. Ensure existing tests still pass
3. Maintain or improve code coverage
4. Update this documentation if needed

**Test Coverage Standards**:
- All new API endpoints: 100% coverage
- All new components: 80%+ coverage
- Bug fixes: Add regression tests

---

## Summary

This testing infrastructure provides:

✅ Comprehensive backend API testing
✅ Frontend component testing
✅ Integration test coverage
✅ Automated test execution
✅ Code coverage reporting
✅ CI/CD integration ready

**Total Test Count**: 50+ tests across backend and frontend

**Run all tests**:
```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

**Happy Testing! 🧪**
