import { Search, Bell, Moon, Sun, LogOut, Settings, User } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { user, profile, signOut } = useSupabaseAuth();

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="flex items-center justify-between gap-4 px-6 py-3 border-b sticky top-0 z-10 bg-background">
      <div className="flex items-center gap-4 flex-1">
        <SidebarTrigger data-testid="button-sidebar-toggle" />
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search workspace..."
            className="pl-10 bg-secondary/50"
            data-testid="input-search"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          data-testid="button-theme-toggle"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>

        <div className="relative">
          <Button size="icon" variant="ghost" data-testid="button-notifications">
            <Bell className="w-5 h-5" />
          </Button>
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs" data-testid="badge-notification-count">
            3
          </Badge>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0" data-testid="button-user-menu">
              <Avatar className="h-9 w-9">
                <AvatarImage src={profile?.avatar || undefined} alt={profile?.name || "User"} />
                <AvatarFallback className="bg-gradient-to-br from-cafe-500 to-cafe-600 text-white font-semibold">
                  {getInitials(profile?.name)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{profile?.name || "User"}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user && (
              <Link href={`/profile/${user.id}`}>
                <DropdownMenuItem data-testid="menu-profile">
                  <User className="mr-2 h-4 w-4" />
                  My Workspace
                </DropdownMenuItem>
              </Link>
            )}
            <Link href="/settings">
              <DropdownMenuItem data-testid="menu-settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} data-testid="menu-logout">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
