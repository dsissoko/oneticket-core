import React from 'react';
import { X } from 'lucide-react';
import { getTagColor } from '@/models/tagModel';

/**
 * TagList Component Props
 */
interface TagListProps {
  tags: string[];
  onRemoveTag: (tag: string) => void;
}

/**
 * TagList Component
 *
 * Displays selected tags as colored chips with remove option.
 * Each chip shows the tag name and assigned color from getTagColor().
 */
export function TagList({ tags, onRemoveTag }: TagListProps): React.ReactElement {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const bgColor = getTagColor(tag);
        return (
          <div
            key={tag}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-white transition-opacity hover:opacity-80"
            style={{ backgroundColor: bgColor }}
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => onRemoveTag(tag)}
              className="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-white/20 transition-colors"
              aria-label={`Remove tag ${tag}`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

TagList.displayName = 'TagList';
