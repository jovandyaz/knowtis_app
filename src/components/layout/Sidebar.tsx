import { useState } from 'react';

import { Link } from '@tanstack/react-router';

import { FileText, Home, Menu, User, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { ThemeToggle } from '@/components/ui/ThemeToggle';

import { NavigationLinks } from './NavigationLinks';

export function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  const links = [{ icon: Home, label: 'Home', to: '/' }];

  return (
    <>
      <div className="fixed left-4 top-4 z-50 md:hidden">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-background/80 shadow-sm backdrop-blur-md border border-border text-foreground transition-colors hover:bg-muted cursor-pointer"
          aria-label="Toggle menu"
        >
          {isMobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden md:flex w-56 flex-col fixed inset-y-0 left-0 z-40 border-r border-border/40 bg-background/40 backdrop-blur-xl"
      >
        <div className="flex h-16 items-center px-6 border-b border-border/40">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-foreground hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
              <FileText className="h-4 w-4" />
            </div>
            <span>Notis</span>
          </Link>
        </div>

        <NavigationLinks links={links} />

        <div className="p-4 border-t border-border/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden cursor-default">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <User className="h-4 w-4" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium text-foreground truncate">
                Demo User
              </span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </motion.aside>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden cursor-pointer"
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-3/4 max-w-xs flex flex-col bg-background/95 backdrop-blur-2xl border-r border-border md:hidden"
            >
              <div className="flex h-16 items-center px-6 border-b border-border/40">
                <Link
                  to="/"
                  className="flex items-center gap-2 font-bold text-foreground hover:opacity-80 transition-opacity cursor-pointer"
                  onClick={() => setIsMobileOpen(false)}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
                    <FileText className="h-4 w-4" />
                  </div>
                  <span>Notis</span>
                </Link>
              </div>

              <NavigationLinks
                links={links}
                onLinkClick={() => setIsMobileOpen(false)}
              />

              <div className="p-4 border-t border-border/40 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      Demo User
                    </span>
                  </div>
                </div>
                <ThemeToggle />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
