import type { ReactNode } from 'react';

import { Sidebar } from './Sidebar';

/**
 * Layout props interface
 * @property {ReactNode} children - The content to display in the layout
 */
interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-(--background)">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 transition-all duration-300 md:pl-56">
        <div className="h-16 md:hidden" />

        <div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
