import { useEffect } from 'react';

export function useRemoteNavigation() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null;
      const focusables = Array.from(document.querySelectorAll<HTMLElement>('[tabindex="0"], button, a, input, select'));
      const current = Math.max(0, focusables.indexOf(active ?? focusables[0]));

      if (event.key === 'Escape' || event.key === 'Backspace') {
        window.history.back();
      }

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        focusables[Math.min(current + 1, focusables.length - 1)]?.focus();
      }

      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        focusables[Math.max(current - 1, 0)]?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
