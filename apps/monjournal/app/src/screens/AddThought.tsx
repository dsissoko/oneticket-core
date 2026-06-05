import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThoughts } from '../hooks/useThoughts';
import { createThought } from '../models/thoughtModel';
import { TagInput } from '../components/TagInput';
import { TagList } from '../components/TagList';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { logger } from '../lib/logger';

interface ValidationErrors {
  title?: string;
  content?: string;
}

/**
 * AddThought Screen Component
 * 
 * Form page for capturing new thoughts with title, content, and optional tags.
 * - Validates that title and content are not empty
 * - Autocomplete tag suggestions from existing tags
 * - Prevents duplicate tags
 * - Persists thought to localStorage via useThoughts.addThought()
 * - Redirects to home after successful save
 * - Displays success notification
 */
export function AddThought(): React.ReactElement {
  const navigate = useNavigate();
  const { addThought, getTags } = useThoughts();

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get available tags for autocomplete
  const availableTags = getTags().map((tag) => tag.name);

  /**
   * Validates form inputs
   * Title and content are required (non-empty, non-whitespace)
   */
  const validate = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    if (!title || title.trim().length === 0) {
      newErrors.title = 'Title is required';
    }

    if (!content || content.trim().length === 0) {
      newErrors.content = 'Content is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, content]);

  /**
   * Handles adding a tag to selectedTags
   * - Prevents duplicates
   * - Prevents empty tags
   */
  const handleAddTag = useCallback((tag: string) => {
    const trimmed = tag.trim();
    if (trimmed.length === 0) return;

    // Prevent duplicates
    if (selectedTags.includes(trimmed)) {
      logger.info('[AddThought] Duplicate tag prevented:', trimmed);
      return;
    }

    setSelectedTags((prev) => [...prev, trimmed]);
    logger.info('[AddThought] Tag added:', trimmed);
  }, [selectedTags]);

  /**
   * Handles removing a tag from selectedTags
   */
  const handleRemoveTag = useCallback((tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
    logger.info('[AddThought] Tag removed:', tag);
  }, []);

  /**
   * Handles form submission
   * - Validates form
   * - Creates new Thought
   * - Calls addThought() to persist
   * - Shows success message
   * - Redirects to home
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!validate()) {
        logger.warn('[AddThought] Validation failed');
        return;
      }

      setIsSubmitting(true);

      try {
        // Create new thought
        const newThought = createThought(title.trim(), content.trim(), selectedTags);
        
        // Persist to localStorage
        addThought(newThought);
        logger.info('[AddThought] Thought added:', newThought.id);

        // Show success message
        setShowSuccess(true);

        // Redirect to home after a short delay
        setTimeout(() => {
          navigate('/');
        }, 500);
      } catch (error) {
        logger.error('[AddThought] Failed to save thought:', error);
        setErrors({ title: 'Failed to save thought. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    },
    [title, content, selectedTags, validate, addThought, navigate]
  );

  /**
   * Handles cancel button
   * Clears form and navigates to home
   */
  const handleCancel = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <div className="flex flex-col flex-grow bg-background text-foreground">
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Page title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Add a New Thought</h1>
            <p className="text-muted-foreground">
              Capture your thoughts, add tags, and keep them organized.
            </p>
          </div>

          {/* Success message */}
          {showSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-100">
              ✓ Thought saved successfully!
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title field */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Title <span className="text-destructive">*</span>
              </label>
              <Input
                id="title"
                type="text"
                placeholder="Enter thought title..."
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (e.target.value.trim()) {
                    setErrors((prev) => ({ ...prev, title: undefined }));
                  }
                }}
                disabled={isSubmitting}
                required
              />
              {errors.title && (
                <p className="mt-1 text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            {/* Content field */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium mb-2">
                Content <span className="text-destructive">*</span>
              </label>
              <textarea
                id="content"
                placeholder="Enter thought content..."
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (e.target.value.trim()) {
                    setErrors((prev) => ({ ...prev, content: undefined }));
                  }
                }}
                disabled={isSubmitting}
                required
                rows={6}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
              {errors.content && (
                <p className="mt-1 text-sm text-destructive">{errors.content}</p>
              )}
            </div>

            {/* Tags section */}
            <div>
              <label htmlFor="tag-input" className="block text-sm font-medium mb-2">
                Tags <span className="text-muted-foreground">(optional)</span>
              </label>
              
              {/* Tag input */}
              <div className="mb-4">
                <TagInput
                  value={tagInput}
                  onChange={setTagInput}
                  suggestions={availableTags}
                  onAddTag={handleAddTag}
                  disabled={isSubmitting}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Type to search existing tags or press Enter to create a new one
                </p>
              </div>

              {/* Selected tags display */}
              {selectedTags.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Selected Tags:</p>
                  <TagList tags={selectedTags} onRemoveTag={handleRemoveTag} />
                </div>
              )}
            </div>

            {/* Form actions */}
            <div className="flex gap-4 justify-end pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Thought'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddThought;
