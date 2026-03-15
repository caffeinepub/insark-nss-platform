import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Camera, Pencil, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  type CoordinatorLocal,
  simpleHash,
  useAppStore,
} from "../../hooks/useAppStore";

function getInitials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

export default function AdminCoordinators() {
  const store = useAppStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CoordinatorLocal | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    grade: "",
    profilePicture: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  function openAdd() {
    setEditing(null);
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      grade: "",
      profilePicture: "",
    });
    setOpen(true);
  }

  function openEdit(c: CoordinatorLocal) {
    setEditing(c);
    setForm({
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      password: "",
      grade: c.grade,
      profilePicture: c.profilePicture ?? "",
    });
    setOpen(true);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((f) => ({ ...f, profilePicture: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (!form.firstName || !form.email) {
      toast.error("Name and email required");
      return;
    }
    if (editing) {
      store.updateCoordinator({
        ...editing,
        ...form,
        passwordHash: form.password
          ? simpleHash(form.password)
          : editing.passwordHash,
      });
      toast.success("Coordinator updated");
    } else {
      if (!form.password) {
        toast.error("Password required");
        return;
      }
      const c: CoordinatorLocal = {
        id: `coord_${Date.now().toString(36)}`,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        grade: form.grade,
        passwordHash: simpleHash(form.password),
        profilePicture: form.profilePicture || undefined,
      };
      store.addCoordinator(c);
      toast.success("Coordinator created");
    }
    setOpen(false);
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Coordinators</h1>
          <p className="text-muted-foreground">Manage coordinator accounts</p>
        </div>
        <Button onClick={openAdd} data-ocid="admin.coordinators.add.button">
          <Plus className="h-4 w-4 mr-2" />
          Add Coordinator
        </Button>
      </div>

      <Table data-ocid="admin.coordinators.table">
        <TableHeader>
          <TableRow>
            <TableHead>Photo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {store.state.coordinators.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground"
                data-ocid="admin.coordinators.empty_state"
              >
                No coordinators yet.
              </TableCell>
            </TableRow>
          ) : (
            store.state.coordinators.map((c, i) => (
              <TableRow
                key={c.id}
                data-ocid={`admin.coordinators.row.${i + 1}`}
              >
                <TableCell>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={c.profilePicture} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(c.firstName, c.lastName)}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>
                  {c.firstName} {c.lastName}
                </TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c.grade}</TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(c)}
                    data-ocid={`admin.coordinator.edit_button.${i + 1}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      store.deleteCoordinator(c.id);
                      toast.success("Deleted");
                    }}
                    data-ocid={`admin.coordinator.delete_button.${i + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-ocid="admin.coordinator.dialog">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Coordinator" : "Add Coordinator"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Profile picture */}
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={form.profilePicture}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {getInitials(form.firstName || "?", form.lastName || "?")}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                data-ocid="admin.coordinator.upload_button"
              >
                <Camera className="h-4 w-4 mr-2" />
                {editing ? "Change Photo" : "Add Photo"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>First Name</Label>
                <Input
                  value={form.firstName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, firstName: e.target.value }))
                  }
                  data-ocid="coordinator.firstname.input"
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={form.lastName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, lastName: e.target.value }))
                  }
                  data-ocid="coordinator.lastname.input"
                />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                data-ocid="coordinator.email.input"
              />
            </div>
            <div>
              <Label>
                {editing ? "New Password (leave blank to keep)" : "Password"}
              </Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                data-ocid="coordinator.password.input"
              />
            </div>
            <div>
              <Label>Grade</Label>
              <Input
                value={form.grade}
                onChange={(e) =>
                  setForm((f) => ({ ...f, grade: e.target.value }))
                }
                placeholder="e.g. Senior"
                data-ocid="coordinator.grade.input"
              />
            </div>
            <Button
              className="w-full"
              onClick={handleSave}
              data-ocid="admin.coordinator.save_button"
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
