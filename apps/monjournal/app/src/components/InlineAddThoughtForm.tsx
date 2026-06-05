import React, { useState, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronUp, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Thought, createThought } from '@/models/thoughtModel';
import { useThoughtsContext } from '@/context/ThoughtsContext';
import { TagInput } from '@/components/TagInput';
import { TagList } from '@/components/TagList';

/**
 * InlineAddThoughtForm Component
 *
 * Collapsed form on the home page for quickly adding new thoughts.
 * Expands on button click to reveal title, content, and tag inputs.
 */
export function InlineAddThoughtForm({
  onThoughtAdded,
  addThought: addThoughtProp,
  getAvailableTags: getAvailableTagsProp,
}: {
  onThoughtAdded?: () => void;
  addThought?: (thought: Thought) => void;
  getAvailableTags?: () => string[];
}): React.ReactElement {
  // Use context as primary source of truth
  const thoughtsContext = useThoughtsContext();
  const addThought = addThoughtProp || thoughtsContext.addThought;
  const getAvailableTagsFromContext = () => thoughtsContext.getTags().map((tag) => tag.name);
  const getAvailableTags = getAvailableTagsProp || getAvailableTagsFromContext;

  const [isExpanded, setIsExpanded] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    content?: string;
  }>({});

  // Get available tags for autocomplete
  const availableTags = useMemo(() => {
    return getAvailableTags();
  }, [getAvailableTags]);

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

        // Reset form
        setTitle('');
        setContent('');
        setSelectedTags([]);
        setTagInput('');
        setValidationErrors({});
        setIsExpanded(false);

        // Call optional callback
        if (onThoughtAdded) {
          onThoughtAdded();
        }
      } catch (error) {
        console.error('Failed to save thought:', error);
        setValidationErrors({
          content: 'Failed to save thought. Please try again.',
        });
      }
    },
    [title, content, selectedTags, validateForm, addThought, onThoughtAdded]
  );

  // Handle cancel
  const handleCancel = useCallback(() => {
    setTitle('');
    setContent('');
    setSelectedTags([]);
    setTagInput('');
    setValidationErrors({});
    setIsExpanded(false);
  }, []);

  return (
    <div className="w-full">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity flex items-center justify-between"
      >
        <span>{isExpanded ? 'Collapse Form' : 'Add a Thought'}</span>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </button>

      {/* Expanded Form */}
      {isExpanded && (
        <div className="mt-4 p-4 border border-border rounded-md bg-muted">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title Input */}
            <div>
              <label htmlFor="inline-title" className="block text-sm font-medium mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="inline-title"
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
              <label htmlFor="inline-content" className="block text-sm font-medium mb-1">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                id="inline-content"
                placeholder="Enter thought content"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (validationErrors.content) {
                    setValidationErrors((prev) => ({ ...prev, content: undefined }));
                  }
                }}
                className={`w-full p-2 border rounded-md bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary ${
                  validationErrors.content ? 'border-red-500' : 'border-border'
                }`}
                rows={4}
              />
              {validationErrors.content && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.content}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="inline-tag-input" className="block text-sm font-medium mb-1">
                Tags (optional)
              </label>
              <TagInput
                value={tagInput}
                onChange={setTagInput}
                suggestions={availableTags}
                onAddTag={handleAddTag}
              />
              {selectedTags.length > 0 && (
                <div className="mt-2">
                  <TagList tags={selectedTags} onRemoveTag={handleRemoveTag} />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Thought
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

InlineAddThoughtForm.displayName = 'InlineAddThoughtForm';
