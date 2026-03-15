import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useAppStore } from "../../hooks/useAppStore";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function VolunteerProfile() {
  const store = useAppStore();
  const user = store.state.currentUser!;
  const volunteer = store.state.volunteers.find((v) => v.id === user.id);

  const [form, setForm] = useState({
    firstName: volunteer?.firstName ?? "",
    lastName: volunteer?.lastName ?? "",
    email: volunteer?.email ?? user.email ?? "",
    matricule: volunteer?.matricule ?? "",
    branch: volunteer?.branch ?? "",
    profilePicture: volunteer?.profilePicture ?? "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!volunteer) return;
    store.updateCurrentUserProfile({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      profilePicture: form.profilePicture || undefined,
    });
    store.updateVolunteer({
      ...volunteer,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      matricule: form.matricule,
      branch: form.branch,
      profilePicture: form.profilePicture || undefined,
    });
    toast.success("Profile updated successfully!");
  }

  const displayName = `${form.firstName} ${form.lastName}`.trim() || user.name;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          Update your personal information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar section */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-28 w-28">
              <AvatarImage src={form.profilePicture} className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              data-ocid="profile.upload_button"
            >
              <Camera className="h-4 w-4 mr-2" />
              Upload Photo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="profile-firstname">First Name</Label>
              <Input
                id="profile-firstname"
                value={form.firstName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, firstName: e.target.value }))
                }
                data-ocid="profile.firstname.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profile-lastname">Last Name</Label>
              <Input
                id="profile-lastname"
                value={form.lastName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lastName: e.target.value }))
                }
                data-ocid="profile.lastname.input"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-email">Email</Label>
            <Input
              id="profile-email"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              data-ocid="profile.email.input"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-roll">Roll Number</Label>
            <Input
              id="profile-roll"
              value={form.matricule}
              onChange={(e) =>
                setForm((f) => ({ ...f, matricule: e.target.value }))
              }
              data-ocid="profile.roll.input"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-branch">Branch</Label>
            <Input
              id="profile-branch"
              value={form.branch}
              onChange={(e) =>
                setForm((f) => ({ ...f, branch: e.target.value }))
              }
              data-ocid="profile.branch.input"
            />
          </div>

          <Button
            className="w-full"
            onClick={handleSave}
            data-ocid="profile.save_button"
          >
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
