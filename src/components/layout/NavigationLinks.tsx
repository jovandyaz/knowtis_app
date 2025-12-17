import { Link, useLocation } from '@tanstack/react-router';

import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib';

/**
 * Navigation link interface
 * @property {LucideIcon} icon - The icon to display for the link
 * @property {string} label - The text to display for the link
 * @property {string} to - The path to navigate to when the link is clicked
 */
interface NavigationLink {
  icon: LucideIcon;
  label: string;
  to: string;
}

/**
 * Navigation links props interface
 * @property {NavigationLink[]} links - The links to display in the navigation
 * @property {function} onLinkClick - The function to call when a link is clicked
 */
interface NavigationLinksProps {
  links: NavigationLink[];
  onLinkClick?: () => void;
}

export function NavigationLinks({ links, onLinkClick }: NavigationLinksProps) {
  const location = useLocation();

  return (
    <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          onClick={onLinkClick}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all cursor-pointer',
            location.pathname === link.to
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'
          )}
        >
          <link.icon className="h-4 w-4" />
          {link.label}
        </Link>
      ))}
    </div>
  );
}
