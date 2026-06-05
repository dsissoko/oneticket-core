import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useThoughtsContext } from '@/context/ThoughtsContext';
import { createThought } from '@/models/thoughtModel';
import { TagInput } from '@/components/TagInput';
import { TagList } from '@/components/TagList';

/**
 * AddThought Screen Component
 *
 * Form for capturing new thoughts with title, content, and optional tags.
 * Validates required fields, calls addThought on save, and redirects to home.
 */
export function AddThought(): React.ReactElement {
  const navigate = useNavigate();
  const { addThought, getTags } = useThoughtsContext();

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    content?: string;
  }>({});
  const [successMessage, setSuccessMessage] = useState('');

  // Get available tags for autocomplete
  const availableTags = useMemo(() => {
    return getTags().map((tag) => tag.name);
  }, [getTags]);

  // Validation function
  const validateForm = useCallback(() => {
    const errors: { title?: string; content?: string } = {};

    if (!title.trim()) {
      errors.title = 'Title is required';
    }
    if (!content.trim()) {
      errors.content = 'Content is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [title, content]);

  // Handle adding a tag
  const handleAddTag = useCallback((tag: string) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag || selectedTags.includes(trimmedTag)) {
      return;
    }
    setSelectedTags((prev) => [...prev, trimmedTag]);
    setTagInput('');
  }, [selectedTags]);

  // Handle removing a tag
  const handleRemoveTag = useCallback((tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      try {
        // Create and add thought
        const thought = createThought(title.trim(), content.trim(), selectedTags);
        addThought(thought);

        // Show success message
        setSuccessMessage('Thought saved successfully!');

        // Redirect after a short delay
        setTimeout(() => {
          navigate('/');
        }, 500);
      } catch (error) {
        console.error('Failed to save thought:', error);
        setValidationErrors({ content: 'Failed to save thought. Please try again.' });
      }
    },
    [title, content, selectedTags, validateForm, addThought, navigate]
  );

  // Handle cancel
  const handleCancel = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <div className="flex items-center justify-center flex-grow bg-background text-foreground py-12 px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center text-3xl">Add a New Thought</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success Message */}
            {successMessage && (
              <div className="p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded">
                {successMessage}
              </div>
            )}

            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                type="text"
                placeholder="Enter thought title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (validationErrors.title) {
                    setValidationErrors((prev) => ({ ...prev, title: undefined }));
                  }
                }}
                className={validationErrors.title ? 'border-red-500' : ''}
              />
              {validationErrors.title && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.title}</p>
              )}
            </div>

            {/* Content Textarea */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium mb-1">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                placeholder="Enter thought content"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (validationErrors.content) {
                    setValidationErrors((prev) => ({ ...prev, content: undefined }));
                  }
                }}
                className={`w-full p-2 min-h-32 border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  validationErrors.content ? 'border-red-500' : 'border-border'
                }`}
              />
              {validationErrors.content && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.content}</p>
              )}
            </div>

            {/* Tags Section */}
            <div>
              <label className="block text-sm font-medium mb-2">Tags (optional)</label>
              <TagInput
                value={tagInput}
                onChange={setTagInput}
                suggestions={availableTags}
                onAddTag={handleAddTag}
              />

              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium mb-2">Selected Tags:</p>
                  <TagList tags={selectedTags} onRemoveTag={handleRemoveTag} />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default AddThought;
