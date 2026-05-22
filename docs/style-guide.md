# Style Guide

## 1. Color Palette

| Purpose | Hex | Usage |
|---------|-----|-------|
| Primary | #1D4ED8 | Buttons, links, active states |
| Secondary | #64748B | Secondary actions, muted text |
| Accent | #F59E0B | Highlights, alerts |
| Background | #F9FAFB | Page background |
| Surface | #FFFFFF | Card backgrounds |
| Border | #E5E7EB | Borders, dividers |

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

- **Button**: `bg-primary text-white hover:bg-primary/90`.
- **Card**: `bg-surface shadow-md rounded-lg p-4`.
- **Table**: `min-w-full divide-y divide-border`.
- **Input**: `border border-border rounded-md p-2 w-full`.

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
