import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { logger } from '@/lib/logger';

/**
 * AppLayout Component
 *
 * Protected: Root layout component - do not modify structure without review
 *
 * Provides the main application layout with header, main content area, and footer.
 * Uses CSS Grid to ensure sticky header at top, flexible content area, and sticky footer at bottom.
 * Responsive across mobile, tablet, and desktop viewports.
 *
 * @component
 * @example
 * return <AppLayout />
 */
export function AppLayout(): React.ReactElement {
  const location = useLocation();

  useEffect(() => {
    logger.info('[nav]', location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto] bg-background text-foreground">
      {/* Header - sticky top */}
      <Header />

      {/* Main content - flexible middle section */}
      <main className="flex flex-col overflow-auto">
        <Outlet />
      </main>

      {/* Footer - sticky bottom */}
      <Footer />
    </div>
  );
}

AppLayout.displayName = 'AppLayout';
