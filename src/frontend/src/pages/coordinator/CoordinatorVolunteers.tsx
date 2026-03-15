import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppStore } from "../../hooks/useAppStore";

export default function CoordinatorVolunteers() {
  const { state } = useAppStore();

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Volunteers</h1>
        <p className="text-muted-foreground">View all registered volunteers</p>
      </div>
      <Table data-ocid="coord.volunteers.table">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Roll No.</TableHead>
            <TableHead>Branch</TableHead>
            <TableHead>Total Attendance</TableHead>
            <TableHead>Total Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {state.volunteers.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground"
                data-ocid="coord.volunteers.empty_state"
              >
                No volunteers.
              </TableCell>
            </TableRow>
          ) : (
            state.volunteers.map((v, i) => {
              const att = state.attendance.find((a) => a.volunteerId === v.id);
              const ap = state.activityPoints.find(
                (a) => a.volunteerId === v.id,
              );
              return (
                <TableRow
                  key={v.id}
                  data-ocid={`coord.volunteers.row.${i + 1}`}
                >
                  <TableCell>
                    {v.firstName} {v.lastName}
                  </TableCell>
                  <TableCell>{v.email}</TableCell>
                  <TableCell>{v.matricule}</TableCell>
                  <TableCell>{v.branch}</TableCell>
                  <TableCell>{att ? att.totalAttendance : 0}</TableCell>
                  <TableCell>{ap ? ap.storedPoints : 0}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
