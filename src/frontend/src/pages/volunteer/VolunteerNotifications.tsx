import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck } from "lucide-react";
import { useAppStore } from "../../hooks/useAppStore";

export default function VolunteerNotifications() {
  const store = useAppStore();
  const user = store.state.currentUser!;
  const notifications = store.state.notifications
    .filter((n) => n.userId === user.id)
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Your activity alerts</p>
        </div>
        <Button
          variant="outline"
          onClick={() => store.markAllRead(user.id)}
          data-ocid="vol.notifs.markall.button"
        >
          <CheckCheck className="h-4 w-4 mr-2" />
          Mark All Read
        </Button>
      </div>

      {notifications.length === 0 ? (
        <p
          className="text-muted-foreground"
          data-ocid="vol.notifications.empty_state"
        >
          No notifications.
        </p>
      ) : (
        <div className="space-y-3">
          {notifications.map((n, i) => (
            <button
              type="button"
              key={n.id}
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer w-full text-left ${n.isRead ? "bg-card" : "bg-accent border-primary/30"}`}
              onClick={() => store.markNotificationRead(n.id)}
              data-ocid={`vol.notification.item.${i + 1}`}
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
              {!n.isRead && <Badge>New</Badge>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
