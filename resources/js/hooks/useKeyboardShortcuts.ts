import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  handler: () => void;
  description?: string;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  preventDefault?: boolean;
}

/**
 * Hook for managing keyboard shortcuts in sales workflow
 *
 * Common shortcuts for backoffice speed:
 * - F2: Focus customer search
 * - F3: Focus product search
 * - F4: Go to payment step
 * - F5: Quick save (if applicable)
 * - F9: Complete sale
 * - ESC: Cancel/Close dialog
 *
 * @param shortcuts - Array of keyboard shortcut configurations
 * @param options - Configuration options
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true, preventDefault = true } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) {
        return;
      }

      // Don't trigger shortcuts when user is typing in an input/textarea
      const target = event.target as HTMLElement;
      const isInputElement =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Allow F-keys even in inputs for quick actions
      const isFunctionKey = event.key.startsWith('F') && !isNaN(parseInt(event.key.slice(1)));

      if (isInputElement && !isFunctionKey) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatches = event.key === shortcut.key || event.key === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrl === undefined || shortcut.ctrl === (event.ctrlKey || event.metaKey);
        const altMatches = shortcut.alt === undefined || shortcut.alt === event.altKey;
        const shiftMatches = shortcut.shift === undefined || shortcut.shift === event.shiftKey;

        if (keyMatches && ctrlMatches && altMatches && shiftMatches) {
          if (preventDefault) {
            event.preventDefault();
          }
          shortcut.handler();
          break;
        }
      }
    },
    [shortcuts, enabled, preventDefault]
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
}

/**
 * Get display string for shortcut (e.g., "Ctrl+S", "F3", "Alt+Enter")
 */
export function getShortcutDisplay(shortcut: Omit<KeyboardShortcut, 'handler'>): string {
  const parts: string[] = [];

  if (shortcut.ctrl) {
    parts.push('Ctrl');
  }
  if (shortcut.alt) {
    parts.push('Alt');
  }
  if (shortcut.shift) {
    parts.push('Shift');
  }

  parts.push(shortcut.key);

  return parts.join('+');
}
