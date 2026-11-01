/**
 * Returns a tiny script body that sets the `dark` class before first paint, so there is
 * no light/dark flash on load. Put it in an inline <script> in the app's index.html (or
 * inject it with a Vite `transformIndexHtml` hook). Use the same storage key as ThemeProvider.
 */
export function getThemeInitScript(storageKey = 'app-theme'): string {
  const key = JSON.stringify(storageKey)
  return `(function () {
  try {
    var stored = localStorage.getItem(${key}) || 'system';
    var dark = stored === 'dark' || (stored === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var root = document.documentElement;
    root.classList.toggle('dark', dark);
    root.style.colorScheme = dark ? 'dark' : 'light';
  } catch (e) {}
})();`
}
