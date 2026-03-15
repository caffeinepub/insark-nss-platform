import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  key: string;
}

interface SidebarProps {
  items: SidebarItem[];
  active: string;
  onSelect: (key: string) => void;
  onSignOut: () => void;
  userName: string;
  userRole: string;
  userAvatar?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Sidebar({
  items,
  active,
  onSelect,
  onSignOut,
  userName,
  userRole,
  userAvatar,
}: SidebarProps) {
  const [hidden, setHidden] = useState(false);

  if (hidden) {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setHidden(false)}
          className="fixed top-4 left-2 z-50 bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent shadow-md rounded-lg"
          data-ocid="sidebar.show.button"
          aria-label="Show sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <aside className="flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 min-h-screen w-60">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
        <div>
          <div className="font-bold text-lg text-sidebar-primary">INSARK</div>
          <div className="text-xs text-sidebar-foreground/60">NSS Platform</div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setHidden(true)}
          className="text-sidebar-foreground hover:bg-sidebar-accent ml-auto"
          data-ocid="sidebar.toggle"
          aria-label="Hide sidebar"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 flex-shrink-0">
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{userName}</div>
            <div className="text-xs text-sidebar-foreground/60 capitalize">
              {userRole}
            </div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {items.map((item) => (
          <button
            type="button"
            key={item.key}
            onClick={() => onSelect(item.key)}
            data-ocid={`sidebar.${item.key}.link`}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors",
              active === item.key
                ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          type="button"
          aria-label="Sign out"
          onClick={onSignOut}
          data-ocid="sidebar.signout.button"
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
        >
          <span className="flex-shrink-0">
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
