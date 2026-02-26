'use client';

import { useEffect } from 'react';
import { useUserManagement } from '@/contexts/user-management-context';

export function ThemeManager() {
  const { settings } = useUserManagement();

  useEffect(() => {
    // Remove existing theme classes
    const themeClasses = ['theme-purple', 'theme-blue', 'theme-green', 'theme-orange'];
    document.body.classList.remove(...themeClasses);

    // Apply the selected theme class
    const themeClass = `theme-${settings.themeColor || 'purple'}`;
    document.body.classList.add(themeClass);
  }, [settings.themeColor]);

  return null;
}
