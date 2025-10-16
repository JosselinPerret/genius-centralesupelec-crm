import { useState, useEffect } from 'react';

const SIDEBAR_KEY = 'sidebar-open';
const BREAKPOINT = 768; // md breakpoint in Tailwind

export function useSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < BREAKPOINT);

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_KEY);
    if (stored !== null) {
      setIsOpen(stored === 'true');
    }
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < BREAKPOINT;
      setIsMobile(mobile);
      // Close sidebar automatically on mobile
      if (mobile) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Persist to localStorage when isOpen changes
  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, String(isOpen));
  }, [isOpen]);

  const toggle = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  return { isOpen, isMobile, toggle, close, open };
}
