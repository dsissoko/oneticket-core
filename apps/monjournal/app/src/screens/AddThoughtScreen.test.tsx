import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AddThoughtScreen } from './AddThoughtScreen';
import { useThoughts } from '@/hooks/useThoughts';
import * as thoughtModel from '@/models/thoughtModel';

// Mock useThoughts
vi.mock('@/hooks/useThoughts');

// Mock react-router-dom
vi.mock('react-router-dom', async () => ({
  ...await vi.importActual<typeof import('react-router-dom')>('react-router-dom'),
  useNavigate: () => vi.fn(),
}));

const mockUseThoughts = useThoughts as ReturnType<typeof vi.fn>;

const mockTags = [
  { name: 'personal', color: '#FF6B6B' },
  { name: 'work', color: '#4ECDC4' },
];

const mockAddThought = vi.fn();
const mockGetTags = vi.fn(() => mockTags);

describe('AddThoughtScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseThoughts.mockReturnValue({
      thoughts: [],
      addThought: mockAddThought,
      getTags: mockGetTags,
      getThoughts: vi.fn(() => []),
    } as any);
  });

  function renderComponent() {
    return render(
      <BrowserRouter>
        <AddThoughtScreen />
      </BrowserRouter>
    );
  }

  it('renders form with title and content inputs', () => {
    renderComponent();
    
    expect(screen.getByText('Add a New Thought')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter thought title/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter thought content/)).toBeInTheDocument();
  });

  it('renders Cancel and Save buttons', () => {
    renderComponent();
    
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
  });

  it('prevents submission if title is empty', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const contentInput = screen.getByPlaceholderText(/Enter thought content/);
    await user.type(contentInput, 'Some content');
    
    const saveButton = screen.getByRole('button', { name: /Save/i });
    await user.click(saveButton);
    
    // Error should be shown
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });
    
    expect(mockAddThought).not.toHaveBeenCalled();
  });

  it('prevents submission if content is empty', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const titleInput = screen.getByPlaceholderText(/Enter thought title/);
    await user.type(titleInput, 'My Title');
    
    const saveButton = screen.getByRole('button', { name: /Save/i });
    await user.click(saveButton);
    
    // Error should be shown
    await waitFor(() => {
      expect(screen.getByText('Content is required')).toBeInTheDocument();
    });
    
    expect(mockAddThought).not.toHaveBeenCalled();
  });

  it('prevents submission if both title and content are empty', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const saveButton = screen.getByRole('button', { name: /Save/i });
    await user.click(saveButton);
    
    // Both errors should be shown
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(screen.getByText('Content is required')).toBeInTheDocument();
    });
    
    expect(mockAddThought).not.toHaveBeenCalled();
  });

  it('allows adding tags from input', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const tagInput = screen.getByPlaceholderText(/Type tag name/);
    
    await user.type(tagInput, 'custom-tag');
    await user.keyboard('{Enter}');
    
    // Tag should appear in selected tags
    await waitFor(() => {
      expect(screen.getByText('custom-tag')).toBeInTheDocument();
    });
  });

  it('removes tag when remove button clicked', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const tagInput = screen.getByPlaceholderText(/Type tag name/);
    
    // Add tag
    await user.type(tagInput, 'work');
    await user.keyboard('{Enter}');
    
    await waitFor(() => {
      expect(screen.getByText('work')).toBeInTheDocument();
    });
    
    // Remove tag
    const removeButtons = screen.getAllByText('×');
    await user.click(removeButtons[0]);
    
    await waitFor(() => {
      expect(screen.queryByText('work')).not.toBeInTheDocument();
    });
  });

  it('trims whitespace from title and content on submission', async () => {
    const user = userEvent.setup();
    const createThoughtSpy = vi.spyOn(thoughtModel, 'createThought').mockReturnValue({
      id: '123',
      title: 'Test',
      content: 'Content',
      createdAt: Date.now(),
      tags: [],
    });

    renderComponent();
    
    const titleInput = screen.getByPlaceholderText(/Enter thought title/);
    const contentInput = screen.getByPlaceholderText(/Enter thought content/);
    
    await user.type(titleInput, '  Test Title  ');
    await user.type(contentInput, '  Test Content  ');
    
    const saveButton = screen.getByRole('button', { name: /Save/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(createThoughtSpy).toHaveBeenCalledWith(
        'Test Title',
        'Test Content',
        []
      );
    });
  });

  it('handles whitespace-only title as empty', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const titleInput = screen.getByPlaceholderText(/Enter thought title/);
    const contentInput = screen.getByPlaceholderText(/Enter thought content/);
    
    await user.type(titleInput, '   ');
    await user.type(contentInput, 'Content');
    
    const saveButton = screen.getByRole('button', { name: /Save/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });
  });

  it('clears form after successful save', async () => {
    const user = userEvent.setup();
    vi.spyOn(thoughtModel, 'createThought').mockReturnValue({
      id: '123',
      title: 'Test Title',
      content: 'Test Content',
      createdAt: Date.now(),
      tags: [],
    });

    renderComponent();
    
    const titleInput = screen.getByPlaceholderText(/Enter thought title/) as HTMLInputElement;
    const contentInput = screen.getByPlaceholderText(/Enter thought content/) as HTMLTextAreaElement;
    
    await user.type(titleInput, 'Test Title');
    await user.type(contentInput, 'Test Content');
    
    const saveButton = screen.getByRole('button', { name: /Save/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(titleInput.value).toBe('');
      expect(contentInput.value).toBe('');
    });
  });

  it('includes selected tags in createThought call', async () => {
    const user = userEvent.setup();
    vi.spyOn(thoughtModel, 'createThought').mockReturnValue({
      id: '123',
      title: 'Test',
      content: 'Content',
      createdAt: Date.now(),
      tags: ['work', 'personal'],
    });

    renderComponent();
    
    const titleInput = screen.getByPlaceholderText(/Enter thought title/);
    const contentInput = screen.getByPlaceholderText(/Enter thought content/);
    const tagInput = screen.getByPlaceholderText(/Type tag name/);
    
    await user.type(titleInput, 'Test');
    await user.type(contentInput, 'Content');
    
    // Add tags
    await user.type(tagInput, 'work');
    await user.keyboard('{Enter}');
    
    await user.type(tagInput, 'personal');
    await user.keyboard('{Enter}');
    
    const saveButton = screen.getByRole('button', { name: /Save/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(thoughtModel.createThought).toHaveBeenCalledWith(
        'Test',
        'Content',
        expect.arrayContaining(['work', 'personal'])
      );
    });
  });
});
