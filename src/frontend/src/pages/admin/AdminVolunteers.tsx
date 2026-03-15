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
import { Camera, Pencil, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  type VolunteerLocal,
  simpleHash,
  useAppStore,
} from "../../hooks/useAppStore";

function getInitials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

export default function AdminVolunteers() {
  const store = useAppStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<VolunteerLocal | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    matricule: "",
    branch: "",
    password: "",
    profilePicture: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  function openEdit(v: VolunteerLocal) {
    setEditing(v);
    setForm({
      firstName: v.firstName,
      lastName: v.lastName,
      email: v.email,
      matricule: v.matricule,
      branch: v.branch,
      password: "",
      profilePicture: v.profilePicture ?? "",
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
    if (!editing) return;
    store.updateVolunteer({
      ...editing,
      ...form,
      passwordHash: form.password
        ? simpleHash(form.password)
        : editing.passwordHash,
    });
    toast.success("Volunteer updated");
    setOpen(false);
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Volunteers</h1>
        <p className="text-muted-foreground">Manage volunteer accounts</p>
      </div>

      <Table data-ocid="admin.volunteers.table">
        <TableHeader>
          <TableRow>
            <TableHead>Photo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Roll No.</TableHead>
            <TableHead>Branch</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {store.state.volunteers.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground"
                data-ocid="admin.volunteers.empty_state"
              >
                No volunteers registered yet.
              </TableCell>
            </TableRow>
          ) : (
            store.state.volunteers.map((v, i) => (
              <TableRow key={v.id} data-ocid={`admin.volunteers.row.${i + 1}`}>
                <TableCell>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={v.profilePicture} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(v.firstName, v.lastName)}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>
                  {v.firstName} {v.lastName}
                </TableCell>
                <TableCell>{v.email}</TableCell>
                <TableCell>{v.matricule}</TableCell>
                <TableCell>{v.branch}</TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(v)}
                    data-ocid={`admin.volunteer.edit_button.${i + 1}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      store.deleteVolunteer(v.id);
                      toast.success("Deleted");
                    }}
                    data-ocid={`admin.volunteer.delete_button.${i + 1}`}
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
        <DialogContent data-ocid="admin.volunteer.dialog">
          <DialogHeader>
            <DialogTitle>Edit Volunteer</DialogTitle>
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
                data-ocid="admin.volunteer.upload_button"
              >
                <Camera className="h-4 w-4 mr-2" />
                Change Photo
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
                  data-ocid="volunteer.firstname.input"
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={form.lastName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, lastName: e.target.value }))
                  }
                  data-ocid="volunteer.lastname.input"
                />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                data-ocid="volunteer.email.input"
              />
            </div>
            <div>
              <Label>Roll Number</Label>
              <Input
                value={form.matricule}
                onChange={(e) =>
                  setForm((f) => ({ ...f, matricule: e.target.value }))
                }
                data-ocid="volunteer.roll.input"
              />
            </div>
            <div>
              <Label>Branch</Label>
              <Input
                value={form.branch}
                onChange={(e) =>
                  setForm((f) => ({ ...f, branch: e.target.value }))
                }
                data-ocid="volunteer.branch.input"
              />
            </div>
            <div>
              <Label>New Password (leave blank to keep)</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                data-ocid="volunteer.password.input"
              />
            </div>
            <Button
              className="w-full"
              onClick={handleSave}
              data-ocid="admin.volunteer.save_button"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
