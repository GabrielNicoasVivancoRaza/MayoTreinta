const STORAGE_KEY = 'theme';

function getStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function initTheme() {
  const stored = getStoredTheme();
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const theme = stored || (prefersDark ? 'dark' : 'light');
  applyTheme(theme);
  return theme;
}

export function setTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // almacenamiento no disponible (modo privado, etc.); el tema solo dura la sesion
  }
  applyTheme(theme);
}
