import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "../../hooks/useAppStore";

export default function VolunteerAttendance() {
  const { state } = useAppStore();
  const user = state.currentUser!;
  const att = state.attendance.find((a) => a.volunteerId === user.id);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Attendance</h1>
        <p className="text-muted-foreground">Your attendance summary</p>
      </div>
      {!att ? (
        <p
          className="text-muted-foreground"
          data-ocid="vol.attendance.empty_state"
        >
          No attendance records yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
          <Card data-ocid="vol.attendance.summary.card">
            <CardHeader>
              <CardTitle>Total Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">
                {att.totalAttendance}
              </p>
              <p className="text-muted-foreground text-sm">days attended</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {att.days.map((d, i) => (
                  <span
                    // biome-ignore lint/suspicious/noArrayIndexKey: day slots are positional
                    key={`day-${i}`}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${d ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    Day {i + 1}: {d ? "✓" : "✗"}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Last updated: {new Date(att.lastSaved).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
