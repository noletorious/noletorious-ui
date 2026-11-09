import type { Preview } from '@storybook/react'
import { withThemeByClassName } from '@storybook/addon-themes'
import './preview.css'

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: { matchers: { color: /(background|color)$/i } },
  },
  decorators: [
    // Toolbar switch: review every story in light and dark.
    withThemeByClassName({
      themes: { light: '', dark: 'dark' },
      defaultTheme: 'light',
    }),
  ],
}

export default preview
