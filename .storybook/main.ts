import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  core: { disableTelemetry: true },
  stories: ['../stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y', '@storybook/addon-themes'],
  framework: {
    name: '@storybook/react-vite',
    options: {
      // Use a Storybook-only Vite config so the library build config (dts, lib mode) stays out.
      builder: { viteConfigPath: '.storybook/vite.config.ts' },
    },
  },
}

export default config
