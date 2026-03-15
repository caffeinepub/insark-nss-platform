import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getEventStatus, useAppStore } from "../../hooks/useAppStore";

export default function VolunteerEvents() {
  const { state } = useAppStore();

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <p className="text-muted-foreground">Upcoming and past NSS events</p>
      </div>
      <Table data-ocid="vol.events.table">
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {state.events.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground"
                data-ocid="vol.events.empty_state"
              >
                No events available.
              </TableCell>
            </TableRow>
          ) : (
            state.events.map((e, i) => {
              const status = getEventStatus(e.date);
              return (
                <TableRow key={e.id} data-ocid={`vol.event.row.${i + 1}`}>
                  <TableCell className="font-medium">{e.name}</TableCell>
                  <TableCell>{e.date}</TableCell>
                  <TableCell>{e.eventType}</TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {e.description}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
