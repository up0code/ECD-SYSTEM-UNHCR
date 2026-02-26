'use client';

import { useEffect } from 'react';
import { useUserManagement } from '@/contexts/user-management-context';

/**
 * ThemeManager handles the dynamic application of CSS variables and classes
 * based on the user's settings. It manages both the color palette (purple, blue, etc.)
 * and the component rounding (border radius).
 */
export function ThemeManager() {
  const { settings } = useUserManagement();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Remove existing theme classes from the body to avoid conflicts
    const themeClasses = ['theme-purple', 'theme-blue', 'theme-green', 'theme-orange', 'theme-custom'];
    document.body.classList.remove(...themeClasses);

    // Apply the selected theme class to the body
    const selectedTheme = settings?.themeColor || 'purple';
    const themeClass = `theme-${selectedTheme}`;
    document.body.classList.add(themeClass);

    // Access the root element to set global CSS variables
    const root = document.documentElement;
    
    // Handle Custom Hue for the "Mix Your Own Color" feature
    // Use optional chaining and default value to prevent 'toString' of undefined error
    const customHue = settings?.customHue ?? 263;
    if (selectedTheme === 'custom') {
      root.style.setProperty('--custom-hue', customHue.toString());
    } else {
      root.style.removeProperty('--custom-hue');
    }

    // Handle Border Radius for the "Color Size" (rounding) feature
    // Defaults to 0.75rem if not specified
    const borderRadius = settings?.borderRadius ?? 0.75;
    root.style.setProperty('--radius', `${borderRadius}rem`);

  }, [settings?.themeColor, settings?.customHue, settings?.borderRadius]);

  return null;
}
