import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThoughts } from '@/hooks/useThoughts';
import { createThought } from '@/models/thoughtModel';
import { TagInput } from '@/components/TagInput';
import { TagList } from '@/components/TagList';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface ValidationErrors {
  title?: string;
  content?: string;
}

/**
 * AddThoughtScreen - Form page for capturing new thoughts
 * 
 * Renders a form with title input, content textarea, tag input with autocomplete,
 * and selected tags display. Validates title and content (required, non-empty),
 * persists via useThoughts.addThought(), and redirects to home on success.
 */
export function AddThoughtScreen(): React.ReactElement {
  const navigate = useNavigate();
  const { getTags, addThought } = useThoughts();

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get existing tags for autocomplete
  const suggestions = getTags().map((tag) => tag.name);

  // Debounced validation
  const [validationTimeout, setValidationTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Validate form
  const validate = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!content.trim()) {
      newErrors.content = 'Content is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, content]);

  // Debounced validation on input change
  useEffect(() => {
    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }

    const timeout = setTimeout(() => {
      validate();
    }, 500);

    setValidationTimeout(timeout);

    return () => clearTimeout(timeout);
  }, [title, content, validate]);

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (errors.title) {
      setErrors({ ...errors, title: undefined });
    }
  };

  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (errors.content) {
      setErrors({ ...errors, content: undefined });
    }
  };

  // Handle tag input change
  const handleTagInputChange = (value: string) => {
    setTagInput(value);
  };

  // Handle add tag
  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();
    // Prevent empty or duplicate tags
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      setSelectedTags([...selectedTags, trimmedTag]);
    }
  };

  // Handle remove tag
  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  // Handle form submission
  const handleSave = async () => {
    if (!validate() || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      const newThought = createThought(title.trim(), content.trim(), selectedTags);
      addThought(newThought);
      
      // Clear form
      setTitle('');
      setContent('');
      setSelectedTags([]);
      setTagInput('');
      
      // Redirect to home
      navigate('/');
    } catch (error) {
      console.error('Failed to add thought:', error);
      // Could show error toast here
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground py-12 px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Add a New Thought</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title input */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Enter thought title..."
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Content textarea */}
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Content <span className="text-destructive">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={handleContentChange}
              placeholder="Enter thought content..."
              disabled={isSubmitting}
              className={cn(
                'flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-base',
                'ring-offset-background placeholder:text-muted-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'md:text-sm resize-vertical'
              )}
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content}</p>
            )}
          </div>

          {/* Tag input */}
          <div className="space-y-2">
            <label htmlFor="tag-input" className="text-sm font-medium">
              Tags <span className="text-muted-foreground">(optional)</span>
            </label>
            <TagInput
              value={tagInput}
              onChange={handleTagInputChange}
              suggestions={suggestions}
              onAddTag={handleAddTag}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Press Enter or click a suggestion to add a tag
            </p>
          </div>

          {/* Selected tags */}
          {selectedTags.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Selected Tags</label>
              <TagList tags={selectedTags} onRemoveTag={handleRemoveTag} />
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AddThoughtScreen;
