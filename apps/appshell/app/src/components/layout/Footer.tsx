import React from 'react';
import { Link } from 'react-router-dom';
import { Code, Globe, ExternalLink } from 'lucide-react';

/**
 * FooterProps Interface
 *
 * @interface
 * @property {string} [copyright] - Copyright text (default: "© 2026 AppShell")
 * @property {Array<{label: string; href: string}>} [links] - Footer links array
 */
interface FooterProps {
  copyright?: string;
  links?: Array<{ label: string; href: string }>;
}

/**
 * Footer Component
 *
 * Protected: Application footer - do not modify without review
 *
 * Displays the application footer with copyright notice and documentation/project links.
 * Uses Tailwind for responsive design with appropriate padding for mobile, tablet, and desktop.
 *
 * @component
 * @param {FooterProps} props - Component props
 * @example
 * return <Footer copyright="© 2026 Company" links={[{ label: "Docs", href: "#" }]} />
 */
export function Footer({
  copyright = '© 2026 AppShell',
  links = [
    { label: 'Documentation', href: 'https://github.com' },
    { label: 'Project', href: 'https://github.com' },
    { label: 'Issues', href: 'https://github.com' },
  ],
}: FooterProps): React.ReactElement {
  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Footer content grid - responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
          {/* Copyright section */}
          <div>
            <p className="text-sm text-muted-foreground">
              {copyright}
            </p>
          </div>

          {/* Links section */}
          <div className="flex flex-wrap gap-6 sm:justify-end">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-8 mb-8">
          <p className="text-xs text-muted-foreground text-center">
            AppShell — Foundation for OneTicket Applications
          </p>
        </div>

        {/* External links section */}
        <div className="flex justify-center gap-4 pt-4">
          <a
            href="https://github.com"
            aria-label="GitHub Repository"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Code className="h-5 w-5" />
          </a>
          <a
            href="https://oneticket.dev"
            aria-label="Project Website"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Globe className="h-5 w-5" />
          </a>
          <a
            href="https://github.com/dsissoko/oneticket-core"
            aria-label="External Link"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}

Footer.displayName = 'Footer';
