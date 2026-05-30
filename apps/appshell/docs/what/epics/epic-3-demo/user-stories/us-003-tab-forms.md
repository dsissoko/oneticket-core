# US-003 — Tab: Forms

## Story

As a developer, I want a Forms tab so that I can see React Hook Form + Zod validation working with shadcn form components.

## Expected Behavior

- Simple form with name and email fields
- Zod schema validates input on submit
- Validation errors displayed inline below fields
- Successful submission shows a success message
- Form uses shadcn `Form`, `Input`, `Button` components

## Acceptance Criteria

- [ ] `react-hook-form` and `zod` installed
- [ ] Form schema defined with Zod (name: required string, email: valid email)
- [ ] Inline validation errors displayed on submit
- [ ] Success state shown after valid submission
- [ ] All form fields use shadcn components
- [ ] Form accessible — labels associated with inputs
