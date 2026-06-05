import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThoughts } from '../hooks/useThoughts';
import { createThought } from '../models/thoughtModel';
import type { Tag } from '../models/tagModel';
import { TagInput, TagList } from '../components/form-components';
import '../styles/add-thought-screen.css';

/**
 * AddThoughtScreen - Main form component for adding new thoughts
 *
 * This screen manages the complete form for capturing new thoughts with:
 * - Title input (required)
 * - Content textarea (required)
 * - Tag input section (optional) with autocomplete
 * - Form validation with inline error messages
 * - Success notification and redirect on save
 * - Cancel button to navigate back
 *
 * State management:
 * - title: The thought title (required, non-empty)
 * - content: The thought content/body (required, non-empty)
 * - selectedTags: Array of selected tag names
 * - tagInput: Current tag input text
 * - validationErrors: Object containing validation error messages
 * - isSubmitting: Flag to prevent double-submit
 * - showSuccess: Flag to show success message
 *
 * Integration:
 * - Uses `useThoughts` hook to fetch tag suggestions and save thoughts
 * - Uses `createThought` utility to create thought objects
 * - Uses `useNavigate` from React Router for navigation
 * - Uses `TagInput` and `TagList` form components
 */
export const AddThoughtScreen: React.FC = () => {
  const navigate = useNavigate();
  const { addThought, getTags } = useThoughts();

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Get available tags for autocomplete suggestions
  const availableTags: string[] = getTags().map((tag: Tag) => tag.name);

  /**
   * Validates form inputs
   * Returns true if form is valid, false otherwise
   * Updates validationErrors state with any error messages
   */
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      errors.title = 'Title is required';
    }

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      errors.content = 'Content is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [title, content]);

  /**
   * Validates form on input change (debounced)
   */
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      validateForm();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [title, content, validateForm]);

  /**
   * Handles adding a tag when user presses Enter or clicks a suggestion
   */
  const handleAddTag = useCallback((tag: string) => {
    const trimmedTag = tag.trim();

    // Don't add empty tags
    if (!trimmedTag) {
      return;
    }

    // Don't add duplicate tags
    if (selectedTags.includes(trimmedTag)) {
      return;
    }

    setSelectedTags((prev) => [...prev, trimmedTag]);
  }, [selectedTags]);

  /**
   * Handles removing a tag from the selected list
   */
  const handleRemoveTag = useCallback((tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  /**
   * Handles form submission
   * Validates form, creates thought, calls addThought, shows success, and redirects
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the thought
      const newThought = createThought(title.trim(), content.trim(), selectedTags);

      // Add thought via hook (handles localStorage persistence)
      addThought(newThought);

      // Show success message
      setShowSuccess(true);

      // Redirect to home after a brief delay
      setTimeout(() => {
        navigate('/');
      }, 800);
    } catch (error) {
      console.error('Error adding thought:', error);
      setIsSubmitting(false);
      setValidationErrors({
        submit: 'Failed to save thought. Please try again.',
      });
    }
  };

  /**
   * Handles cancel button click
   * Either clears form or navigates back to home
   */
  const handleCancel = () => {
    // Check if there's unsaved content
    const hasContent =
      title.trim() || content.trim() || selectedTags.length > 0;

    if (hasContent && !window.confirm('Discard unsaved thought?')) {
      return;
    }

    navigate('/');
  };

  return (
    <div className="add-thought-screen">
      <div className="add-thought-container">
        <h1 className="add-thought-title">Add a New Thought</h1>

        {showSuccess && (
          <div className="success-message" role="status" aria-live="polite">
            ✓ Thought saved successfully!
          </div>
        )}

        {validationErrors.submit && (
          <div className="error-banner" role="alert">
            {validationErrors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="add-thought-form" noValidate>
          {/* Title Input */}
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Title <span className="required">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter thought title"
              className={`form-input ${validationErrors.title ? 'error' : ''}`}
              aria-invalid={!!validationErrors.title}
              aria-describedby={validationErrors.title ? 'title-error' : undefined}
              disabled={isSubmitting}
            />
            {validationErrors.title && (
              <div id="title-error" className="error-message">
                {validationErrors.title}
              </div>
            )}
          </div>

          {/* Content Textarea */}
          <div className="form-group">
            <label htmlFor="content" className="form-label">
              Content <span className="required">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter thought content"
              className={`form-textarea ${validationErrors.content ? 'error' : ''}`}
              rows={6}
              aria-invalid={!!validationErrors.content}
              aria-describedby={validationErrors.content ? 'content-error' : undefined}
              disabled={isSubmitting}
            />
            {validationErrors.content && (
              <div id="content-error" className="error-message">
                {validationErrors.content}
              </div>
            )}
          </div>

          {/* Tags Section */}
          <div className="form-group">
            <label htmlFor="tag-input" className="form-label">
              Tags <span className="optional">(optional)</span>
            </label>
            <TagInput
              value={tagInput}
              onChange={setTagInput}
              suggestions={availableTags}
              onAddTag={handleAddTag}
              disabled={isSubmitting}
            />
            {selectedTags.length > 0 && (
              <div className="selected-tags-section">
                <span className="tags-label">Selected Tags:</span>
                <TagList tags={selectedTags} onRemoveTag={handleRemoveTag} />
              </div>
            )}
          </div>

          {/* Form Buttons */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="button button-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button button-primary"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddThoughtScreen;
