import type { ComponentProps, ReactNode } from 'react';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * Theme provider props interface
 * @property {ReactNode} children - The content to display in the theme provider
 * @property {ComponentProps<typeof NextThemesProvider>} props - The props to pass to the next themes provider
 */
interface ThemeProviderProps extends ComponentProps<typeof NextThemesProvider> {
  children: ReactNode;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
