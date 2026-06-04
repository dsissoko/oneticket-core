# US-004 — Add Thought

## Story

As a journaler, I want to add a new thought with a title, content, and optional tags, with automatic timestamping, so that I can capture my thoughts quickly and return to the home screen to see them immediately.

## Expected Behavior

Users access a form to create new thoughts. The form includes inputs for title, content, and tags with autocomplete support. Upon successful submission, the new thought appears at the top of the home screen list with a generated timestamp.

## Acceptance Criteria

1. Form includes title input (required), content textarea (required), and optional tag input
2. Tag input supports autocomplete from existing tags, displayed as real-time suggestions
3. Pressing Enter or selecting a suggestion adds the tag; pressing Enter on empty input has no effect
4. Multiple tags can be added to a single thought, displayed as removable chips with their assigned colors
5. Auto-generated timestamp is set at save time and is not user-editable
6. Form validation prevents submission if title or content is empty
7. On successful save: redirect to home screen and display new thought at top of list
8. Optional success feedback (e.g., toast notification) confirms thought was saved

## Related Epic

[Epic 0 — MonJournal MVP](epic.md)

## Related Slices

(To be populated by @architect)
