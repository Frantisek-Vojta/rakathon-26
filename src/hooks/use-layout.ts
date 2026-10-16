import { useWindowDimensions } from 'react-native';

import { Breakpoints } from '@/constants/theme';

/** Rozvržení podle šířky okna: telefon (1 kolona), tablet (2), počítač (boční menu, víc kolon). */
export function useLayout() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= Breakpoints.tablet;
  const isDesktop = width >= Breakpoints.desktop;
  return {
    width,
    height,
    isTablet,
    isDesktop,
    /** Kolik karet vedle sebe: 1 na telefonu, 2 na tabletu a počítači. */
    columns: isTablet ? 2 : 1,
  };
}
