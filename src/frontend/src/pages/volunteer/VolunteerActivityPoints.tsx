import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "../../hooks/useAppStore";

export default function VolunteerActivityPoints() {
  const { state } = useAppStore();
  const user = state.currentUser!;
  const ap = state.activityPoints.find((a) => a.volunteerId === user.id);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Activity Points</h1>
        <p className="text-muted-foreground">Your earned activity points</p>
      </div>
      {!ap ? (
        <p className="text-muted-foreground" data-ocid="vol.points.empty_state">
          No activity points assigned yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl">
          <Card data-ocid="vol.stored.points.card">
            <CardHeader>
              <CardTitle>Stored Points</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">
                {ap.storedPoints}
              </p>
            </CardContent>
          </Card>
          <Card data-ocid="vol.pending.points.card">
            <CardHeader>
              <CardTitle>Recent Points</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{ap.pendingPoints}</p>
              <p className="text-xs text-muted-foreground mt-1">
                From last session
              </p>
            </CardContent>
          </Card>
          <Card data-ocid="vol.total.points.card">
            <CardHeader>
              <CardTitle>Total Points</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">
                {ap.storedPoints + ap.pendingPoints}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
