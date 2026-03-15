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
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 min-h-screen",
        collapsed ? "w-16" : "w-60",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
        {!collapsed && (
          <div>
            <div className="font-bold text-lg text-sidebar-primary">INSARK</div>
            <div className="text-xs text-sidebar-foreground/60">
              NSS Platform
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed((c) => !c)}
          className="text-sidebar-foreground hover:bg-sidebar-accent ml-auto"
          data-ocid="sidebar.toggle"
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </Button>
      </div>

      {/* User info */}
      <div
        className={cn(
          "border-b border-sidebar-border",
          collapsed ? "px-2 py-3 flex justify-center" : "px-4 py-3",
        )}
      >
        {collapsed ? (
          <Avatar className="h-8 w-8">
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
        ) : (
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
        )}
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
            {!collapsed && <span>{item.label}</span>}
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
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
