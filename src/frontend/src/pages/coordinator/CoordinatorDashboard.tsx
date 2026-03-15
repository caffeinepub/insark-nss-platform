import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarDays, Clock, Users } from "lucide-react";
import StatCard from "../../components/StatCard";
import { getEventStatus, useAppStore } from "../../hooks/useAppStore";

export default function CoordinatorDashboard() {
  const { state } = useAppStore();
  const upcoming = state.events.filter(
    (e) => getEventStatus(e.date) === "Upcoming",
  );

  const topVolunteers = state.volunteers
    .map((v) => {
      const ap = state.activityPoints.find((a) => a.volunteerId === v.id);
      const att = state.attendance.find((a) => a.volunteerId === v.id);
      return {
        name: `${v.firstName} ${v.lastName}`,
        hours: att ? att.totalAttendance : 0,
        points: ap ? ap.storedPoints : 0,
      };
    })
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 5);

  const recentEvents = [...state.events]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Coordinator Dashboard</h1>
        <p className="text-muted-foreground">Overview of NSS activities</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Volunteers"
          value={state.volunteers.length}
          icon={<Users className="h-6 w-6" />}
          data-ocid="coord.volunteers.card"
        />
        <StatCard
          title="Total Events"
          value={state.events.length}
          icon={<CalendarDays className="h-6 w-6" />}
          data-ocid="coord.events.card"
        />
        <StatCard
          title="Upcoming Events"
          value={upcoming.length}
          icon={<Clock className="h-6 w-6" />}
          data-ocid="coord.upcoming.card"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            {recentEvents.length === 0 ? (
              <p
                className="text-muted-foreground text-sm"
                data-ocid="coord.events.empty_state"
              >
                No events yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {recentEvents.map((e, i) => {
                  const status = getEventStatus(e.date);
                  return (
                    <li
                      key={e.id}
                      className="flex items-center justify-between"
                      data-ocid={`coord.event.item.${i + 1}`}
                    >
                      <span className="text-sm font-medium">{e.name}</span>
                      <Badge
                        variant={
                          status === "Upcoming"
                            ? "default"
                            : status === "Ongoing"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {status}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Volunteers by Hours</CardTitle>
          </CardHeader>
          <CardContent>
            {topVolunteers.length === 0 ? (
              <p
                className="text-muted-foreground text-sm"
                data-ocid="coord.topvol.empty_state"
              >
                No data yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topVolunteers.map((v, i) => (
                    <TableRow
                      // biome-ignore lint/suspicious/noArrayIndexKey: volunteer list is positional
                      key={`vol-${i}`}
                      data-ocid={`coord.topvol.row.${i + 1}`}
                    >
                      <TableCell>{v.name}</TableCell>
                      <TableCell>{v.hours}</TableCell>
                      <TableCell>{v.points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
