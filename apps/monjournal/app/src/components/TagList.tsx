import React from 'react';
import { getTagColor } from '@/models/tagModel';
import { cn } from '@/lib/utils';

export interface TagListProps {
  tags: string[];
  onRemoveTag: (tag: string) => void;
}

/**
 * TagList - Display selected tags as colored chips
 * 
 * Renders each tag as a chip with deterministic color from getTagColor().
 * Includes remove button (X) for each tag.
 * Handles empty array gracefully.
 */
export function TagList({ tags, onRemoveTag }: TagListProps): React.ReactElement {
  if (tags.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No tags selected
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const backgroundColor = getTagColor(tag);
        
        return (
          <div
            key={tag}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium',
              'text-foreground border border-input'
            )}
            style={{
              backgroundColor: `${backgroundColor}30`, // 30 = 19% opacity (hex)
              borderColor: backgroundColor,
            }}
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => onRemoveTag(tag)}
              className={cn(
                'ml-1 inline-flex items-center justify-center',
                'w-4 h-4 rounded-full',
                'hover:bg-destructive hover:text-destructive-foreground',
                'transition-colors cursor-pointer'
              )}
              title={`Remove ${tag}`}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default TagList;
