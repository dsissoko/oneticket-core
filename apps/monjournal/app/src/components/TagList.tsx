import React from 'react';
import { getTagColor } from '../models/tagModel';
import styles from './TagList.module.css';

interface TagListProps {
  tags: string[];
  onRemoveTag: (tag: string) => void;
}

export const TagList: React.FC<TagListProps> = ({ tags, onRemoveTag }) => {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={styles.tagListContainer}>
      {tags.map((tag) => (
        <div
          key={tag}
          className={styles.chip}
          style={{ backgroundColor: getTagColor(tag) }}
        >
          <span className={styles.tagName}>{tag}</span>
          <button
            className={styles.removeButton}
            onClick={() => onRemoveTag(tag)}
            aria-label={`Remove tag ${tag}`}
            type="button"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
