import React from 'react';
import { X } from 'lucide-react';
import { getTagColor } from '../models/tagModel';

export interface TagListProps {
  tags: string[];
  onRemoveTag: (tag: string) => void;
}

/**
 * TagList Component
 * 
 * Displays selected tags as colored chips with remove option
 * - Renders each tag with deterministic background color from getTagColor()
 * - Shows X button to remove each tag
 * - Accessible with ARIA labels
 */
export function TagList({ tags, onRemoveTag }: TagListProps): React.ReactElement {
  if (tags.length === 0) {
    return <div className="text-sm text-muted-foreground">No tags selected</div>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const bgColor = getTagColor(tag);
        // Create a CSS variable for the background color
        const style = {
          backgroundColor: bgColor,
        };

        return (
          <div
            key={tag}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-white"
            style={style}
            role="option"
            aria-selected="true"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => onRemoveTag(tag)}
              className="inline-flex items-center justify-center rounded-full hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white"
              aria-label={`Remove tag ${tag}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

TagList.displayName = 'TagList';
