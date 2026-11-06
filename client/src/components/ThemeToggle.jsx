import { useState } from 'react';
import { setTheme } from '../lib/theme.js';

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  function toggle() {
    const next = !dark;
    setTheme(next ? 'dark' : 'light');
    setDark(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 text-left"
    >
      {dark ? 'Modo claro' : 'Modo oscuro'}
    </button>
  );
}
