import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../src/context/AuthContext';
import { ThemeProvider } from '../../src/context/ThemeContext';

/**
 * Custom render function that wraps components with necessary providers
 */
export function renderWithProviders(
  ui,
  {
    initialAuthState = { user: null, token: null, login: () => {}, logout: () => {} },
    route = '/',
    ...renderOptions
  } = {}
) {
  window.history.pushState({}, 'Test page', route);

  function Wrapper({ children }) {
    return (
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider value={initialAuthState}>{children}</AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Create a mock authenticated user state
 */
export function createMockAuthState(overrides = {}) {
  return {
    user: { id: 1, username: 'testuser', email: 'test@example.com' },
    token: 'mock-jwt-token',
    login: () => Promise.resolve(),
    logout: () => {},
    ...overrides,
  };
}

/**
 * Create mock property data
 */
export function createMockProperty(overrides = {}) {
  return {
    id: 1,
    name: 'Test Property',
    description: 'Test Description',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: {
      categories: 0,
      expenses: 0,
      debtors: 0,
    },
    ...overrides,
  };
}

/**
 * Create mock expense data
 */
export function createMockExpense(overrides = {}) {
  return {
    id: 1,
    date: new Date().toISOString(),
    amount: '100.00',
    description: 'Test Expense',
    receiptPath: null,
    categoryId: 1,
    propertyId: 1,
    category: {
      id: 1,
      name: 'Test Category',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create mock category data
 */
export function createMockCategory(overrides = {}) {
  return {
    id: 1,
    name: 'Test Category',
    propertyId: 1,
    createdAt: new Date().toISOString(),
    _count: {
      expenses: 0,
    },
    ...overrides,
  };
}

/**
 * Create mock debtor data
 */
export function createMockDebtor(overrides = {}) {
  return {
    id: 1,
    name: 'Test Debtor',
    propertyId: 1,
    createdAt: new Date().toISOString(),
    payments: [],
    _count: {
      payments: 0,
    },
    ...overrides,
  };
}

/**
 * Wait for async operations
 */
export const waitFor = (callback, options) =>
  import('@testing-library/react').then(({ waitFor: rtlWaitFor }) =>
    rtlWaitFor(callback, options)
  );

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
