import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, CheckSquare, Clock, Star } from "lucide-react";
import StatCard from "../../components/StatCard";
import { useAppStore } from "../../hooks/useAppStore";

interface Props {
  onNavigate: (key: string) => void;
}

export default function VolunteerDashboard({ onNavigate }: Props) {
  const { state } = useAppStore();
  const user = state.currentUser!;

  const att = state.attendance.find((a) => a.volunteerId === user.id);
  const ap = state.activityPoints.find((a) => a.volunteerId === user.id);
  const myNotifs = state.notifications.filter(
    (n) => n.userId === user.id && !n.isRead,
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome, {user.name}!</h1>
        <p className="text-muted-foreground">Your NSS activity overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Attendance"
          value={att ? att.totalAttendance : 0}
          icon={<CheckSquare className="h-6 w-6" />}
          data-ocid="vol.attendance.card"
        />
        <StatCard
          title="Activity Points"
          value={ap ? ap.storedPoints : 0}
          icon={<Star className="h-6 w-6" />}
          data-ocid="vol.points.card"
        />
        <StatCard
          title="Service Hours"
          value={att ? att.totalAttendance * 4 : 0}
          icon={<Clock className="h-6 w-6" />}
          data-ocid="vol.hours.card"
        />
        <StatCard
          title="New Notifications"
          value={myNotifs.length}
          icon={<Bell className="h-6 w-6" />}
          data-ocid="vol.notifs.card"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {myNotifs.length === 0 ? (
            <p
              className="text-muted-foreground text-sm"
              data-ocid="vol.notifs.empty_state"
            >
              No new notifications.
            </p>
          ) : (
            <ul className="space-y-2">
              {myNotifs.slice(0, 5).map((n, i) => (
                <li
                  key={n.id}
                  className="flex items-center gap-3 text-sm"
                  data-ocid={`vol.notif.item.${i + 1}`}
                >
                  <Badge>New</Badge>
                  <span>{n.message}</span>
                </li>
              ))}
            </ul>
          )}
          {myNotifs.length > 0 && (
            <button
              type="button"
              onClick={() => onNavigate("notifications")}
              className="text-sm text-primary mt-3 hover:underline"
            >
              View all notifications
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
