# EcoLens AI — Accessibility (a11y) Conformance

This document details the accessibility improvements implemented across the EcoLens AI application to achieve **90+ WCAG 2.1 AA Conformance**.

## Accessibility Principles Implemented

### 1. Focus Management & Navigation
- **Skip-To-Content Link (`SkipLink.jsx`):** A keyboard-accessible link at the very top of the page (`#main-content`) allows screen reader and keyboard-only users to bypass navigation sidebars.
- **Visible Focus Indicator (`index.css`):** Added a global high-contrast outline on all interactive components (`focus-visible:ring-2 focus-visible:ring-eco-500`) to guarantee clear visual tracking.

### 2. Semantic Structure
- **Landmark Elements:** Structured the page layout with `<header>`, `<main id="main-content">`, `<nav>`, and `<footer>` HTML5 semantic landmarks.
- **Section Headers:** Used `<section aria-labelledby="...">` and `<article>` tags to structure dashboard metrics, weekly trends, and calculators.
- **Heading Hierarchy:** Maintained a strict heading levels structure (`h1` -> `h2` -> `h3` -> `h4`) with exactly one `h1` per page.

### 3. Accessible Form Controls
- **Explicit Label Associations:** Connected every form field `<label>` explicitly to its `<input>` tag using `htmlFor` and matching `id` values.
- **WAI-ARIA Description Bindings:** Linked form validation error containers directly to their target fields using `aria-describedby` and `aria-invalid` attributes.
- **Native Keyboard Inputs:** Converted custom food and shopping clickable `<div>` cards in `CarbonCalculator.jsx` into native `<input type="radio">` cards wrapped in `<fieldset>` and `<legend>` layers, restoring complete arrow key keyboard controls.

### 4. Screen Readers & Assistive Technology
- **Live Regions (`aria-live`):** Form alerts and OCR result status boxes use `aria-live="polite"` or `role="status"` to announce real-time state changes to screen readers.
- **Decorative Elements (`aria-hidden`):** Marked all visual icons (using Lucide) with `aria-hidden="true"` to prevent screen readers from reading empty text symbols.
- **Helper Labels:** Provided context-specific `aria-label` attributes on progress indicators and update controls.
- **Screen Reader Only Text (`.sr-only`):** Utilized screen-reader-only spans to explain contextual units (e.g. progress bar totals or button actions) without cluttering the visual UI.
