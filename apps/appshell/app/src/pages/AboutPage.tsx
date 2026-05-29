import React from 'react';
import { Link } from 'react-router-dom';

/**
 * AboutPage Component
 *
 * About page served at `/about`.
 * Contains team information and project vision.
 */
export function AboutPage(): React.ReactElement {
  return (
    <div className="flex-grow bg-background text-foreground py-12 px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">About Us</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
          <p className="text-base text-muted mb-4">
            AppShell is a canonical reference implementation for building modern,
            scalable React applications. It demonstrates best practices for routing,
            error handling, state management, and testing.
          </p>
          <p className="text-base text-muted">
            We believe in building foundations that are robust, maintainable, and
            developer-friendly.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Our Team</h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 border border-border rounded">
              <h3 className="font-bold text-lg">Architecture Team</h3>
              <p className="text-muted text-sm">
                Designing scalable systems and patterns
              </p>
            </div>
            <div className="p-4 border border-border rounded">
              <h3 className="font-bold text-lg">Development Team</h3>
              <p className="text-muted text-sm">
                Building high-quality frontend experiences
              </p>
            </div>
            <div className="p-4 border border-border rounded">
              <h3 className="font-bold text-lg">Quality Assurance</h3>
              <p className="text-muted text-sm">
                Ensuring reliability and user satisfaction
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8">
          <Link
            to="/"
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90"
          >
            ← Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
