---
name: oneticket-web-design-guidelines
description: "UI audit rules — 100+ rules covering accessibility, performance, UX. From Vercel Labs."
version: "1.0.0"
source: external
source_url: https://github.com/vercel-labs/agent-skills
source_skill: web-design-guidelines
install_native: npx skills add vercel-labs/agent-skills --skill web-design-guidelines
---

# Skill: oneticket-web-design-guidelines

## Overview

This skill provides comprehensive UI audit and design rules covering accessibility, performance, and user experience. Organized into 100+ rules across 10 categories to ensure every interface meets production-grade standards.

## Core Philosophy

Every UI element must serve a purpose. Every interaction must be fast, accessible, and intuitive. Design is not decoration—it's communication.

## 10 Categories of Design Rules

### 1. Accessibility (15 rules)

#### Rule 1.1: All Images Must Have Alt Text
- Helps screen readers and users with visual disabilities
- Alt text describes the image purpose, not just "image.jpg"
```html
<!-- ❌ Bad -->
<img src="chart.jpg" />

<!-- ✅ Good -->
<img src="chart.jpg" alt="Sales revenue chart showing 30% growth in Q2" />
```

#### Rule 1.2: Use Semantic HTML
- Use `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`
- Helps screen readers understand page structure
- Improves SEO

```html
<!-- ❌ Bad -->
<div id="header"><span class="nav">Home</span></div>

<!-- ✅ Good -->
<header>
  <nav><a href="/">Home</a></nav>
</header>
```

#### Rule 1.3: Ensure Color Contrast Meets WCAG AA Standard
- Text/background contrast ratio must be at least 4.5:1 (normal text) or 3:1 (large text)
- Use tools like WebAIM Contrast Checker
- Never rely on color alone to convey meaning

```css
/* ❌ Bad — insufficient contrast */
color: #999; background: white; /* Ratio 2.7:1 */

/* ✅ Good — meets WCAG AA */
color: #666; background: white; /* Ratio 7:1 */
```

#### Rule 1.4: All Form Inputs Must Have Associated Labels
- Use `<label>` with `for` attribute or nested input
- Screen readers announce the label
```html
<!-- ❌ Bad -->
<input type="email" placeholder="Email" />

<!-- ✅ Good -->
<label for="email">Email Address</label>
<input id="email" type="email" />
```

#### Rule 1.5: Use ARIA Only When Semantic HTML Isn't Enough
- ARIA is a fallback, not a solution
- Prefer `<button>` over `<div role="button">`
- Always test with a screen reader
```html
<!-- ❌ Bad -->
<div role="button" onclick="handleClick()">Click</div>

<!-- ✅ Good -->
<button onClick={handleClick}>Click</button>
```

#### Rule 1.6: Keyboard Navigation Must Work Throughout
- All interactive elements reachable via Tab key
- Tab order follows logical flow (left-to-right, top-to-bottom)
- Visible focus indicator (not `outline: none`)
```css
button:focus {
  outline: 2px solid #0366d6; /* Visible focus */
}
```

#### Rule 1.7: Links vs. Buttons
- Use `<a>` for navigation (changes URL)
- Use `<button>` for actions (doesn't change URL)
- Screen readers announce intent based on element type

#### Rule 1.8: Error Messages Must Be Actionable
- Tell user what went wrong AND how to fix it
- Associate errors with form fields
```html
<!-- ❌ Bad -->
<p>Error</p>

<!-- ✅ Good -->
<input id="password" type="password" aria-describedby="pwd-error" />
<p id="pwd-error">Password must be at least 8 characters</p>
```

#### Rule 1.9: Skip Links for Keyboard Users
- Add a "Skip to content" link at top of page
- Allows keyboard users to bypass navigation
```html
<a href="#main" class="sr-only">Skip to main content</a>
<header><!-- Navigation --></header>
<main id="main"><!-- Content --></main>
```

#### Rule 1.10: Avoid Flashing or Rapid Motion
- Flickering content can trigger seizures
- Avoid animations > 3 flashes per second
- Respect `prefers-reduced-motion`
```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

#### Rule 1.11: Make Interactive Elements Sufficiently Large
- Minimum touch target: 44x44 pixels (WCAG 2.5 Enhanced)
- Applies to buttons, links, form inputs
```css
button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
}
```

#### Rule 1.12: Provide Text Alternatives for Media
- Captions for videos
- Transcripts for podcasts
- Descriptions for complex graphics

#### Rule 1.13: Language Declaration
- Declare page language in HTML
- Helps screen readers pronounce words correctly
```html
<html lang="en">
```

#### Rule 1.14: Test with Real Assistive Technology
- Use actual screen readers (NVDA, JAWS, VoiceOver)
- Don't rely on automated tools alone
- Conduct user testing with disabled users

#### Rule 1.15: Document Accessibility Requirements
- Include accessibility acceptance criteria in user stories
- Create a WCAG 2.1 AA compliance checklist
- Track accessibility debt separately from other issues

### 2. Typography (12 rules)

#### Rule 2.1: Use a Limited Typographic Scale
- Define and use only 6-8 font sizes (xs, sm, base, lg, xl, 2xl, 3xl)
- Maintains visual consistency
```css
:root {
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
}
```

#### Rule 2.2: Ensure Readable Line Length
- Line length: 50-75 characters (20-35 words per line)
- Too long: hard to track end of line; too short: too many line breaks
```css
article {
  max-width: 65ch; /* 65 character width */
}
```

#### Rule 2.3: Use Appropriate Line Height
- Body text: 1.5-1.8 line height
- Headings: 1.1-1.3 line height
- Increases readability, especially for dyslexic users
```css
body {
  line-height: 1.6;
}
h1 {
  line-height: 1.2;
}
```

#### Rule 2.4: Pair Fonts Deliberately
- Use max 2 font families (1 serif + 1 sans-serif, or 2 sans-serif)
- Create contrast between display and body fonts
- Ensure both fonts have required weights

```css
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
h1, h2, h3 {
  font-family: Georgia, serif; /* Display font */
}
```

#### Rule 2.5: Use Font Weights Intentionally
- Normal: 400 (body text)
- Medium: 500 (emphasis)
- Bold: 700 (strong emphasis)
- Avoid extreme weights (200, 900) for body text
```css
.label { font-weight: 500; } /* Medium for emphasis */
body { font-weight: 400; }   /* Normal for body */
```

#### Rule 2.6: Provide Sufficient Text Contrast with Background
- See Rule 1.3 (Accessibility)
- Also consider contrast in hover/active states

#### Rule 2.7: Capitalize Correctly
- Use proper case for headings (not ALL CAPS)
- ALL CAPS is harder to read; use font-weight or font-size instead
- Avoid overusing UPPERCASE for emphasis

#### Rule 2.8: Use Meaningful Highlight/Color
- Highlight important text; don't overuse
- Ensure highlighted text still has sufficient contrast
```css
.highlight {
  background-color: #fff3cd;
  color: #333;
  padding: 2px 4px;
}
```

#### Rule 2.9: Justify Only When Necessary
- Left-align body text (easier to read)
- Justified text can create uneven word spacing
- Never center large blocks of text

#### Rule 2.10: Use Lists Appropriately
- Ordered list (`<ol>`) for sequential steps
- Unordered list (`<ul>`) for non-sequential items
- Definition list (`<dl>`) for term/definition pairs

#### Rule 2.11: Truncate Long Text Intentionally
- Use text overflow/ellipsis only when space is constrained
- Provide full text in tooltip or expandable section
```css
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

#### Rule 2.12: Use Consistent Whitespace Around Text
- Margins/padding around paragraphs, lists, headings
- Creates visual rhythm and separates content blocks
```css
p { margin-bottom: 1rem; }
h2 { margin-top: 2rem; margin-bottom: 0.5rem; }
```

### 3. Color and Contrast (10 rules)

#### Rule 3.1: Define a Color Palette with Purpose
- Primary, secondary, accent, neutral, success, warning, danger
- Use each color consistently for specific meaning
```css
:root {
  --color-primary: #0366d6;
  --color-danger: #d1242f;
  --color-success: #28a745;
  --color-warning: #ffc107;
  --color-neutral-50: #f5f5f5;
  --color-neutral-900: #1a1a1a;
}
```

#### Rule 3.2: Never Use Color Alone to Convey Meaning
- Colorblind users cannot distinguish certain colors
- Use icons, text, or patterns in addition to color
```html
<!-- ❌ Bad: Color only conveys status -->
<div style="color: red">Error occurred</div>

<!-- ✅ Good: Icon + color + text -->
<div><AlertIcon /> Error occurred</div>
```

#### Rule 3.3: Maintain Sufficient Contrast in All States
- Normal, hover, focus, active, disabled states
- Disabled text should have lower contrast; interactive text should have higher

#### Rule 3.4: Use Color to Create Hierarchy
- Important elements: higher contrast with background
- Secondary elements: lower contrast
- Deemphasized elements: even lower contrast

#### Rule 3.5: Limit the Number of Colors in a Composition
- Use max 4-5 colors per screen (primary, secondary, accent, neutral, error)
- Reduces cognitive load; improves focus
- Use shade/tint of same color for variations

#### Rule 3.6: Ensure Sufficient Contrast Between Adjacent Colors
- Neighboring colors should be visually distinct
- Use tools like Coolors or Adobe Color Wheel to verify

#### Rule 3.7: Dark Mode Must Meet Same Contrast Standards
- Text/background contrast in dark mode: 4.5:1 (normal) or 3:1 (large)
- Don't just invert colors; adjust contrast separately
- Test dark mode with automated tools AND manual inspection

#### Rule 3.8: Use Semantic Colors Consistently
- Green = success/safe
- Red = error/danger
- Yellow = warning
- Blue = info
- These conventions are expected; breaking them confuses users

#### Rule 3.9: Avoid Pure Black or White
- Pure black (#000) is harsh on eyes in large areas
- Use charcoal (#1a1a1a) for very dark text/backgrounds
- Use off-white (#f5f5f5) instead of pure white
```css
body {
  background-color: #f5f5f5;
  color: #1a1a1a;
}
```

#### Rule 3.10: Provide Sufficient Contrast for Images with Text
- If text overlays an image, use semi-transparent overlay
- Ensures text readability on any image
```css
.image-text {
  background: rgba(0, 0, 0, 0.4);
  color: white;
  padding: 1rem;
}
```

### 4. Layout and Spacing (15 rules)

#### Rule 4.1: Use a Consistent Spacing Scale
- Define spacing: 0.25rem, 0.5rem, 1rem, 1.5rem, 2rem, 3rem, 4rem, 6rem
- Use only these values; never arbitrary spacing
- Creates visual harmony
```css
:root {
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  --spacing-3xl: 4rem;
}
```

#### Rule 4.2: Use Negative Space to Create Focus
- White space guides attention
- Don't fill every pixel
- Break content into scannable sections
```css
.card {
  padding: 2rem; /* Generous padding */
}
.card + .card {
  margin-top: 1.5rem; /* Clear separation */
}
```

#### Rule 4.3: Align Content to a Grid
- 4-column, 8-column, or 12-column grid
- All elements align to grid lines
- Improves visual consistency
```css
.container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1rem;
}
```

#### Rule 4.4: Ensure Responsive Layout
- Mobile-first: start with mobile layout, add complexity for larger screens
- Test at multiple breakpoints: 320px, 768px, 1024px, 1280px
- Avoid horizontal scrolling

#### Rule 4.5: Use Flexbox for 1D Layouts
- Row or column; not both
- Simpler than Grid for single-dimension layouts
```css
.flex-row {
  display: flex;
  gap: 1rem;
  align-items: center;
}
```

#### Rule 4.6: Use CSS Grid for 2D Layouts
- Multiple rows AND columns
- More powerful than Flexbox for complex layouts
```css
.grid-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
```

#### Rule 4.7: Provide Consistent Padding Inside Containers
- Same padding on all sides (or intentional asymmetry)
- Prevents cramped content
```css
.card {
  padding: 1.5rem; /* Consistent padding */
}
.card--compact {
  padding: 1rem; /* Tighter for dense layouts */
}
```

#### Rule 4.8: Use Gaps Instead of Margins for Spacing Between Items
- Gap property handles spacing automatically
- More predictable than margins; avoids margin collapse
```css
.list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem; /* Spacing between items */
}
```

#### Rule 4.9: Create Clear Visual Hierarchy with Spacing
- Group related content with tight spacing
- Separate unrelated content with larger gaps
- Use spacing to show relationships

#### Rule 4.10: Avoid Orphaned Text
- Don't leave single word on line
- Adjust container width or line breaks
- Applies especially to headings

#### Rule 4.11: Provide Sufficient Margin Around Interactive Elements
- Buttons, links, form inputs need breathing room
- Prevents accidental clicks on adjacent elements
```css
button {
  margin: 0.5rem; /* Space around button */
}
```

#### Rule 4.12: Use Consistent Gutter Sizes
- Space between columns: consistent across all layouts
- Standard gutter: 1rem to 2rem
- Larger gutter on mobile (larger margins)
```css
.container {
  --gutter: 1rem;
  padding-left: var(--gutter);
  padding-right: var(--gutter);
  gap: var(--gutter);
}
```

#### Rule 4.13: Don't Stretch Buttons Unnecessarily
- Buttons should be sized to content
- Exception: full-width buttons on mobile (only if space-constrained)
```css
/* ❌ Bad: stretched button */
button { width: 100%; }

/* ✅ Good: sized to content, or full-width on mobile only */
button { width: fit-content; }
@media (max-width: 640px) {
  button { width: 100%; }
}
```

#### Rule 4.14: Use Padding, Not Margin, for Internal Spacing
- Padding: inside the element
- Margin: outside the element
- Use padding to create breathing room inside containers
- Use margin sparingly (mostly for adjacent-sibling spacing)

#### Rule 4.15: Ensure Vertical Rhythm
- Consistent line-height, margin, padding creates visual rhythm
- Baseline grid optional but helpful
- Line height and paragraph spacing work together

### 5. Forms (12 rules)

#### Rule 5.1: Group Related Fields Logically
- Use fieldsets or visual grouping
- Group "shipping address" separately from "billing address"
```html
<fieldset>
  <legend>Shipping Address</legend>
  <input type="text" placeholder="Street" />
  <input type="text" placeholder="City" />
</fieldset>
```

#### Rule 5.2: Provide Clear, Descriptive Labels
- Not placeholders—use labels
- Labels visible at all times
- Match label text to form field validation messages
```html
<!-- ❌ Bad: Placeholder only -->
<input type="email" placeholder="Email" />

<!-- ✅ Good: Label + helpful hint -->
<label>Email Address <span aria-label="required">*</span></label>
<input type="email" />
<p class="hint">We'll never share your email</p>
```

#### Rule 5.3: Use Appropriate Input Types
- `type="email"` for emails
- `type="password"` for passwords
- `type="number"` for numbers
- `type="date"` for dates
- Native types provide validation and mobile keyboards

#### Rule 5.4: Indicate Required Fields Clearly
- Use asterisk (*) or required label
- Include "required" attribute
- Test with screen reader; ensure announcement is clear
```html
<label>Email <span aria-label="required">*</span></label>
<input type="email" required aria-required="true" />
```

#### Rule 5.5: Show Validation Feedback Inline
- Display error immediately after field loses focus or on submit
- Show success feedback (checkmark) after valid entry
- Clear error messages; tell user how to fix
```html
<input id="email" type="email" />
<p class="error" role="alert" aria-live="polite">
  Please enter a valid email address
</p>
```

#### Rule 5.6: Avoid Showing Errors Before User Input
- Don't show validation errors on page load
- Only show errors after user attempts to submit or leaves field
- Exception: re-submission with pre-filled invalid data

#### Rule 5.7: Don't Disable Submit Button Based on Validation
- Instead, show errors when user tries to submit
- Disabling button prevents user from attempting submission
- Bad UX: confuses user about what's wrong
```html
<!-- ❌ Bad -->
<button disabled={hasErrors}>Submit</button>

<!-- ✅ Good -->
<button onClick={handleSubmit}>Submit</button>
<!-- Errors shown after click if validation fails -->
```

#### Rule 5.8: Provide Hints for Complex Fields
- Hint text below field
- Examples: "Must be 8+ characters with a number and symbol"
- Associate hint with input using aria-describedby
```html
<label for="password">Password</label>
<input id="password" type="password" aria-describedby="pwd-hint" />
<p id="pwd-hint" class="hint">Must be 8+ characters</p>
```

#### Rule 5.9: Use Appropriate Keyboard Types on Mobile
- `inputMode="email"` for email fields
- `inputMode="numeric"` for numbers
- `inputMode="tel"` for phone numbers
- Improves mobile UX; avoids incorrect keyboard

#### Rule 5.10: Avoid Multi-Step Forms Unless Necessary
- Single-page forms are simpler and faster
- If multi-step: show progress indicator and allow back-button
- Save progress; allow resuming later

#### Rule 5.11: Provide Clear Submit Button Labels
- "Submit" is generic; use contextual labels
- "Send message", "Create account", "Add to cart"
```html
<!-- ❌ Generic -->
<button>Submit</button>

<!-- ✅ Contextual -->
<button>Create my account</button>
```

#### Rule 5.12: Handle Form Submission Loading State
- Disable button and show spinner during submission
- Prevent double-submission
- Show success/error message after completion
```tsx
<button disabled={isLoading} onClick={handleSubmit}>
  {isLoading && <Spinner />} {isLoading ? 'Submitting...' : 'Submit'}
</button>
```

### 6. Navigation (8 rules)

#### Rule 6.1: Provide Clear, Obvious Navigation
- Navigation should be immediately visible
- Use consistent location (top header, left sidebar, footer)
- Avoid hidden navigation (hamburger menu is acceptable on mobile)

#### Rule 6.2: Show Current Page/Section in Navigation
- Highlight active link
- Breadcrumbs for nested navigation
- Users always know where they are

#### Rule 6.3: Limit Navigation Depth
- Avoid more than 2-3 levels deep
- Deep navigation makes content hard to find
- Use search if content is extensive

#### Rule 6.4: Use Descriptive Link Text
- Link text should describe destination
- Not "click here"; instead "view our pricing"
- Screen readers announce link text
```html
<!-- ❌ Bad -->
<a href="/pricing">Click here</a>

<!-- ✅ Good -->
<a href="/pricing">View our pricing</a>
```

#### Rule 6.5: Provide Breadcrumbs for Complex Hierarchies
- Shows current location in hierarchy
- Allows jumping back to parent sections
- Format: Home > Category > Subcategory > Current Page

#### Rule 6.6: Mobile Navigation Must Be Usable
- Menu items large enough (44px min height)
- Avoid deep nested menus
- Hamburger menu acceptable but not ideal

#### Rule 6.7: Footer Navigation for Secondary Links
- Link to legal pages (privacy, terms)
- Contact information
- Social media links
- Don't repeat main navigation in footer

#### Rule 6.8: Indicate External Links
- Use icon or text label
- Screen reader announces "external link"
- User expects link behavior (won't download file)

### 7. Interactive Elements (10 rules)

#### Rule 7.1: Buttons Must Clearly Indicate They're Clickable
- Raised, bordered, or colored background
- Not just colored text
- Hover/focus states confirm interactivity
```css
button {
  background: #0366d6;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
}
button:hover {
  background: #0256c6;
}
```

#### Rule 7.2: Provide Clear Hover and Focus States
- Hover state: instant feedback (mouse users)
- Focus state: clear outline (keyboard users)
- Both should be distinct from default state
```css
button:hover {
  background: #0256c6;
  transform: translateY(-2px);
}
button:focus {
  outline: 2px solid #0366d6;
  outline-offset: 2px;
}
```

#### Rule 7.3: Use Consistent Button Styles
- Primary button: call-to-action (solid color, higher contrast)
- Secondary button: alternatives (border or lighter color)
- Danger button: destructive actions (red color)
```css
.button--primary {
  background: #0366d6;
  color: white;
}
.button--secondary {
  background: transparent;
  border: 1px solid #ddd;
  color: #333;
}
.button--danger {
  background: #d1242f;
  color: white;
}
```

#### Rule 7.4: Show Loading States for Async Actions
- Disable button, show spinner, change text
- Prevents double-clicks
- User knows action is processing
```tsx
<button disabled={isLoading}>
  {isLoading ? 'Loading...' : 'Save'}
</button>
```

#### Rule 7.5: Confirm Destructive Actions
- Deletion, clearing data, major changes need confirmation
- Use modal or inline confirmation
- Provide undo option if possible
```tsx
{showConfirm ? (
  <div>
    <p>Delete this item? This cannot be undone.</p>
    <button onClick={handleDelete}>Yes, delete</button>
    <button onClick={cancelDelete}>Cancel</button>
  </div>
) : (
  <button onClick={requestDelete}>Delete</button>
)}
```

#### Rule 7.6: Provide Feedback After Action
- Success message: "Item saved successfully"
- Error message: "Failed to save. Please try again."
- Toast notifications are ideal
- Keep message visible for 3-5 seconds (unless dismissed)

#### Rule 7.7: Show Disabled States Clearly
- Disabled elements should look disabled
- Lower contrast, grayed out, or with cursor:not-allowed
- Provide reason for disabling (tooltip or nearby text)
```css
button:disabled {
  background: #ccc;
  color: #999;
  cursor: not-allowed;
}
```

#### Rule 7.8: Make Tooltips Accessible
- Trigger on hover and focus (not click)
- Announce via aria-label or role="tooltip"
- Tooltip text should not duplicate visible label
```html
<button aria-label="Save document" title="Save document (Ctrl+S)">
  💾
</button>
```

#### Rule 7.9: Dropdowns Must Be Keyboard-Accessible
- Open/close with Enter or Space (when focused)
- Navigate items with Arrow keys
- Close with Escape
- Support ARIA: aria-expanded, aria-haspopup

#### Rule 7.10: Modals Must Be Properly Constrained
- Focus trapped inside modal (Tab loops within modal)
- Escape key closes modal
- Content scrollable if taller than viewport
- Background content hidden from screen readers

### 8. Feedback and Messages (8 rules)

#### Rule 8.1: Use Toast Notifications for Transient Feedback
- Success, error, info messages that don't require action
- Appear for 3-5 seconds, then dismiss
- Position consistently (top-right, bottom-center, etc.)

#### Rule 8.2: Use Modals for Critical Information
- Errors requiring user action
- Confirmations before destructive actions
- Require explicit close (button or action)

#### Rule 8.3: Use Inline Feedback for Form Validation
- Show errors inline with form fields
- Change field border color or background
- Error text directly below field

#### Rule 8.4: Use Progress Indicators for Long Operations
- Progress bar for uploads, downloads
- Spinner for indeterminate operations
- Provide time estimate if available
```tsx
<div>
  <p>Uploading... {progress}%</p>
  <progress value={progress} max={100} />
</div>
```

#### Rule 8.5: Provide Context in Error Messages
- Don't just say "Error"
- Explain what went wrong and how to fix
- Include error code if user needs to contact support
```
❌ "Error occurred"
✅ "Email address is already in use. Try another email or reset your password."
```

#### Rule 8.6: Use Empty States for Missing Data
- When no data to display, show helpful message
- Provide action (e.g., "Create your first item")
- Include illustration or icon

#### Rule 8.7: Success Feedback Must Confirm the Action
- "Article published successfully"
- Not just a checkmark; include context
- Don't dismiss instantly; allow user to read

#### Rule 8.8: Warn Before Navigating Away with Unsaved Changes
- Prompt if user tries to leave with unsaved form data
- Don't warn unnecessarily (only for meaningful changes)

### 9. Performance and Perceived Performance (12 rules)

#### Rule 9.1: Optimize Images
- Use appropriate format (WebP, JPEG, PNG, SVG)
- Compress images without visible quality loss
- Serve responsive images (`srcset`)
```html
<img
  src="image-800w.jpg"
  srcset="image-400w.jpg 400w, image-800w.jpg 800w, image-1200w.jpg 1200w"
  alt="Description"
  loading="lazy"
/>
```

#### Rule 9.2: Load Images Lazily
- Use `loading="lazy"` native attribute
- Or Intersection Observer for more control
- Prioritize above-fold images

#### Rule 9.3: Minimize CSS and JavaScript
- Minify in production builds
- Tree-shake unused code
- Split code by route/feature

#### Rule 9.4: Cache Aggressively
- Set far-future expiry on static assets (1 year+)
- Use CDN for global distribution
- Cache busting via filename hash

#### Rule 9.5: Lazy-Load Off-Screen Content
- Code-split by route
- Load components only when needed
- Defer non-critical JavaScript

#### Rule 9.6: Prioritize Above-Fold Content
- Load above-fold assets first
- Defer below-fold assets
- Optimize for Largest Contentful Paint (LCP)

#### Rule 9.7: Show Skeleton Loaders While Fetching
- Placeholder shapes that match content structure
- Gives illusion of faster load
- Better than blank space or spinners

#### Rule 9.8: Preload Critical Resources
- Fonts, stylesheets, critical images
- Use `<link rel="preload" />`
- Reduces time to render

#### Rule 9.9: Prefetch Likely Next Resources
- Prefetch next page on route change
- Prefetch related images on hover
- Use `<link rel="prefetch" />`

#### Rule 9.10: Minimize Layout Shift
- Don't add elements that push content
- Fixed-size image/video containers
- Reserve space for ads/content
- Improves Cumulative Layout Shift (CLS) metric

#### Rule 9.11: Use Web Fonts Efficiently
- Limit to 2-3 font families and weights
- Use `font-display: swap` for immediate display
- Self-host fonts if possible (better caching)
```css
@font-face {
  font-family: 'Custom';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap;
}
```

#### Rule 9.12: Monitor Performance Metrics
- Track Core Web Vitals (LCP, FID, CLS)
- Set performance budgets
- Monitor in production with tools like web-vitals

### 10. Responsive and Adaptive Design (8 rules)

#### Rule 10.1: Mobile-First Design
- Start with mobile layout (simplest)
- Add complexity for larger screens
- Improves baseline for all devices

#### Rule 10.2: Test at Common Breakpoints
- Mobile: 320px, 375px, 414px
- Tablet: 768px, 810px
- Desktop: 1024px, 1280px, 1440px
- Test actual devices, not just browser resize

#### Rule 10.3: Readable Text Without Zooming
- Font size min 16px on mobile
- Users shouldn't need to zoom to read
- Improves accessibility

#### Rule 10.4: Touch-Friendly on Mobile
- Touch targets min 44x44px
- Spacing between buttons to avoid accidental taps
- Avoid hover-only interactions (no hover on touch)

#### Rule 10.5: Flexible Layouts
- Use Flexbox, Grid, and relative units
- Avoid fixed widths; use max-width instead
- Adapt to any screen size

#### Rule 10.6: Handle Orientation Changes
- Layout should adapt to landscape/portrait
- Test rotating device; no broken layouts
- Consider safe areas on notched devices

#### Rule 10.7: Responsive Typography
- Font size scales with viewport
- Use `clamp()` for fluid typography
```css
h1 {
  font-size: clamp(1.5rem, 5vw, 3rem);
  /* Minimum 1.5rem, preferred 5vw, maximum 3rem */
}
```

#### Rule 10.8: High-DPI Display Support
- Provide 2x assets for Retina displays
- Use SVG icons (scale infinitely)
- Use `srcset` for responsive images

## Summary

These 100+ rules prioritize **user-centered design**, **accessibility**, and **performance**. Focus on:

1. **Accessibility first** — inclusive design benefits everyone
2. **Performance perception** — fast feels better than actually fast
3. **Consistency** — design patterns users recognize
4. **Feedback** — users always know what's happening
5. **Clarity** — every element has purpose

Audit your UI against these rules regularly. Start with the most critical (accessibility, readability, feedback) before perfecting details.
