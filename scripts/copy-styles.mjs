// Ship the token file as plain CSS. Apps import it after `@import "tailwindcss"`,
// so Tailwind in the app compiles it. It is not processed here.
import { copyFileSync, mkdirSync } from 'node:fs'

mkdirSync('dist', { recursive: true })
copyFileSync('src/styles/styles.css', 'dist/styles.css')
console.log('copied src/styles/styles.css -> dist/styles.css')
