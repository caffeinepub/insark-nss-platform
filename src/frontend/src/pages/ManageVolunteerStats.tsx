import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAppStore } from "../hooks/useAppStore";

export default function ManageVolunteerStats() {
  const store = useAppStore();
  const { state, adjustAttendance, adjustActivityPoints } = store;
  const volunteers = state.volunteers;

  const getAttendance = (id: string) =>
    state.attendance.find((a) => a.volunteerId === id)?.totalAttendance ?? 0;
  const getPoints = (id: string) =>
    state.activityPoints.find((a) => a.volunteerId === id)?.storedPoints ?? 0;

  const [attInputs, setAttInputs] = useState<Record<string, string>>({});
  const [ptsInputs, setPtsInputs] = useState<Record<string, string>>({});

  function handleAdjustAtt(volunteerId: string, delta: number, name: string) {
    adjustAttendance(volunteerId, delta);
    toast.success(`Updated ${name}'s attendance.`);
  }

  function handleAdjustPts(volunteerId: string, delta: number, name: string) {
    adjustActivityPoints(volunteerId, delta);
    toast.success(`Updated ${name}'s activity points.`);
  }

  function handleSetAtt(volunteerId: string, name: string) {
    const val = Number.parseInt(attInputs[volunteerId] ?? "", 10);
    if (Number.isNaN(val) || val < 0) {
      toast.error("Enter a valid non-negative number.");
      return;
    }
    const current = getAttendance(volunteerId);
    handleAdjustAtt(volunteerId, val - current, name);
    setAttInputs((p) => ({ ...p, [volunteerId]: "" }));
  }

  function handleSetPts(volunteerId: string, name: string) {
    const val = Number.parseInt(ptsInputs[volunteerId] ?? "", 10);
    if (Number.isNaN(val) || val < 0) {
      toast.error("Enter a valid non-negative number.");
      return;
    }
    const current = getPoints(volunteerId);
    handleAdjustPts(volunteerId, val - current, name);
    setPtsInputs((p) => ({ ...p, [volunteerId]: "" }));
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Manage Volunteer Stats
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Adjust total attendance and activity points for each volunteer.
        </p>
      </div>

      {volunteers.length === 0 ? (
        <div
          data-ocid="manage_stats.empty_state"
          className="flex flex-col items-center justify-center py-20 text-muted-foreground"
        >
          <p className="text-lg font-medium">No volunteers registered yet.</p>
          <p className="text-sm mt-1">Add volunteers to manage their stats.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden shadow-sm">
          <Table data-ocid="manage_stats.table">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Branch</TableHead>
                <TableHead className="font-semibold">Roll No.</TableHead>
                <TableHead className="font-semibold text-center">
                  Total Attendance
                </TableHead>
                <TableHead className="font-semibold text-center">
                  Total Activity Points
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {volunteers.map((vol, i) => {
                const n = i + 1;
                const fullName = `${vol.firstName} ${vol.lastName}`;
                const att = getAttendance(vol.id);
                const pts = getPoints(vol.id);
                return (
                  <TableRow
                    key={vol.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-medium">{fullName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {vol.branch}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {vol.matricule}
                    </TableCell>

                    {/* Attendance controls */}
                    <TableCell>
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          data-ocid={`manage_stats.att_minus_button.${n}`}
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleAdjustAtt(vol.id, -1, fullName)}
                          disabled={att <= 0}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="w-8 text-center font-semibold tabular-nums">
                          {att}
                        </span>
                        <Button
                          data-ocid={`manage_stats.att_plus_button.${n}`}
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleAdjustAtt(vol.id, 1, fullName)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                        <Input
                          data-ocid={`manage_stats.att_input.${n}`}
                          type="number"
                          min={0}
                          placeholder="Set"
                          className="h-7 w-20 text-center text-sm"
                          value={attInputs[vol.id] ?? ""}
                          onChange={(e) =>
                            setAttInputs((p) => ({
                              ...p,
                              [vol.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleSetAtt(vol.id, fullName)
                          }
                        />
                        <Button
                          data-ocid={`manage_stats.att_set_button.${n}`}
                          variant="secondary"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => handleSetAtt(vol.id, fullName)}
                        >
                          Set
                        </Button>
                      </div>
                    </TableCell>

                    {/* Activity Points controls */}
                    <TableCell>
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          data-ocid={`manage_stats.pts_minus_button.${n}`}
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleAdjustPts(vol.id, -1, fullName)}
                          disabled={pts <= 0}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="w-8 text-center font-semibold tabular-nums">
                          {pts}
                        </span>
                        <Button
                          data-ocid={`manage_stats.pts_plus_button.${n}`}
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleAdjustPts(vol.id, 1, fullName)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                        <Input
                          data-ocid={`manage_stats.pts_input.${n}`}
                          type="number"
                          min={0}
                          placeholder="Set"
                          className="h-7 w-20 text-center text-sm"
                          value={ptsInputs[vol.id] ?? ""}
                          onChange={(e) =>
                            setPtsInputs((p) => ({
                              ...p,
                              [vol.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleSetPts(vol.id, fullName)
                          }
                        />
                        <Button
                          data-ocid={`manage_stats.pts_set_button.${n}`}
                          variant="secondary"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => handleSetPts(vol.id, fullName)}
                        >
                          Set
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
