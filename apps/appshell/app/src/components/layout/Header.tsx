import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';

/**
 * HeaderProps Interface
 *
 * @interface
 * @property {string} [logo] - Logo text or image alt text (default: "AppShell")
 * @property {Array<{label: string; href: string}>} [navLinks] - Navigation links array
 */
interface HeaderProps {
  logo?: string;
  navLinks?: Array<{ label: string; href: string }>;
}

/**
 * Header Component
 *
 * Protected: Navigation header - do not modify without review
 *
 * Displays the application header with logo (clickable, links to home)
 * and responsive navigation links. Uses Tailwind for responsive design.
 *
 * @component
 * @param {HeaderProps} props - Component props
 * @example
 * return <Header logo="AppShell" navLinks={[{ label: "Home", href: "/" }]} />
 */
export function Header({
  logo = 'AppShell',
  navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Help', href: '/help' },
  ],
}: HeaderProps): React.ReactElement {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <nav className="mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center font-bold text-xl text-foreground hover:text-primary transition-colors"
          onClick={closeMenu}
        >
          {logo}
        </Link>

        {/* Navigation Links - responsive */}
        <div className="hidden sm:flex gap-6 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="border-l border-border h-6" />
          <ThemeToggle />
        </div>

        {/* Mobile menu button and theme toggle */}
        <div className="sm:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            className="p-2 text-muted-foreground hover:text-foreground"
            aria-label="Toggle menu"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-background border-t border-border">
          <div className="px-4 py-2 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

Header.displayName = 'Header';
