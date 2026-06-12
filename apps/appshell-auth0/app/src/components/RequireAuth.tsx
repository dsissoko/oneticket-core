import { useAuth0 } from '@auth0/auth0-react';
import { useLocation } from 'react-router-dom';

interface RequireAuthProps {
  children: React.ReactNode;
}

/**
 * When Auth0 env vars are not set (e.g. GitHub Pages demo),
 * authentication is bypassed — children render directly.
 */
const isAuth0Configured = !!(
  import.meta.env.VITE_AUTH0_DOMAIN &&
  import.meta.env.VITE_AUTH0_CLIENT_ID
);

export function RequireAuth({ children }: RequireAuthProps) {
  // No Auth0 configured — bypass authentication entirely
  if (!isAuth0Configured) {
    return <>{children}</>;
  }

  const { isLoading, isAuthenticated, loginWithRedirect } = useAuth0();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    loginWithRedirect({ appState: { returnTo: location.pathname } });
    return null;
  }

  return <>{children}</>;
}
