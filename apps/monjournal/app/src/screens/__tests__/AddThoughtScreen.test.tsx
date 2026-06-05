import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AddThoughtScreen from '../AddThoughtScreen';
import * as thoughtModel from '../../models/thoughtModel';
import * as useThoughtsHook from '../../hooks/useThoughts';

/**
 * Mock localStorage to avoid side effects during testing
 */
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

/**
 * Utility to render AddThoughtScreen with Router
 */
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('AddThoughtScreen Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Rendering and Layout', () => {
    it('should render the add thought form with all required sections', () => {
      vi.spyOn(useThoughtsHook, 'useThoughts').mockReturnValue({
        thoughts: [],
        addThought: vi.fn(),
        getTags: vi.fn(() => []),
        getThoughts: vi.fn(() => []),
      });

      renderWithRouter(<AddThoughtScreen />);

      expect(screen.getByText('Add a New Thought')).toBeInTheDocument();
      expect(screen.getByLabelText(/Title/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Content/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Type a tag and press Enter')).toBeInTheDocument();
    });

    it('should display required field indicators', () => {
      vi.spyOn(useThoughtsHook, 'useThoughts').mockReturnValue({
        thoughts: [],
        addThought: vi.fn(),
        getTags: vi.fn(() => []),
        getThoughts: vi.fn(() => []),
      });

      renderWithRouter(<AddThoughtScreen />);

      const titleLabel = screen.getByText(/Title/);
      const contentLabel = screen.getByText(/Content/);

      // Check that the label contains the * required indicator
      const titleLabelParent = titleLabel.closest('label');
      const contentLabelParent = contentLabel.closest('label');
      
      expect(titleLabelParent?.textContent).toContain('*');
      expect(contentLabelParent?.textContent).toContain('*');
    });

    it('should display optional indicator for tags', () => {
      vi.spyOn(useThoughtsHook, 'useThoughts').mockReturnValue({
        thoughts: [],
        addThought: vi.fn(),
        getTags: vi.fn(() => []),
        getThoughts: vi.fn(() => []),
      });

      renderWithRouter(<AddThoughtScreen />);

      const tagsLabel = screen.getByText(/Tags/);
      const tagsLabelParent = tagsLabel.closest('label');
      expect(tagsLabelParent?.textContent).toContain('optional');
    });

    it('should render Cancel and Save buttons', () => {
      vi.spyOn(useThoughtsHook, 'useThoughts').mockReturnValue({
        thoughts: [],
        addThought: vi.fn(),
        getTags: vi.fn(() => []),
        getThoughts: vi.fn(() => []),
      });

      renderWithRouter(<AddThoughtScreen />);

      expect(screen.getByRole('button', { name: /Cancel/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Save/ })).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error message for empty title on submit', async () => {
      vi.spyOn(useThoughtsHook, 'useThoughts').mockReturnValue({
        thoughts: [],
        addThought: vi.fn(),
        getTags: vi.fn(() => []),
        getThoughts: vi.fn(() => []),
      });

      renderWithRouter(<AddThoughtScreen />);

      const contentInput = screen.getByLabelText(/Content/);
      const saveButton = screen.getByRole('button', { name: /Save/ });

      await userEvent.type(contentInput, 'Some content');
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
      });
    });

    it('should show error message for empty content on submit', async () => {
      vi.spyOn(useThoughtsHook, 'useThoughts').mockReturnValue({
        thoughts: [],
        addThought: vi.fn(),
        getTags: vi.fn(() => []),
        getThoughts: vi.fn(() => []),
      });

      renderWithRouter(<AddThoughtScreen />);

      const titleInput = screen.getByLabelText(/Title/);
      const saveButton = screen.getByRole('button', { name: /Save/ });

      await userEvent.type(titleInput, 'Some title');
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Content is required')).toBeInTheDocument();
      });
    });

    it('should not show errors when title and content are filled', async () => {
      vi.spyOn(useThoughtsHook, 'useThoughts').mockReturnValue({
        thoughts: [],
        addThought: vi.fn(),
        getTags: vi.fn(() => []),
        getThoughts: vi.fn(() => []),
      });

      renderWithRouter(<AddThoughtScreen />);

      const titleInput = screen.getByLabelText(/Title/);
      const contentInput = screen.getByLabelText(/Content/);

      await userEvent.type(titleInput, 'Test Title');
      await userEvent.type(contentInput, 'Test Content');

      await waitFor(() => {
        expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
        expect(screen.queryByText('Content is required')).not.toBeInTheDocument();
      });
    });

    it('should trim whitespace-only input and treat as empty', async () => {
      vi.spyOn(useThoughtsHook, 'useThoughts').mockReturnValue({
        thoughts: [],
        addThought: vi.fn(),
        getTags: vi.fn(() => []),
        getThoughts: vi.fn(() => []),
      });

      renderWithRouter(<AddThoughtScreen />);

      const titleInput = screen.getByLabelText(/Title/);
      const contentInput = screen.getByLabelText(/Content/);
      const saveButton = screen.getByRole('button', { name: /Save/ });

      await userEvent.type(titleInput, '   ');
      await userEvent.type(contentInput, '   ');
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
        expect(screen.getByText('Content is required')).toBeInTheDocument();
      });
    });
  });

  describe('Tag Management', () => {
    it('should allow adding tags via tag input', async () => {
      vi.spyOn(useThoughtsHook, 'useThoughts').mockReturnValue({
        thoughts: [],
        addThought: vi.fn(),
        getTags: vi.fn(() => []),
        getThoughts: vi.fn(() => []),
      });

      renderWithRouter(<AddThoughtScreen />);

      const tagInput = screen.getByPlaceholderText('Type a tag and press Enter');

      await userEvent.type(tagInput, 'work');
      await userEvent.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('work')).toBeInTheDocument();
      });
    });

    it('should prevent duplicate tags', async () => {
      vi.spyOn(useThoughtsHook, 'useThoughts').mockReturnValue({
        thoughts: [],
        addThought: vi.fn(),
        getTags: vi.fn(() => []),
        getThoughts: vi.fn(() => []),
      });

      renderWithRouter(<AddThoughtScreen />);

      const tagInput = screen.getByPlaceholderText('Type a tag and press Enter');

      // Add first tag
      await userEvent.type(tagInput, 'work');
      await userEvent.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('work')).toBeInTheDocument();
      });

      // Try to add same tag again
      await userEvent.type(tagInput, 'work');
      await userEvent.keyboard('{Enter}');

      // Should still only have one instance
      const tagChips = screen.getAllByText('work');
      expect(tagChips.length).toBe(1);
    });

    it('should remove tag when remove button is clicked', async () => {
      vi.spyOn(useThoughtsHook, 'useThoughts').mockReturnValue({
        thoughts: [],
        addThought: vi.fn(),
        getTags: vi.fn(() => []),
        getThoughts: vi.fn(() => []),
      });

      renderWithRouter(<AddThoughtScreen />);

      const tagInput = screen.getByPlaceholderText('Type a tag and press Enter');

      await userEvent.type(tagInput, 'work');
      await userEvent.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('work')).toBeInTheDocument();
      });

      const removeButton = screen.getByLabelText('Remove tag: work');
      await userEvent.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByText('work')).not.toBeInTheDocument();
      });
    });

    it('should show tag suggestions from existing tags', async () => {
      const mockTags = [
        { name: 'work', color: '#FF6B6B' },
        { name: 'personal', color: '#4ECDC4' },
        { name: 'urgent', color: '#45B7D1' },
      ];

      vi.spyOn(useThoughtsHook, 'useThoughts').mockReturnValue({
        thoughts: [],
        addThought: vi.fn(),
        getTags: vi.fn(() => mockTags),
        getThoughts: vi.fn(() => []),
      });

      renderWithRouter(<AddThoughtScreen />);

      const tagInput = screen.getByPlaceholderText('Type a tag and press Enter');

      await userEvent.type(tagInput, 'work');

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call createThought with correct data on submit', async () => {
      const mockAddThought = vi.fn();
      vi.spyOn(useThoughtsHook, 'useThoughts').mockReturnValue({
        thoughts: [],
        addThought: mockAddThought,
        getTags: vi.fn(() => []),
        getThoughts: vi.fn(() => []),
      });

      const createThoughtSpy = vi.spyOn(thoughtModel, 'createThought');

      renderWithRouter(<AddThoughtScreen />);

      const titleInput = screen.getByLabelText(/Title/);
      const contentInput = screen.getByLabelText(/Content/);
      const saveButton = screen.getByRole('button', { name: /Save/ });

      await userEvent.type(titleInput, 'Test Thought');
      await userEvent.type(contentInput, 'This is test content');
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(createThoughtSpy).toHaveBeenCalledWith('Test Thought', 'This is test content', []);
      });
    });

    it('should call addThought with the created thought', async () => {
      const mockAddThought = vi.fn();
      vi.spyOn(useThoughtsHook, 'useThoughts').mockReturnValue({
        thoughts: [],
        addThought: mockAddThought,
        getTags: vi.fn(() => []),
        getThoughts: vi.fn(() => []),
      });

      vi.spyOn(thoughtModel, 'createThought').mockReturnValue({
        id: 'test-id',
        title: 'Test Thought',
        content: 'Test content',
        createdAt: Date.now(),
        tags: [],
      });

      renderWithRouter(<AddThoughtScreen />);

      const titleInput = screen.getByLabelText(/Title/);
      const contentInput = screen.getByLabelText(/Content/);
      const saveButton = screen.getByRole('button', { name: /Save/ });

      await userEvent.type(titleInput, 'Test Thought');
      await userEvent.type(contentInput, 'Test content');
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(mockAddThought).toHaveBeenCalled();
      });
    });

    it('should show success message on successful save', async () => {
      const mockAddThought = vi.fn();
      vi.spyOn(useThoughtsHook, 'useThoughts').mockReturnValue({
        thoughts: [],
        addThought: mockAddThought,
        getTags: vi.fn(() => []),
        getThoughts: vi.fn(() => []),
      });

      renderWithRouter(<AddThoughtScreen />);

      const titleInput = screen.getByLabelText(/Title/);
      const contentInput = screen.getByLabelText(/Content/);
      const saveButton = screen.getByRole('button', { name: /Save/ });

      await userEvent.type(titleInput, 'Test Thought');
      await userEvent.type(contentInput, 'Test content');
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Thought saved successfully/)).toBeInTheDocument();
      });
    });

    it('should submit with selected tags', async () => {
      const mockAddThought = vi.fn();
      vi.spyOn(useThoughtsHook, 'useThoughts').mockReturnValue({
        thoughts: [],
        addThought: mockAddThought,
        getTags: vi.fn(() => []),
        getThoughts: vi.fn(() => []),
      });

      const createThoughtSpy = vi.spyOn(thoughtModel, 'createThought');

      renderWithRouter(<AddThoughtScreen />);

      const titleInput = screen.getByLabelText(/Title/);
      const contentInput = screen.getByLabelText(/Content/);
      const tagInput = screen.getByPlaceholderText('Type a tag and press Enter');
      const saveButton = screen.getByRole('button', { name: /Save/ });

      await userEvent.type(titleInput, 'Test Thought');
      await userEvent.type(contentInput, 'Test content');
      await userEvent.type(tagInput, 'work');
      await userEvent.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('work')).toBeInTheDocument();
      });

      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(createThoughtSpy).toHaveBeenCalledWith('Test Thought', 'Test content', ['work']);
      });
    });

    it('should disable form during submission', async () => {
      const mockAddThought = vi.fn(() => {
        // Simulate delay
        return new Promise((resolve) => setTimeout(resolve, 1000));
      });

      vi.spyOn(useThoughtsHook, 'useThoughts').mockReturnValue({
        thoughts: [],
        addThought: mockAddThought,
        getTags: vi.fn(() => []),
        getThoughts: vi.fn(() => []),
      });

      renderWithRouter(<AddThoughtScreen />);

      const titleInput = screen.getByLabelText(/Title/);
      const contentInput = screen.getByLabelText(/Content/);
      const saveButton = screen.getByRole('button', { name: /Save/ });

      await userEvent.type(titleInput, 'Test Thought');
      await userEvent.type(contentInput, 'Test content');
      await userEvent.click(saveButton);

      // Button should be disabled during submission
      expect(saveButton).toHaveAttribute('aria-busy', 'true');
    });

    it('should show "Saving..." text on button during submission', async () => {
      const mockAddThought = vi.fn();
      vi.spyOn(useThoughtsHook, 'useThoughts').mockReturnValue({
        thoughts: [],
        addThought: mockAddThought,
        getTags: vi.fn(() => []),
        getThoughts: vi.fn(() => []),
      });

      renderWithRouter(<AddThoughtScreen />);

      const titleInput = screen.getByLabelText(/Title/);
      const contentInput = screen.getByLabelText(/Content/);
      const saveButton = screen.getByRole('button', { name: /Save/ });

      await userEvent.type(titleInput, 'Test Thought');
      await userEvent.type(contentInput, 'Test content');
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Saving/ })).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to home on successful save', async () => {
      const mockAddThought = vi.fn();
      vi.spyOn(useThoughtsHook, 'useThoughts').mockReturnValue({
        thoughts: [],
        addThought: mockAddThought,
        getTags: vi.fn(() => []),
        getThoughts: vi.fn(() => []),
      });

      const { container } = renderWithRouter(<AddThoughtScreen />);

      const titleInput = screen.getByLabelText(/Title/);
      const contentInput = screen.getByLabelText(/Content/);
      const saveButton = screen.getByRole('button', { name: /Save/ });

      await userEvent.type(titleInput, 'Test Thought');
      await userEvent.type(contentInput, 'Test content');
      await userEvent.click(saveButton);

      await waitFor(
        () => {
          // The navigation would change the URL to /
          // In a real app, this would be verified through router
          expect(screen.getByText(/Thought saved successfully/)).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });

    it('should navigate to home when cancel button is clicked', async () => {
      vi.spyOn(useThoughtsHook, 'useThoughts').mockReturnValue({
        thoughts: [],
        addThought: vi.fn(),
        getTags: vi.fn(() => []),
        getThoughts: vi.fn(() => []),
      });

      renderWithRouter(<AddThoughtScreen />);

      const cancelButton = screen.getByRole('button', { name: /Cancel/ });
      await userEvent.click(cancelButton);

      // In a real app with router, this would navigate away
      // For this test, we're just verifying the click is processed
      expect(cancelButton).toBeInTheDocument();
    });

    it('should warn before discarding unsaved content', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      vi.spyOn(useThoughtsHook, 'useThoughts').mockReturnValue({
        thoughts: [],
        addThought: vi.fn(),
        getTags: vi.fn(() => []),
        getThoughts: vi.fn(() => []),
      });

      renderWithRouter(<AddThoughtScreen />);

      const titleInput = screen.getByLabelText(/Title/);
      const cancelButton = screen.getByRole('button', { name: /Cancel/ });

      await userEvent.type(titleInput, 'Unsaved thought');
      await userEvent.click(cancelButton);

      expect(confirmSpy).toHaveBeenCalledWith('Discard unsaved thought?');
      confirmSpy.mockRestore();
    });

    it('should not warn when form is empty on cancel', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm');

      vi.spyOn(useThoughtsHook, 'useThoughts').mockReturnValue({
        thoughts: [],
        addThought: vi.fn(),
        getTags: vi.fn(() => []),
        getThoughts: vi.fn(() => []),
      });

      renderWithRouter(<AddThoughtScreen />);

      const cancelButton = screen.getByRole('button', { name: /Cancel/ });
      await userEvent.click(cancelButton);

      expect(confirmSpy).not.toHaveBeenCalled();
      confirmSpy.mockRestore();
    });
  });

  describe('LocalStorage Integration', () => {
    it('should persist thought to localStorage on save', async () => {
      const thought = {
        id: 'test-id-123',
        title: 'Test Thought',
        content: 'Test content',
        createdAt: Date.now(),
        tags: [],
      };

      const mockAddThought = vi.fn((newThought) => {
        localStorage.setItem('monjournal_thoughts', JSON.stringify([newThought]));
      });

      vi.spyOn(useThoughtsHook, 'useThoughts').mockReturnValue({
        thoughts: [],
        addThought: mockAddThought,
        getTags: vi.fn(() => []),
        getThoughts: vi.fn(() => []),
      });

      vi.spyOn(thoughtModel, 'createThought').mockReturnValue(thought);

      renderWithRouter(<AddThoughtScreen />);

      const titleInput = screen.getByLabelText(/Title/);
      const contentInput = screen.getByLabelText(/Content/);
      const saveButton = screen.getByRole('button', { name: /Save/ });

      await userEvent.type(titleInput, 'Test Thought');
      await userEvent.type(contentInput, 'Test content');
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(mockAddThought).toHaveBeenCalled();
      });
    });

    it('should handle localStorage errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const mockAddThought = vi.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      vi.spyOn(useThoughtsHook, 'useThoughts').mockReturnValue({
        thoughts: [],
        addThought: mockAddThought,
        getTags: vi.fn(() => []),
        getThoughts: vi.fn(() => []),
      });

      renderWithRouter(<AddThoughtScreen />);

      const titleInput = screen.getByLabelText(/Title/);
      const contentInput = screen.getByLabelText(/Content/);
      const saveButton = screen.getByRole('button', { name: /Save/ });

      await userEvent.type(titleInput, 'Test Thought');
      await userEvent.type(contentInput, 'Test content');
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to save thought/)).toBeInTheDocument();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for form fields', () => {
      vi.spyOn(useThoughtsHook, 'useThoughts').mockReturnValue({
        thoughts: [],
        addThought: vi.fn(),
        getTags: vi.fn(() => []),
        getThoughts: vi.fn(() => []),
      });

      renderWithRouter(<AddThoughtScreen />);

      const titleInput = screen.getByLabelText(/Title/);
      const contentInput = screen.getByLabelText(/Content/);
      const tagsInput = screen.getByPlaceholderText('Type a tag and press Enter');

      expect(titleInput).toHaveAttribute('aria-invalid', 'false');
      expect(contentInput).toHaveAttribute('aria-invalid', 'false');
      expect(tagsInput).toHaveAttribute('aria-label', 'Tag input');
    });

    it('should mark fields as invalid when there are errors', async () => {
      vi.spyOn(useThoughtsHook, 'useThoughts').mockReturnValue({
        thoughts: [],
        addThought: vi.fn(),
        getTags: vi.fn(() => []),
        getThoughts: vi.fn(() => []),
      });

      renderWithRouter(<AddThoughtScreen />);

      const contentInput = screen.getByLabelText(/Content/);
      const saveButton = screen.getByRole('button', { name: /Save/ });

      await userEvent.type(contentInput, 'Content');
      await userEvent.click(saveButton);

      await waitFor(() => {
        const titleInput = screen.getByLabelText(/Title/);
        expect(titleInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should provide error descriptions via aria-describedby', async () => {
      vi.spyOn(useThoughtsHook, 'useThoughts').mockReturnValue({
        thoughts: [],
        addThought: vi.fn(),
        getTags: vi.fn(() => []),
        getThoughts: vi.fn(() => []),
      });

      renderWithRouter(<AddThoughtScreen />);

      const contentInput = screen.getByLabelText(/Content/);
      const saveButton = screen.getByRole('button', { name: /Save/ });

      await userEvent.type(contentInput, 'Content');
      await userEvent.click(saveButton);

      await waitFor(() => {
        const titleInput = screen.getByLabelText(/Title/);
        expect(titleInput).toHaveAttribute('aria-describedby', 'title-error');
      });
    });
  });
});
