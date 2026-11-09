// Ship the style files as plain CSS. Apps import styles.css after `@import "tailwindcss"`,
// so Tailwind in the app compiles it (and resolves its `@import "./tokens.css"`).
// They are not processed here.
import { copyFileSync, mkdirSync } from 'node:fs'

mkdirSync('dist', { recursive: true })
for (const file of ['styles.css', 'tokens.css']) {
  copyFileSync(`src/styles/${file}`, `dist/${file}`)
  console.log(`copied src/styles/${file} -> dist/${file}`)
}
