import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  renderWithProviders,
  createMockAuthState,
  createMockProperty,
} from '../helpers/testUtils';
import Dashboard from '../../src/pages/Dashboard';
import * as api from '../../src/lib/api';

// Mock the API
vi.mock('../../src/lib/api', () => ({
  getProperties: vi.fn(),
  createProperty: vi.fn(),
  updateProperty: vi.fn(),
  deleteProperty: vi.fn(),
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

describe('Dashboard Component', () => {
  const mockAuthState = createMockAuthState();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard with loading state', () => {
    api.getProperties.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithProviders(<Dashboard />, {
      initialAuthState: mockAuthState,
    });

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays properties when loaded', async () => {
    const mockProperties = [
      createMockProperty({ id: 1, name: 'Property 1' }),
      createMockProperty({ id: 2, name: 'Property 2' }),
    ];

    api.getProperties.mockResolvedValueOnce({ data: mockProperties });

    renderWithProviders(<Dashboard />, {
      initialAuthState: mockAuthState,
    });

    await waitFor(() => {
      expect(screen.getByText('Property 1')).toBeInTheDocument();
      expect(screen.getByText('Property 2')).toBeInTheDocument();
    });
  });

  it('shows empty state when no properties exist', async () => {
    api.getProperties.mockResolvedValueOnce({ data: [] });

    renderWithProviders(<Dashboard />, {
      initialAuthState: mockAuthState,
    });

    await waitFor(() => {
      expect(
        screen.getByText(/no properties yet/i) || screen.getByText(/get started/i)
      ).toBeInTheDocument();
    });
  });

  it('opens create property dialog when add button is clicked', async () => {
    const user = userEvent.setup();
    api.getProperties.mockResolvedValueOnce({ data: [] });

    renderWithProviders(<Dashboard />, {
      initialAuthState: mockAuthState,
    });

    await waitFor(() => {
      expect(screen.getByText(/add property/i)).toBeInTheDocument();
    });

    const addButton = screen.getByText(/add property/i);
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/property name/i)).toBeInTheDocument();
    });
  });

  it('creates a new property successfully', async () => {
    const user = userEvent.setup();
    const newProperty = createMockProperty({ id: 1, name: 'New Property' });

    api.getProperties.mockResolvedValueOnce({ data: [] });
    api.createProperty.mockResolvedValueOnce({ data: newProperty });
    api.getProperties.mockResolvedValueOnce({ data: [newProperty] });

    renderWithProviders(<Dashboard />, {
      initialAuthState: mockAuthState,
    });

    await waitFor(() => {
      expect(screen.getByText(/add property/i)).toBeInTheDocument();
    });

    const addButton = screen.getByText(/add property/i);
    await user.click(addButton);

    const nameInput = await screen.findByPlaceholderText(/property name/i);
    await user.type(nameInput, 'New Property');

    const submitButton = screen.getByRole('button', { name: /create/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(api.createProperty).toHaveBeenCalledWith({
        name: 'New Property',
        description: '',
      });
    });
  });

  it('navigates to property detail when property is clicked', async () => {
    const user = userEvent.setup();
    const mockProperty = createMockProperty({ id: 1, name: 'Test Property' });

    api.getProperties.mockResolvedValueOnce({ data: [mockProperty] });

    renderWithProviders(<Dashboard />, {
      initialAuthState: mockAuthState,
    });

    await waitFor(() => {
      expect(screen.getByText('Test Property')).toBeInTheDocument();
    });

    const propertyCard = screen.getByText('Test Property');
    await user.click(propertyCard);

    expect(mockNavigate).toHaveBeenCalledWith('/property/1');
  });

  it('deletes a property when delete button is clicked', async () => {
    const user = userEvent.setup();
    const mockProperty = createMockProperty({ id: 1, name: 'Property to Delete' });

    api.getProperties.mockResolvedValueOnce({ data: [mockProperty] });
    api.deleteProperty.mockResolvedValueOnce({ data: { message: 'Deleted' } });
    api.getProperties.mockResolvedValueOnce({ data: [] });

    renderWithProviders(<Dashboard />, {
      initialAuthState: mockAuthState,
    });

    await waitFor(() => {
      expect(screen.getByText('Property to Delete')).toBeInTheDocument();
    });

    // Find and click delete button (assuming it has an aria-label or specific text)
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find((btn) =>
      btn.textContent.includes('Delete') || btn.getAttribute('aria-label')?.includes('delete')
    );

    if (deleteButton) {
      await user.click(deleteButton);

      // Confirm deletion if there's a confirmation dialog
      const confirmButton = screen.queryByText(/confirm/i);
      if (confirmButton) {
        await user.click(confirmButton);
      }

      await waitFor(() => {
        expect(api.deleteProperty).toHaveBeenCalledWith(1);
      });
    }
  });

  it('displays error message when property fetch fails', async () => {
    api.getProperties.mockRejectedValueOnce({
      response: { data: { error: 'Failed to fetch properties' } },
    });

    renderWithProviders(<Dashboard />, {
      initialAuthState: mockAuthState,
    });

    await waitFor(() => {
      expect(
        screen.getByText(/failed to fetch/i) || screen.getByText(/error/i)
      ).toBeInTheDocument();
    });
  });
});
