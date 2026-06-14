import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../ui/dropdown-menu';

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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <nav className="mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center font-bold text-xl text-foreground hover:text-primary transition-colors"
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
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className="p-2 text-muted-foreground hover:text-foreground"
                aria-label="Toggle menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {navLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link
                    to={link.href}
                    className="w-full cursor-pointer"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
}

Header.displayName = 'Header';
