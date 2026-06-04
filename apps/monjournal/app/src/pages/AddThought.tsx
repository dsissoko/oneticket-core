import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createThought } from '../models/thoughtModel';
import { useThoughts } from '../hooks/useThoughts';
import { TagInput } from '../components/TagInput';
import { TagList } from '../components/TagList';
import styles from './AddThought.module.css';

interface ValidationErrors {
  title?: string;
  content?: string;
}

export const AddThought: React.FC = () => {
  const navigate = useNavigate();
  const { addThought, getTags } = useThoughts();

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [successMessage, setSuccessMessage] = useState('');

  // Get existing tags for autocomplete suggestions
  const existingTags = getTags().map((tag) => tag.name);

  // Fetch tag suggestions on mount
  useEffect(() => {
    // Tags are fetched via getTags() hook, called once component mounts
  }, []);

  // Validate form fields
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!title.trim()) {
      errors.title = 'Title is required';
    }

    if (!content.trim()) {
      errors.content = 'Content is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle adding a tag
  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();

    // Prevent empty tags
    if (!trimmedTag) {
      return;
    }

    // Prevent duplicate tags
    if (selectedTags.includes(trimmedTag)) {
      return;
    }

    setSelectedTags([...selectedTags, trimmedTag]);
  };

  // Handle removing a tag
  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  // Handle form submission
  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    // Create new thought with title, content, and selected tags
    const newThought = createThought(title, content, selectedTags);

    // Add thought to state and persist to localStorage
    addThought(newThought);

    // Show success message
    setSuccessMessage('Thought saved successfully!');

    // Reset form
    setTitle('');
    setContent('');
    setSelectedTags([]);
    setTagInput('');
    setValidationErrors({});

    // Navigate to home after a short delay
    setTimeout(() => {
      navigate('/');
    }, 500);
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className={styles.addThoughtContainer}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Add a New Thought</h1>

        {successMessage && (
          <div className={styles.successMessage}>{successMessage}</div>
        )}

        {/* Title input */}
        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.label}>
            Title <span className={styles.required}>*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (validationErrors.title) {
                setValidationErrors({ ...validationErrors, title: undefined });
              }
            }}
            placeholder="Enter thought title"
            className={`${styles.input} ${
              validationErrors.title ? styles.inputError : ''
            }`}
          />
          {validationErrors.title && (
            <div className={styles.errorMessage}>{validationErrors.title}</div>
          )}
        </div>

        {/* Content textarea */}
        <div className={styles.formGroup}>
          <label htmlFor="content" className={styles.label}>
            Content <span className={styles.required}>*</span>
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (validationErrors.content) {
                setValidationErrors({ ...validationErrors, content: undefined });
              }
            }}
            placeholder="Enter your thoughts..."
            className={`${styles.textarea} ${
              validationErrors.content ? styles.inputError : ''
            }`}
            rows={8}
          />
          {validationErrors.content && (
            <div className={styles.errorMessage}>{validationErrors.content}</div>
          )}
        </div>

        {/* Tags section */}
        <div className={styles.formGroup}>
          <label htmlFor="tagInput" className={styles.label}>
            Tags <span className={styles.optional}>(optional)</span>
          </label>
          <TagInput
            value={tagInput}
            onChange={setTagInput}
            suggestions={existingTags}
            onAddTag={handleAddTag}
          />
          {selectedTags.length > 0 && (
            <div className={styles.selectedTags}>
              <p className={styles.selectedTagsLabel}>Selected Tags:</p>
              <TagList tags={selectedTags} onRemoveTag={handleRemoveTag} />
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className={styles.buttonGroup}>
          <button
            onClick={handleCancel}
            className={`${styles.button} ${styles.buttonSecondary}`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`${styles.button} ${styles.buttonPrimary}`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
