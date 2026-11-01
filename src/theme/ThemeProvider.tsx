import * as React from 'react'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export interface ThemeContextValue {
  /** What the user chose: light, dark, or follow the system. */
  theme: Theme
  /** What is actually applied right now. */
  resolvedTheme: ResolvedTheme
  isDark: boolean
  setTheme: (theme: Theme) => void
}

export interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  /** Keep in sync with getThemeInitScript(storageKey). */
  storageKey?: string
}

const DARK_QUERY = '(prefers-color-scheme: dark)'
const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system'
}

function readStored(storageKey: string): Theme | null {
  try {
    const value = localStorage.getItem(storageKey)
    return isTheme(value) ? value : null
  } catch {
    return null
  }
}

function resolve(theme: Theme): ResolvedTheme {
  if (theme !== 'system') return theme
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'app-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(
    () => readStored(storageKey) ?? defaultTheme
  )
  const [resolvedTheme, setResolvedTheme] = React.useState<ResolvedTheme>(() => resolve(theme))

  React.useEffect(() => {
    const apply = () => {
      const next = resolve(theme)
      setResolvedTheme(next)
      const root = document.documentElement
      root.classList.toggle('dark', next === 'dark')
      root.style.colorScheme = next
    }

    apply()
    if (theme !== 'system') return

    const media = window.matchMedia(DARK_QUERY)
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])

  const setTheme = React.useCallback(
    (next: Theme) => {
      try {
        localStorage.setItem(storageKey, next)
      } catch {
        // Storage can be blocked (private mode). The theme still applies for this session.
      }
      setThemeState(next)
    },
    [storageKey]
  )

  const value = React.useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, isDark: resolvedTheme === 'dark', setTheme }),
    [theme, resolvedTheme, setTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
