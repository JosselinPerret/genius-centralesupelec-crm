import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    for (const shortcut of shortcuts) {
      const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : true;
      const metaMatch = shortcut.meta ? e.metaKey : true;
      const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
      const altMatch = shortcut.alt ? e.altKey : !e.altKey;
      
      if (
        e.key.toLowerCase() === shortcut.key.toLowerCase() &&
        ctrlMatch && metaMatch && shiftMatch && altMatch
      ) {
        e.preventDefault();
        shortcut.action();
        return;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Navigation shortcuts hook
export function useNavigationShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'g',
      action: () => navigate('/'),
      description: 'Aller au tableau de bord',
    },
    {
      key: 'c',
      action: () => navigate('/?tab=companies'),
      description: 'Aller aux entreprises',
    },
    {
      key: 'a',
      action: () => navigate('/?tab=assignments'),
      description: 'Aller aux assignations',
    },
    {
      key: 'u',
      action: () => navigate('/?tab=users'),
      description: 'Aller aux utilisateurs',
    },
    {
      key: 't',
      action: () => navigate('/?tab=tags'),
      description: 'Aller aux étiquettes',
    },
    {
      key: 'l',
      action: () => navigate('/leaderboard'),
      description: 'Aller au classement',
    },
    {
      key: 'm',
      action: () => navigate('/my-statistics'),
      description: 'Aller à mes statistiques',
    },
    {
      key: '?',
      shift: true,
      action: () => {
        // Could open a help modal here
        console.log('Keyboard shortcuts help');
      },
      description: 'Afficher l\'aide des raccourcis',
    },
  ];

  useKeyboardShortcuts(shortcuts);
}

// Help dialog content for keyboard shortcuts
export const keyboardShortcutsList = [
  { keys: ['Ctrl', 'K'], description: 'Recherche globale' },
  { keys: ['G'], description: 'Tableau de bord' },
  { keys: ['C'], description: 'Entreprises' },
  { keys: ['A'], description: 'Assignations' },
  { keys: ['U'], description: 'Utilisateurs' },
  { keys: ['T'], description: 'Étiquettes' },
  { keys: ['L'], description: 'Classement' },
  { keys: ['M'], description: 'Mes statistiques' },
  { keys: ['Échap'], description: 'Fermer les modales' },
  { keys: ['↑', '↓'], description: 'Naviguer dans les listes' },
  { keys: ['Entrée'], description: 'Sélectionner' },
];
