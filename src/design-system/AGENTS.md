# RSM Design System — AI Agent Guide

This document is the canonical reference for the design system that lives under `src/design-system/`. It is targeted at AI coding assistants and human contributors who need to build UI in this repo. Read it before adding any new component, screen, or styling.

## 1. Purpose

The design system is a **token-driven, self-contained foundation** modeled on the WordPress Gutenberg design system (`@wordpress/base-styles`). It exists so that:

1. New components can be assembled from a small set of primitives (`Button`, `TextControl`, `TextareaControl`, `Checkbox`, `Text`) instead of hand-rolling styles every time.
2. Every spacing, color, typography, radius, and shadow value comes from a named CSS variable (`--wpds-*`), so visual changes can be made centrally.
3. The look and feel matches WordPress conventions (admin theme blue `#007cba`, 8px grid, 13/15/20 type scale) without depending on `@wordpress/components` for styling.

### What this is not

- It is **not** a wrapper around `@wordpress/components`. Primitives are fresh React components.
- It is **not** a replacement for `@wordpress/components` and `@wordpress/icons` — those remain in use across the existing prototype. The design system is **additive and opt-in**.
- It is **not** a replacement for the existing `src/styles/wordpress-vars.css` (`--wp-*`) variables, which other prototype code still consumes. Both layers coexist.

## 2. Source of truth

All token values are taken verbatim from `node_modules/@wordpress/base-styles/_variables.scss` and `_colors.scss`. If you ever need to add a new token, look there first — never invent values.

## 3. File layout

```
src/design-system/
├── AGENTS.md                  ← this file
├── index.js                   ← top-level barrel; importing from here pulls in tokens
├── tokens/
│   ├── index.css              ← @imports the five token files
│   ├── colors.css             ← --wpds-color-*
│   ├── spacing.css            ← --wpds-space-*
│   ├── typography.css         ← --wpds-font-* / --wpds-line-height-*
│   ├── radius.css             ← --wpds-radius-*
│   └── elevation.css          ← --wpds-shadow-*
└── primitives/
    ├── index.js
    ├── Button/        (Button.jsx + Button.css + index.js)
    ├── TextControl/   (TextControl.jsx + TextControl.css + index.js)
    ├── TextareaControl/
    ├── Checkbox/
    └── Text/
```

CSS for each primitive is co-located and imported by the JSX file (`import './Button.css'`). Token CSS is imported once by `src/design-system/index.js`. Vite injects everything at consumer-import time — there is **no global side-effect on bundles that don't import the design system**.

## 4. How to use it

### Import primitives

```jsx
import { Button, TextControl, Checkbox, Text } from '../../design-system';
// or per-primitive:
import { Button } from '../../design-system/primitives/Button';
```

The first import in the app to touch `src/design-system/index.js` causes the token CSS to be loaded. After that, `--wpds-*` variables are available globally (they're declared on `:root`).

### Use tokens directly in your own component CSS

If your component is not a primitive (e.g. a view-level layout or a one-off card), reference the variables directly:

```css
.my-card {
  padding: var(--wpds-space-20);          /* 16px */
  border: 1px solid var(--wpds-color-border);
  border-radius: var(--wpds-radius-medium); /* 4px */
  background: var(--wpds-color-surface);
  box-shadow: var(--wpds-shadow-x-small);
}
```

Make sure the file that owns `.my-card` imports the design system (or imports it transitively) so the variables resolve.

## 5. Token reference

### 5.1 Colors (`tokens/colors.css`)

| Token | Value |
|---|---|
| `--wpds-color-black` | `#000` |
| `--wpds-color-white` | `#fff` |
| `--wpds-color-gray-100` | `#f0f0f0` |
| `--wpds-color-gray-200` | `#e0e0e0` |
| `--wpds-color-gray-300` | `#ddd` (default border) |
| `--wpds-color-gray-400` | `#ccc` |
| `--wpds-color-gray-600` | `#949494` (3:1 contrast) |
| `--wpds-color-gray-700` | `#757575` (4.6:1 contrast — muted text) |
| `--wpds-color-gray-800` | `#2f2f2f` |
| `--wpds-color-gray-900` | `#1e1e1e` (UI black) |
| `--wpds-color-alert-yellow` | `#f0b849` |
| `--wpds-color-alert-red` | `#cc1818` |
| `--wpds-color-alert-green` | `#4ab866` |
| `--wpds-color-admin-theme` | `#007cba` (primary action color) |
| `--wpds-color-admin-theme-hover` | `#005a87` |
| `--wpds-color-admin-theme-active` | `#00466b` |

Semantic aliases (use these in app code, not the raw scale, when intent is "text" / "border" / "surface"):

| Token | Resolves to |
|---|---|
| `--wpds-color-text` | gray-900 |
| `--wpds-color-text-muted` | gray-700 |
| `--wpds-color-text-on-theme` | white |
| `--wpds-color-border` | gray-300 |
| `--wpds-color-border-strong` | gray-700 |
| `--wpds-color-surface` | white |
| `--wpds-color-surface-subtle` | gray-100 |
| `--wpds-color-surface-disabled` | gray-100 |
| `--wpds-color-focus` | admin-theme |

### 5.2 Spacing (`tokens/spacing.css`) — 8px grid

The numeric scale mirrors WordPress's `$grid-unit-XX` naming exactly. **Always use a token for padding, margin, gap, and translate offsets.** Never hard-code a pixel number for whitespace.

| Token | Value |
|---|---|
| `--wpds-space-05` | `4px` |
| `--wpds-space-10` | `8px` |
| `--wpds-space-15` | `12px` |
| `--wpds-space-20` | `16px` |
| `--wpds-space-30` | `24px` |
| `--wpds-space-40` | `32px` |
| `--wpds-space-50` | `40px` |
| `--wpds-space-60` | `48px` |
| `--wpds-space-70` | `56px` |
| `--wpds-space-80` | `64px` |

T-shirt aliases (`--wpds-space-xs`, `-sm`, `-md`, `-lg`, `-xl`, `-2xl`, `-3xl`) point at the same values for ergonomic use, but the numeric scale is canonical and matches the WordPress source.

### 5.3 Typography (`tokens/typography.css`)

Always pair a `font-size` with the matching `line-height` from the same step, or use the `<Text variant>` primitive (which does this for you).

| Step | font-size | line-height |
|---|---|---|
| `x-small` | `11px` | `16px` |
| `small` | `12px` | `20px` |
| `medium` | `13px` | `24px` (default body) |
| `large` | `15px` | `28px` |
| `x-large` | `20px` | `32px` |
| `2x-large` | `32px` | `40px` |

Other typography tokens:

- `--wpds-font-family-body` / `--wpds-font-family-headings` — system font stack (`-apple-system, "system-ui", "Segoe UI", Roboto, …`).
- `--wpds-font-family-mono` — `Menlo, Consolas, monaco, monospace`.
- `--wpds-font-weight-regular: 400`.
- `--wpds-font-weight-medium: 499` — **the value is intentionally 499** so systems without a `499` font fall back to `400`, not `600`. Do not "fix" this to 500.

### 5.4 Radius (`tokens/radius.css`)

| Token | Value | Use |
|---|---|---|
| `--wpds-radius-x-small` | `1px` | Buttons nested inside inputs. |
| `--wpds-radius-small` | `2px` | Most primitives (default). |
| `--wpds-radius-medium` | `4px` | Containers with smaller padding. |
| `--wpds-radius-large` | `8px` | Containers with larger padding. |
| `--wpds-radius-full` | `9999px` | Pills. |
| `--wpds-radius-round` | `50%` | Circles / ovals. |

### 5.5 Elevation (`tokens/elevation.css`)

| Token | Use |
|---|---|
| `--wpds-shadow-x-small` | Sections / containers grouping related content (e.g. preview frame). |
| `--wpds-shadow-small` | Non-interruptive contextual feedback (tooltips, snackbars). |
| `--wpds-shadow-medium` | Menus, command palettes, secondary surfaces. |
| `--wpds-shadow-large` | Modals and confirm dialogs. |

## 6. Primitives

### `<Button>`

```jsx
<Button variant="primary" size="default" onClick={save}>Save</Button>
<Button variant="secondary" iconLeft={pencil}>Edit</Button>
<Button variant="link">Reset</Button>
<Button variant="primary" isBusy>Saving…</Button>
```

| Prop | Values | Default |
|---|---|---|
| `variant` | `primary` \| `secondary` \| `tertiary` \| `link` | `secondary` |
| `size` | `default` (36px) \| `small` (24px) \| `compact` (32px) | `default` |
| `disabled` | `boolean` | `false` |
| `isBusy` | `boolean` (renders as disabled + busy cursor) | `false` |
| `iconLeft`, `iconRight` | React node (use `@wordpress/icons` icons) | `null` |
| `type` | passes through to `<button type>` | `'button'` |
| `className` | extra classes appended | `''` |
| Any other prop | spread onto the underlying `<button>` | — |

### `<TextControl>` and `<TextareaControl>`

```jsx
<TextControl
  label="Site title"
  value={title}
  onChange={(v) => setTitle(v)}
  help="Shown in the browser tab and SEO results."
/>

<TextControl label="Email" value={email} onChange={setEmail} error="Required" />

<TextareaControl label="Description" value={desc} onChange={setDesc} rows={6} />
```

`onChange` is called with `(value, event)` — pass the value directly to a state setter. Both controls render `label / input / help-or-error` with the appropriate ARIA wiring (`aria-describedby`, `aria-invalid`).

### `<Checkbox>`

```jsx
<Checkbox label="Send me updates" checked={ok} onChange={setOk} />
```

`onChange` is called with `(checked, event)`. The visual checkmark is drawn via an inline SVG `background-image` so it scales cleanly and uses the admin theme color.

### `<Text>`

```jsx
<Text variant="2xLarge" as="h1" weight="medium">Welcome</Text>
<Text variant="body">Some paragraph text.</Text>
<Text variant="small" muted>Helper / secondary copy.</Text>
```

| Prop | Values | Default |
|---|---|---|
| `variant` | `xSmall` \| `small` \| `body` \| `large` \| `xLarge` \| `2xLarge` | `body` |
| `weight` | `regular` \| `medium` | `regular` |
| `muted` | `boolean` (uses `--wpds-color-text-muted`) | `false` |
| `as` | any HTML tag (`'h1'`, `'p'`, `'div'`, …) | `'span'` |

## 7. Rules for adding new primitives

1. Create a folder `src/design-system/primitives/<Name>/` with `Name.jsx`, `Name.css`, `index.js`.
2. The `.jsx` must do `import './Name.css'` at the top.
3. **Every value** in `Name.css` (color, spacing, font size, radius, shadow) must come from a `--wpds-*` token. No raw hex, no raw px (px is OK only for sub-token internals like `1px` borders, icon sizes, or values explicitly defined in WordPress base-styles like `36px` button height).
4. CSS class names use the `wpds-` prefix and BEM-ish modifiers: `.wpds-foo`, `.wpds-foo__part`, `.wpds-foo--variant`.
5. Export the component as a named export. Re-export from `primitives/index.js` and `src/design-system/index.js`.
6. Update this `AGENTS.md` with a short usage section, including a props table.

## 8. Rules for composing higher-level components

When building a view, modal, or feature component:

1. Reach for a primitive first. If you're styling a button by hand, use `<Button>`. If you're styling a label + input, use `<TextControl>`.
2. For layout-only styling (containers, grids, panels) write component-scoped CSS that consumes `--wpds-*` tokens directly.
3. Do **not** override primitive internals via descendant selectors (`.my-card .wpds-button { ... }`). If a primitive doesn't fit, extend the primitive itself with a new variant, or compose around it.
4. Keep new component classes prefix-namespaced (e.g. `.my-feature-*`) so they don't collide with the existing prototype's `.cs-`, `.ah-`, `.pp-`, `.sb-` prefixes or with `wpds-`.

## 9. Forbidden patterns

- ❌ Raw hex colors in primitive CSS. Use a `--wpds-color-*` token.
- ❌ Hard-coded spacing in `px` for padding / margin / gap. Use `--wpds-space-*`.
- ❌ Mixing typographic size and line-height across steps (e.g. medium font-size with x-large line-height). Pair them, or use `<Text variant>`.
- ❌ Sass / Less / PostCSS-specific syntax. The repo is plain CSS (see root `AGENTS.md`).
- ❌ CSS-in-JS, Tailwind, styled-components.
- ❌ Modifying `src/styles/wordpress-vars.css` from inside the design system. The two namespaces (`--wp-*` and `--wpds-*`) are independent.
- ❌ Importing `@wordpress/components` styles inside a primitive. Primitives are self-contained.

## 10. Relationship to existing prototype code

| Concern | Existing prototype | Design system |
|---|---|---|
| Variables | `--wp-*` in `src/styles/wordpress-vars.css` | `--wpds-*` in `src/design-system/tokens/` |
| Buttons | `Button` from `@wordpress/components` | `Button` from `src/design-system` |
| Form fields | bespoke per-component | `TextControl`, `TextareaControl`, `Checkbox` |
| Typography | inline `font-size` rules in `src/styles/index.css` | `<Text variant>` |
| Class prefixes | `.cs-`, `.ah-`, `.pp-`, `.sb-`, `.ni`, `.ct-` | `.wpds-` |

Both sets coexist. New code should prefer the design system. Existing code may be migrated incrementally as features are touched, but no big-bang rewrite is planned.

## 11. Quick recipe — building a Card with the design system

```jsx
import { Text, Button } from '../../design-system';
import './Card.css';

export function Card({ title, body, onAction }) {
  return (
    <div className="my-card">
      <Text variant="large" weight="medium" as="h3">{title}</Text>
      <Text variant="body" muted as="p">{body}</Text>
      <Button variant="primary" onClick={onAction}>Get started</Button>
    </div>
  );
}
```

```css
/* Card.css */
.my-card {
  display: flex;
  flex-direction: column;
  gap: var(--wpds-space-15);
  padding: var(--wpds-space-30);
  border: 1px solid var(--wpds-color-border);
  border-radius: var(--wpds-radius-large);
  background: var(--wpds-color-surface);
  box-shadow: var(--wpds-shadow-x-small);
}
```

That's the whole loop: import primitives, use tokens for the rest, never hand-pick a hex code or a pixel padding.
