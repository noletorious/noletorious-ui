# Changelog

## [0.1.0] - unreleased

First version as a consumable library. Replaces the Next 12 scaffold.

### Added
- Vite library build (ESM, generated types) with `prepare` so a git tag installs a built package.
- `@noletorious/ui/styles.css`: one token source with light values in `@theme static` and dark overrides under `.dark`. Includes `popover` tokens and a base layer (border color, body colors, pointer cursor).
- `ThemeProvider`, `useTheme`, `getThemeInitScript`.
- `Button` (variants: default, destructive, outline, secondary, ghost, link; sizes: default, sm, lg, icon) and `cn`.
- `npm run contrast`: WCAG check of token pairs in both themes, with `--brand` to include an app's accent overrides.
- Storybook 8 on Vite with the a11y addon and a light/dark toolbar switch. Stories for `Button` and the color tokens. Telemetry is off.

### Removed
- Next 12 app, pages, rollup config, yarn lockfile, committed `storybook-static`, and the old demo `Button` (`label`/`primary` props). Nothing consumed it.

### Not yet
- Radius, spacing, and type scale tokens.
- `warning` and `success` color tokens (apps currently hardcode amber and emerald).
- Components beyond `Button`: Card, Dialog, DropdownMenu, ThemeToggle, BrandLogo, EngineSelector, AboutModal.
