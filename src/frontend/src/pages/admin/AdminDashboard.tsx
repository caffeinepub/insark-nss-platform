import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CalendarDays, UserCheck, Users } from "lucide-react";
import StatCard from "../../components/StatCard";
import { getEventStatus, useAppStore } from "../../hooks/useAppStore";

export default function AdminDashboard() {
  const { state } = useAppStore();
  const upcomingEvents = state.events.filter(
    (e) => getEventStatus(e.date) === "Upcoming",
  ).length;

  const recentActivities = [
    ...state.coordinators.slice(-3).map((c) => ({
      text: `Coordinator added: ${c.firstName} ${c.lastName}`,
      type: "coordinator",
    })),
    ...state.volunteers.slice(-3).map((v) => ({
      text: `Volunteer registered: ${v.firstName} ${v.lastName}`,
      type: "volunteer",
    })),
    ...state.events
      .slice(-3)
      .map((e) => ({ text: `Event created: ${e.name}`, type: "event" })),
  ].slice(0, 8);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Volunteers"
          value={state.volunteers.length}
          icon={<Users className="h-6 w-6" />}
          data-ocid="admin.volunteers.card"
        />
        <StatCard
          title="Total Coordinators"
          value={state.coordinators.length}
          icon={<UserCheck className="h-6 w-6" />}
          data-ocid="admin.coordinators.card"
        />
        <StatCard
          title="Total Events"
          value={state.events.length}
          icon={<CalendarDays className="h-6 w-6" />}
          data-ocid="admin.events.card"
        />
        <StatCard
          title="Upcoming Events"
          value={upcomingEvents}
          icon={<Activity className="h-6 w-6" />}
          data-ocid="admin.upcoming.card"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivities.length === 0 ? (
            <p
              className="text-muted-foreground text-sm"
              data-ocid="admin.activities.empty_state"
            >
              No recent activities.
            </p>
          ) : (
            <ul className="space-y-3">
              {recentActivities.map((a, i) => (
                <li
                  // biome-ignore lint/suspicious/noArrayIndexKey: activity list is positional
                  key={`activity-${i}`}
                  className="flex items-center gap-3 text-sm"
                  data-ocid={`admin.activity.item.${i + 1}`}
                >
                  <Badge
                    variant={
                      a.type === "coordinator"
                        ? "default"
                        : a.type === "volunteer"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {a.type}
                  </Badge>
                  <span>{a.text}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
