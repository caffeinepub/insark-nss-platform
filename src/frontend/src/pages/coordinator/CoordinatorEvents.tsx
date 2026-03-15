import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type Event,
  getEventStatus,
  useAppStore,
} from "../../hooks/useAppStore";

export default function CoordinatorEvents() {
  const store = useAppStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [form, setForm] = useState({
    name: "",
    date: "",
    eventType: "",
    description: "",
  });

  function openAdd() {
    setEditing(null);
    setForm({ name: "", date: "", eventType: "", description: "" });
    setOpen(true);
  }
  function openEdit(e: Event) {
    setEditing(e);
    setForm({
      name: e.name,
      date: e.date,
      eventType: e.eventType,
      description: e.description,
    });
    setOpen(true);
  }

  function handleSave() {
    if (!form.name || !form.date) {
      toast.error("Name and date required");
      return;
    }
    if (editing) {
      store.updateEvent({ ...editing, ...form });
      toast.success("Event updated");
    } else {
      store.addEvent({ id: `ev_${Date.now().toString(36)}`, ...form });
      toast.success("Event created");
    }
    setOpen(false);
  }

  function statusVariant(s: string) {
    if (s === "Upcoming") return "default" as const;
    if (s === "Ongoing") return "secondary" as const;
    return "outline" as const;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-muted-foreground">Manage NSS events</p>
        </div>
        <Button onClick={openAdd} data-ocid="coord.events.add.button">
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      <Table data-ocid="coord.events.table">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {store.state.events.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground"
                data-ocid="coord.events.empty_state"
              >
                No events yet.
              </TableCell>
            </TableRow>
          ) : (
            store.state.events.map((e, i) => {
              const status = getEventStatus(e.date);
              return (
                <TableRow key={e.id} data-ocid={`coord.events.row.${i + 1}`}>
                  <TableCell className="font-medium">{e.name}</TableCell>
                  <TableCell>{e.date}</TableCell>
                  <TableCell>{e.eventType}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(status)}>{status}</Badge>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(e)}
                      data-ocid={`coord.event.edit.button.${i + 1}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        store.deleteEvent(e.id);
                        toast.success("Deleted");
                      }}
                      data-ocid={`coord.event.delete.button.${i + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-ocid="coord.event.dialog">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Event" : "Add Event"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Event Name</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                data-ocid="event.name.input"
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
                data-ocid="event.date.input"
              />
            </div>
            <div>
              <Label>Event Type</Label>
              <Input
                value={form.eventType}
                onChange={(e) =>
                  setForm((f) => ({ ...f, eventType: e.target.value }))
                }
                placeholder="e.g. Health, Education"
                data-ocid="event.type.input"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                data-ocid="event.description.textarea"
              />
            </div>
            <Button
              className="w-full"
              onClick={handleSave}
              data-ocid="event.save.button"
            >
              Save Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
