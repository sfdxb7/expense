import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, createMockAuthState } from '../helpers/testUtils';
import Login from '../../src/pages/Login';
import * as api from '../../src/lib/api';

// Mock the API
vi.mock('../../src/lib/api', () => ({
  login: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('renders login form', () => {
    renderWithProviders(<Login />);

    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('allows user to type in username and password fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    const usernameInput = screen.getByPlaceholderText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');

    expect(usernameInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('password123');
  });

  it('displays error message when login fails', async () => {
    const user = userEvent.setup();
    api.login.mockRejectedValueOnce({
      response: { data: { error: 'Invalid credentials' } },
    });

    renderWithProviders(<Login />);

    const usernameInput = screen.getByPlaceholderText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(usernameInput, 'wronguser');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('calls login API and navigates on successful login', async () => {
    const user = userEvent.setup();
    const mockLoginResponse = {
      data: {
        token: 'mock-token',
        user: { id: 1, username: 'testuser', email: 'test@example.com' },
      },
    };

    api.login.mockResolvedValueOnce(mockLoginResponse);

    const mockLogin = vi.fn();
    renderWithProviders(<Login />, {
      initialAuthState: createMockAuthState({ login: mockLogin }),
    });

    const usernameInput = screen.getByPlaceholderText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(api.login).toHaveBeenCalledWith('testuser', 'password123');
    });
  });

  it('shows loading state during login', async () => {
    const user = userEvent.setup();
    api.login.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    renderWithProviders(<Login />);

    const usernameInput = screen.getByPlaceholderText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Button should be disabled during loading
    expect(submitButton).toBeDisabled();
  });

  it('prevents submission with empty fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    expect(api.login).not.toHaveBeenCalled();
  });
});
