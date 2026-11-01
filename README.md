# @noletorious/ui

Shared design system for the single-purpose apps: design tokens, a theme provider, and components. React 18, Tailwind CSS v4, built with Vite.

## What is in it

- **Tokens** (`@noletorious/ui/styles.css`): light and dark color variables, base styles. One file, one source of truth.
- **Theme**: `ThemeProvider`, `useTheme`, and `getThemeInitScript` (no light/dark flash on load).
- **Components**: `Button`. More are extracted from the apps over time.
- **Utility**: `cn` (clsx plus tailwind-merge).

The library makes no network requests: no web fonts, no analytics, no remote images.

## Use it in an app

Install by exact tag. Never track `main`.

```bash
npm install github:noletorious/noletorious-ui#v0.1.0
```

The package is built on install (`prepare` script), so the first install takes a few seconds longer.

App CSS (`src/index.css`):

```css
@import "tailwindcss";
@import "@noletorious/ui/styles.css";
@import "./brand.css";
@source "../node_modules/@noletorious/ui/dist";
```

Keep every `@import` before `@source`. CSS requires imports first, and a `@source` line in the middle triggers a build warning.

`@source` is required with the PostCSS plugin (`@tailwindcss/postcss`). Without it Tailwind does not scan `node_modules` and the library components render unstyled. The Vite plugin (`@tailwindcss/vite`) picks them up on its own, but keeping the line does no harm.

Theme, in `main.tsx`:

```tsx
import { ThemeProvider, Button } from '@noletorious/ui'

<ThemeProvider defaultTheme="system" storageKey="app-theme">
  <App />
</ThemeProvider>
```

No-flash script, inline in `index.html` `<head>`. Use the same storage key as `ThemeProvider`:

```html
<script>
  (function () {
    try {
      var stored = localStorage.getItem('app-theme') || 'system'
      var dark = stored === 'dark' || (stored === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      document.documentElement.classList.toggle('dark', dark)
      document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
    } catch (e) {}
  })()
</script>
```

`getThemeInitScript(storageKey)` returns the same code as a string, for a Vite `transformIndexHtml` hook or a server-rendered page.

## App accent (`brand.css`)

Apps share the neutrals, radius, type, and component shapes. Each app sets its own accent. Define every token twice, once for light and once for dark, and import the file after the library styles:

```css
/* src/brand.css */
@theme static {
  --color-primary: hsl(160 84% 30%);
  --color-primary-foreground: hsl(0 0% 100%);
  --color-accent: hsl(160 84% 30%);
  --color-accent-foreground: hsl(0 0% 100%);
  --color-ring: hsl(160 84% 30%);
}
.dark {
  --color-primary: hsl(160 70% 50%);
  --color-primary-foreground: hsl(160 90% 8%);
  --color-accent: hsl(160 70% 50%);
  --color-accent-foreground: hsl(160 90% 8%);
  --color-ring: hsl(160 70% 50%);
}
```

Check the accents before shipping:

```bash
npm run contrast -- --brand ../path/to/app/src/brand.css
```

Do not add new token names in an app. If an app needs a new semantic color, add it here first.

## Develop

```bash
npm install
npm run storybook      # http://localhost:6006, light/dark switch in the toolbar
npm run type-check
npm run contrast       # WCAG check of the token pairs, both themes
npm run build          # dist/ (also runs on install via "prepare")
```

Every change goes through: stories in both themes, `npm run contrast`, `npm run type-check`, `npm run build`. See `docs/ui-workflow.md` in SP (the `single-purpose` repo) for the full release and rollout flow.

## Versions

Semver tags. Patch for visual fixes, minor for new components or tokens, major for renamed or removed tokens, props, or components. See [CHANGELOG.md](CHANGELOG.md).
