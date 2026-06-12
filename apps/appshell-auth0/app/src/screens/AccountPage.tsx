import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

/**
 * AccountPage Component
 *
 * User account page served at `/account`.
 * Displays authenticated user profile information from Auth0.
 * When Auth0 is not configured, shows an explicit setup message.
 */

const isAuth0Configured = !!(
  import.meta.env.VITE_AUTH0_DOMAIN &&
  import.meta.env.VITE_AUTH0_CLIENT_ID
);

export function AccountPage(): React.ReactElement {
  if (!isAuth0Configured) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Mon compte</h1>
        <p className="text-muted-foreground">
          Authentication non configurée. Copiez <code className="bg-muted px-1 rounded">.env.example</code> en{' '}
          <code className="bg-muted px-1 rounded">.env.local</code> et renseignez :
        </p>
        <pre className="mt-3 p-3 bg-muted rounded text-sm">
          {`VITE_AUTH0_DOMAIN=<votre-tenant>.auth0.com\nVITE_AUTH0_CLIENT_ID=<votre-client-id>`}
        </pre>
        <p className="mt-3 text-sm text-muted-foreground">
          Consultez le runbook :{' '}
          <code className="bg-muted px-1 rounded">apps/appshell-auth0/docs/run/auth0-setup.md</code>
        </p>
      </div>
    );
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { user } = useAuth0();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mon compte</h1>
      <div className="flex gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user?.picture} alt={user?.name} />
          <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{user?.name}</p>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>
      </div>
    </div>
  );
}
