import React from 'react';
import { Link } from 'react-router-dom';

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
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 dark:bg-slate-950 dark:border-gray-800">
      <nav className="mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center font-bold text-xl text-foreground hover:text-blue-600 transition-colors dark:hover:text-blue-400"
        >
          {logo}
        </Link>

        {/* Navigation Links - responsive */}
        <div className="hidden sm:flex gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors dark:text-gray-300 dark:hover:text-blue-400"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile menu button placeholder */}
        <button
          className="sm:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </nav>
    </header>
  );
}

Header.displayName = 'Header';
