# Style Guide

## Overview

All styles are defined in [`app/globals.css`](../app/globals.css) using Tailwind CSS v4 with the `@theme` feature for custom color properties. The theme uses a 50–950 shade system for flexible color variations. The custom colors are automatically registered as Tailwind classes, so use standard Tailwind syntax (`bg-primary-600`, `text-neutral-700`, etc.) rather than CSS variable references throughout the application.

## 1. Color Palette

The color palette is defined in `globals.css` using CSS custom properties with a comprehensive shade system (50–950). Colors are organized by purpose:

### Primary Colors
Used for main interactive elements, buttons, links, and active states.
```css
--color-primary-50 through --color-primary-950
```
- `--color-primary-500`: #8b5cf6 (default)
- `--color-primary-600`: #7c3aed (hover/active)
- `--color-primary-700`: #6d28d9 (pressed)

### Accent Colors
Used for highlights, alerts, and secondary emphasis.
```css
--color-accent-50 through --color-accent-950
```
- `--color-accent-500`: #f59e0b (default)
- `--color-accent-600`: #d97706 (hover/active)

### Neutral Colors
Used for backgrounds, borders, text, and neutral UI elements.
```css
--color-neutral-50 through --color-neutral-950
```
- `--color-neutral-100`: #f1f5f9 (light background)
- `--color-neutral-500`: #64748b (muted text)
- `--color-neutral-900`: #0f172a (dark text)

### Semantic Colors
- **Success**: `--color-success-light`, `--color-success`, `--color-success-dark`
- **Danger**: `--color-danger-light`, `--color-danger`, `--color-danger-dark`
- **Warning**: `--color-warning-light`, `--color-warning`, `--color-warning-dark`
- **Info**: `--color-info-light`, `--color-info`, `--color-info-dark`

Use these for status indicators, validation messages, and contextual feedback.

## 2. Typography

- **Font family**: Geist (fallback: system-ui, sans-serif)
- **Base font size**: 16px (1rem)
- **Headings**: H1 2.5rem, H2 2rem, H3 1.75rem, H4 1.5rem, H5 1.25rem, H6 1rem
- **Line height**: 1.5
- **Font weights**: 400 (normal), 600 (semibold), 700 (bold)

## 3. Spacing

- Use Tailwind spacing scale (1‑64). Example: `p-4`, `m-8`.
- **Grid**: 12‑column layout for desktop, 6‑column for tablet, 4‑column for mobile.

## 4. Components

Use standard Tailwind class syntax with the custom color names. The `@theme` feature in `globals.css` automatically registers all custom color properties as Tailwind classes:

- **Button**: `bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus:ring-primary-500`.
- **Card**: `bg-white border border-neutral-200 rounded-lg shadow-md p-4`.
- **Table**: `min-w-full divide-y divide-neutral-200`.
- **Table Header**: `bg-neutral-100 text-neutral-700`.
- **Input**: `border border-neutral-300 rounded-md p-2 w-full focus:border-primary-500 focus:ring-2 focus:ring-primary-500`.
- **Alert Success**: `bg-success-light text-success-dark border-l-4 border-success`.
- **Alert Danger**: `bg-danger-light text-danger-dark border-l-4 border-danger`.
- **Alert Warning**: `bg-warning-light text-warning-dark border-l-4 border-warning`.

**Use `bg-primary-600` instead of `bg-[var(--color-primary-600)]`.** The bracket syntax is only needed when referencing custom properties in non-Tailwind contexts.

## 5. Accessibility

- Contrast ratio ≥ 4.5:1 for text.
- Focus ring: `outline outline-2 outline-offset-2 outline-primary`.
- ARIA roles for interactive elements.

## 6. Responsiveness

- Mobile first: breakpoints `sm`, `md`, `lg`, `xl`.
- Use `flex` and `grid` for layout.
- Touch targets ≥ 48px.

## 7. Branding

- Logo in header, left‑aligned.
- Primary color used for navigation and call‑to‑action.

## 8. Performance

- Lazy load images with `next/image`.
- Code‑split routes with `dynamic()`.
- Avoid large bundles.

---

Feel free to extend this guide as the project evolves.
