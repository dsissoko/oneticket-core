# Product Specification

<!-- SITE_DESCRIPTION: Flashcard app for learning world capitals with flip mode and local progress tracking. -->

## 1. Vision

Learn world capitals efficiently via spaced-repetition-ready flashcard system.

## 2. Users and Actors

Learners studying geography.

## 3. Problems to Solve

- Memorization without structure
- No progress tracking

## 4. Product Goals

- Display cards from built-in theme
- Track session progress
- Extensible theme/mode architecture
- Extensible card rendering (text, markdown, future SVG/audio)

## 5. Out of Scope

- Backend
- User accounts
- Spaced-repetition algorithm (structure only)

## 6. Business Concepts

- Theme
- Card
- LearningMode
- SessionResult
- RenderEngine

## 7. Product Capabilities

- Theme selection
- Flip interaction
- Session scoring
- Results summary
- Rich rendering support via pluggable RenderEngine

## 8. High-Level Workflows

Home → Session → Results → replay

## 9. Business Rules

- No backend
- localStorage only
- Algorithm in isolated hook

## 10. Success Criteria

User can complete a session with score visible.

## 11. Open Questions