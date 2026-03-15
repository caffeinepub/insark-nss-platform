import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAppStore } from "../../hooks/useAppStore";
import type { AttendanceRecord } from "../../hooks/useAppStore";

const HOUR_MS = 24 * 60 * 60 * 1000;

export default function CoordinatorAttendance() {
  const store = useAppStore();
  const volunteers = store.state.volunteers;

  const [days, setDays] = useState<Record<string, boolean[]>>({});
  const [points, setPoints] = useState<Record<string, number>>({});
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;
    const initDays: Record<string, boolean[]> = {};
    const initPoints: Record<string, number> = {};
    for (const v of volunteers) {
      const rec = store.state.attendance.find((a) => a.volunteerId === v.id);
      const isExpired = rec && Date.now() - rec.lastSaved > HOUR_MS;
      initDays[v.id] = isExpired
        ? Array(6).fill(false)
        : rec
          ? rec.days
          : Array(6).fill(false);
      // Always start input fresh at 0 — new value gets added to stored points on save
      initPoints[v.id] = 0;
    }
    setDays(initDays);
    setPoints(initPoints);
    setInitialized(true);
    // biome-ignore lint/correctness/useExhaustiveDependencies: activityPoints intentionally excluded; input always starts at 0
  }, [initialized, volunteers, store.state.attendance]);

  function toggleDay(volId: string, dayIdx: number) {
    setDays((d) => ({
      ...d,
      [volId]: (d[volId] || Array(6).fill(false)).map(
        (v: boolean, i: number) => (i === dayIdx ? !v : v),
      ),
    }));
  }

  function handleSave() {
    const attRecords: AttendanceRecord[] = volunteers.map((v) => ({
      volunteerId: v.id,
      days: days[v.id] || Array(6).fill(false),
      totalAttendance: 0,
      lastSaved: Date.now(),
    }));
    const apRecords = volunteers.map((v) => ({
      volunteerId: v.id,
      points: points[v.id] || 0,
    }));
    store.saveAttendance(attRecords);
    store.saveActivityPoints(apRecords);
    toast.success("Attendance and points saved!");
    // Reset input fields to 0 after save
    const resetPoints: Record<string, number> = {};
    for (const v of volunteers) {
      resetPoints[v.id] = 0;
    }
    setPoints(resetPoints);
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">
            Mark attendance and assign activity points
          </p>
        </div>
        <Button onClick={handleSave} data-ocid="coord.attendance.save.button">
          <Save className="h-4 w-4 mr-2" />
          Save Attendance Records
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table data-ocid="coord.attendance.table">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Roll No.</TableHead>
              {[1, 2, 3, 4, 5, 6].map((d) => (
                <TableHead key={d}>Day {d}</TableHead>
              ))}
              <TableHead>Total Att.</TableHead>
              <TableHead>Add Points</TableHead>
              <TableHead>Total Pts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {volunteers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={13}
                  className="text-center text-muted-foreground"
                  data-ocid="coord.attendance.empty_state"
                >
                  No volunteers registered.
                </TableCell>
              </TableRow>
            ) : (
              volunteers.map((v, i) => {
                const attRec = store.state.attendance.find(
                  (a) => a.volunteerId === v.id,
                );
                const apRec = store.state.activityPoints.find(
                  (a) => a.volunteerId === v.id,
                );
                const totalAtt = attRec ? attRec.totalAttendance : 0;
                const storedPts = apRec ? apRec.storedPoints : 0;
                const pendingPts = points[v.id] || 0;
                const totalPts = storedPts + pendingPts;
                const vDays = days[v.id] || Array(6).fill(false);
                return (
                  <TableRow
                    key={v.id}
                    data-ocid={`coord.attendance.row.${i + 1}`}
                  >
                    <TableCell className="font-medium">
                      {v.firstName} {v.lastName}
                    </TableCell>
                    <TableCell>{v.branch}</TableCell>
                    <TableCell>{v.matricule}</TableCell>
                    {vDays.map((checked: boolean, di: number) => (
                      <TableCell
                        // biome-ignore lint/suspicious/noArrayIndexKey: day slots are positional
                        key={`day-${di}`}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleDay(v.id, di)}
                          data-ocid={`attendance.day${di + 1}.checkbox.${i + 1}`}
                        />
                      </TableCell>
                    ))}
                    <TableCell>{totalAtt}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="w-20"
                        min={0}
                        value={pendingPts}
                        onChange={(e) =>
                          setPoints((p) => ({
                            ...p,
                            [v.id]: Number.parseInt(e.target.value) || 0,
                          }))
                        }
                        data-ocid={`attendance.points.input.${i + 1}`}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Stored: {storedPts} pts
                      </p>
                    </TableCell>
                    <TableCell className="font-semibold">{totalPts}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
