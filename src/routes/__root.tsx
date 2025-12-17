import { Outlet, createRootRoute } from '@tanstack/react-router';

import { Layout } from '@/components/layout/Layout';
import { ThemeProvider, YjsProvider } from '@/providers';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <YjsProvider>
        <Layout>
          <Outlet />
        </Layout>
      </YjsProvider>
    </ThemeProvider>
  );
}
