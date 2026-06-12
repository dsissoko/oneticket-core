import React from 'react';
import { GitFork, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface FooterProps {
  copyright?: string;
  links?: Array<{ label: string; href: string }>;
}

export function Footer({
  copyright = '© 2026 AppShell Auth0',
  links = [
    { label: 'Documentation', href: 'https://dsissoko.github.io/oneticket-core/appshell-auth0/docs/' },
    { label: 'Project', href: 'https://github.com/dsissoko/oneticket-core' },
    { label: 'Issues', href: 'https://github.com/dsissoko/oneticket-core/issues' },
  ],
}: FooterProps): React.ReactElement {
  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* N1 — copyright + links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">{copyright}</p>
          <div className="flex gap-6">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Separator */}
        <Separator className="my-4" />

        {/* N2 — social icons */}
        <div className="flex justify-center items-center gap-6">
          <a
            href="https://github.com"
            aria-label="GitHub"
            title="GitHub"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <GitFork className="h-5 w-5" />
          </a>
          <a
            href="https://github.com/dsissoko"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Profil GitHub"
            title="Profil GitHub @dsissoko"
          >
            <Avatar className="h-5 w-5">
              <AvatarImage src="https://avatars.githubusercontent.com/dsissoko" alt="dsissoko" />
              <AvatarFallback>DS</AvatarFallback>
            </Avatar>
          </a>
          <a
            href="https://github.com/dsissoko/oneticket-core/stargazers"
            aria-label="Stargazers"
            title="Star ce projet"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Star className="h-5 w-5" />
          </a>
        </div>

      </div>
    </footer>
  );
}

Footer.displayName = 'Footer';
