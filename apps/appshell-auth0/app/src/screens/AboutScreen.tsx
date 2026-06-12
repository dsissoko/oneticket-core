import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/**
 * AboutScreen Component
 *
 * About page served at `/about`.
 * Contains team information and project vision.
 */
export function AboutScreen(): React.ReactElement {
  return (
    <div className="flex-grow bg-background text-foreground py-12 px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">About Us</h1>
        <p className="text-muted-foreground mb-8">AppShell Auth0 — Foundation for OneTicket Applications</p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
          <p className="text-base text-muted-foreground mb-4">
            AppShell Auth0 is a canonical reference implementation for building modern,
            scalable React applications. It demonstrates best practices for routing,
            error handling, state management, and testing.
          </p>
          <p className="text-base text-muted-foreground">
            We believe in building foundations that are robust, maintainable, and
            developer-friendly.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Our Team</h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 border border-border rounded">
              <h3 className="font-bold text-lg">Architecture Team</h3>
              <p className="text-muted-foreground text-sm">
                Designing scalable systems and patterns
              </p>
            </div>
            <div className="p-4 border border-border rounded">
              <h3 className="font-bold text-lg">Development Team</h3>
              <p className="text-muted-foreground text-sm">
                Building high-quality frontend experiences
              </p>
            </div>
            <div className="p-4 border border-border rounded">
              <h3 className="font-bold text-lg">Quality Assurance</h3>
              <p className="text-muted-foreground text-sm">
                Ensuring reliability and user satisfaction
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8">
          <Button variant="outline"><Link to="/">← Back Home</Link></Button>
        </div>
      </div>
    </div>
  );
}

export default AboutScreen;
