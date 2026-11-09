import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

// Library build. Storybook uses .storybook/vite.config.ts instead.
export default defineConfig({
  plugins: [react(), dts({ include: ['src'], entryRoot: 'src' })],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      // Keep dependencies external so the app installs one copy of each.
      external: [
        /^react(\/.*)?$/,
        'react-dom',
        'clsx',
        'class-variance-authority',
        'tailwind-merge',
      ],
    },
    sourcemap: true,
  },
})
