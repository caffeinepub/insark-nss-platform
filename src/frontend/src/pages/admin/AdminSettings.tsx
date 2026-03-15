import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { useAppStore } from "../../hooks/useAppStore";

export default function AdminSettings() {
  const store = useAppStore();
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");

  function handleChange() {
    if (current !== store.state.adminPassword) {
      toast.error("Current password incorrect");
      return;
    }
    if (newPw !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPw.length < 6) {
      toast.error("Password too short");
      return;
    }
    store.setAdminPassword(newPw);
    toast.success("Password changed successfully");
    setCurrent("");
    setNewPw("");
    setConfirm("");
  }

  return (
    <div className="p-8 max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">System configuration</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Change Admin Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Current Password</Label>
            <Input
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              data-ocid="settings.current.password.input"
            />
          </div>
          <div>
            <Label>New Password</Label>
            <Input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              data-ocid="settings.new.password.input"
            />
          </div>
          <div>
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              data-ocid="settings.confirm.password.input"
            />
          </div>
          <Button
            onClick={handleChange}
            data-ocid="settings.change.password.button"
          >
            Change Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
