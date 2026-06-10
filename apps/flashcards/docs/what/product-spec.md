# Product Specification

<!-- SITE_DESCRIPTION: Flashcard app for structured learning with themed datasets (geography, maths, solfège), flip mode, rich rendering (SVG scores, audio), and local progress tracking. -->

## 1. Vision

A structured, extensible flashcard system for multi-domain learning — geography, maths, music — with rich card rendering (text, markdown, SVG music scores, browser audio) and local progress tracking. No backend, no accounts.

## 2. Users and Actors

Learners studying geography, mathematics, or music theory.

## 3. Problems to Solve

- Memorization without structure
- No progress tracking
- Text-only flashcards insufficient for music/visual learning

## 4. Product Goals

- Display cards from themed datasets (geography, maths, solfège)
- Track session progress
- Extensible theme/mode architecture
- Extensible card rendering: text, markdown, SVG music notation (VexFlow), browser audio (Tone.js)

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
- ScoreData

## 7. Product Capabilities

- Theme selection (geography: 12 datasets; maths: multiplication tables; language: conjugaisons; music: solfège)
- Flip interaction
- Session scoring
- Results summary
- Rich rendering support via pluggable RenderEngine (text, markdown, SVG music notation, browser audio)

## 8. High-Level Workflows

Home → Session → Results → replay

## 9. Business Rules

- No backend
- localStorage only
- Algorithm in isolated hook

## 10. Success Criteria

User can complete a session with score visible.

## 11. Open Questions