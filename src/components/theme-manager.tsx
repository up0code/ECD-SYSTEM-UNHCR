'use client';

import { useEffect } from 'react';
import { useUserManagement } from '@/contexts/user-management-context';

export function ThemeManager() {
  const { settings } = useUserManagement();

  useEffect(() => {
    // Remove existing theme classes
    const themeClasses = ['theme-purple', 'theme-blue', 'theme-green', 'theme-orange', 'theme-custom'];
    document.body.classList.remove(...themeClasses);

    // Apply the selected theme class
    const themeClass = `theme-${settings.themeColor || 'purple'}`;
    document.body.classList.add(themeClass);

    // Apply custom variables
    const root = document.documentElement;
    
    // Custom Hue for "Mix Colors"
    if (settings.themeColor === 'custom') {
      root.style.setProperty('--custom-hue', settings.customHue.toString());
    } else {
      root.style.removeProperty('--custom-hue');
    }

    // Border Radius for "Color Size"
    root.style.setProperty('--radius', `${settings.borderRadius}rem`);

  }, [settings.themeColor, settings.customHue, settings.borderRadius]);

  return null;
}
