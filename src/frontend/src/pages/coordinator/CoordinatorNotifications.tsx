import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck } from "lucide-react";
import { useAppStore } from "../../hooks/useAppStore";

export default function CoordinatorNotifications() {
  const store = useAppStore();
  const user = store.state.currentUser!;
  const notifications = store.state.notifications
    .filter((n) => n.userId === user.id || n.userRole === "coordinator")
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">System alerts and updates</p>
        </div>
        <Button
          variant="outline"
          onClick={() => store.markAllRead(user.id)}
          data-ocid="notifications.markall.button"
        >
          <CheckCheck className="h-4 w-4 mr-2" />
          Mark All Read
        </Button>
      </div>

      {notifications.length === 0 ? (
        <p
          className="text-muted-foreground"
          data-ocid="notifications.empty_state"
        >
          No notifications.
        </p>
      ) : (
        <div className="space-y-3">
          {notifications.map((n, i) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 p-4 rounded-xl border ${n.isRead ? "bg-card" : "bg-accent border-primary/30"}`}
              data-ocid={`notification.item.${i + 1}`}
            >
              <Bell
                className={`h-5 w-5 mt-0.5 flex-shrink-0 ${n.isRead ? "text-muted-foreground" : "text-primary"}`}
              />
              <div className="flex-1">
                <p className="text-sm">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              {!n.isRead && <Badge className="flex-shrink-0">New</Badge>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
