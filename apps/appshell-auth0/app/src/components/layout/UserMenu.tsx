import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../ui/dropdown-menu';

export function UserMenu(): React.ReactElement {
  const { user, logout } = useAuth0();

  const initial = user?.name?.charAt(0).toUpperCase() ?? '?';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary">
          <Avatar>
            <AvatarImage src={user?.picture} alt={user?.name} />
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link to="/account" className="w-full cursor-pointer">
            Mon compte
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            logout({ logoutParams: { returnTo: window.location.href } })
          }
          className="cursor-pointer"
        >
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

UserMenu.displayName = 'UserMenu';
