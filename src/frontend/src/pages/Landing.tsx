import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, UserCheck, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { simpleHash, useAppStore } from "../hooks/useAppStore";

type LoginMode = null | "admin" | "coordinator" | "volunteer";

export default function Landing() {
  const store = useAppStore();
  const [loginMode, setLoginMode] = useState<LoginMode>(null);
  const [showRegister, setShowRegister] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form
  const [regFirst, setRegFirst] = useState("");
  const [regLast, setRegLast] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regRoll, setRegRoll] = useState("");
  const [regBranch, setRegBranch] = useState("");
  const [regPassword, setRegPassword] = useState("");

  function handleLogin() {
    if (loginMode === "admin") {
      if (
        loginEmail === "admin" &&
        loginPassword === store.state.adminPassword
      ) {
        store.login("admin", "admin", "Administrator");
        toast.success("Welcome, Admin!");
      } else {
        toast.error("Invalid admin credentials");
      }
    } else if (loginMode === "coordinator") {
      const coord = store.state.coordinators.find(
        (c) =>
          c.email === loginEmail &&
          c.passwordHash === simpleHash(loginPassword),
      );
      if (coord) {
        store.login(
          "coordinator",
          coord.id,
          `${coord.firstName} ${coord.lastName}`,
          coord.email,
        );
        toast.success(`Welcome, ${coord.firstName}!`);
      } else {
        toast.error("Invalid coordinator credentials");
      }
    } else if (loginMode === "volunteer") {
      const vol = store.state.volunteers.find(
        (v) =>
          v.email === loginEmail &&
          v.passwordHash === simpleHash(loginPassword),
      );
      if (vol) {
        store.login(
          "volunteer",
          vol.id,
          `${vol.firstName} ${vol.lastName}`,
          vol.email,
        );
        toast.success(`Welcome, ${vol.firstName}!`);
      } else {
        toast.error("Invalid volunteer credentials");
      }
    }
    setLoginEmail("");
    setLoginPassword("");
    setLoginMode(null);
  }

  function handleRegister() {
    if (
      !regFirst ||
      !regLast ||
      !regEmail ||
      !regRoll ||
      !regBranch ||
      !regPassword
    ) {
      toast.error("Please fill all fields");
      return;
    }
    const id = `vol_${Date.now().toString(36)}`;
    store.addVolunteer({
      id,
      firstName: regFirst,
      lastName: regLast,
      email: regEmail,
      matricule: regRoll,
      branch: regBranch,
      passwordHash: simpleHash(regPassword),
    });
    toast.success("Registration successful! Please login.");
    setShowRegister(false);
    setRegFirst("");
    setRegLast("");
    setRegEmail("");
    setRegRoll("");
    setRegBranch("");
    setRegPassword("");
  }

  const loginTitle =
    loginMode === "admin"
      ? "Admin Login"
      : loginMode === "coordinator"
        ? "Coordinator Login"
        : "Volunteer Login";
  const loginHint =
    loginMode === "admin"
      ? "Username: admin | Default password: Indran#12345"
      : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.15_0.08_145)] to-[oklch(0.25_0.10_145)] flex flex-col items-center justify-center p-6">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl mb-6 shadow-lg">
          <span className="text-3xl font-bold text-white">IN</span>
        </div>
        <h1 className="text-5xl font-bold text-white mb-3">INSARK</h1>
        <p className="text-xl text-white/70 mb-2">
          National Service Scheme Management Platform
        </p>
        <p className="text-white/50 max-w-md">
          Streamlining NSS activities for volunteers and coordinators
        </p>
      </div>

      {/* Login Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mb-8">
        <Card
          className="cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 border-white/10 bg-white/10 backdrop-blur-sm text-white"
          onClick={() => setLoginMode("admin")}
          data-ocid="landing.admin.card"
        >
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
            <CardTitle className="text-white mb-2">Admin</CardTitle>
            <CardDescription className="text-white/60">
              System administration and oversight
            </CardDescription>
            <Button className="mt-4 w-full" data-ocid="landing.admin.button">
              Login as Admin
            </Button>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 border-white/10 bg-white/10 backdrop-blur-sm text-white"
          onClick={() => setLoginMode("coordinator")}
          data-ocid="landing.coordinator.card"
        >
          <CardContent className="p-8 text-center">
            <UserCheck className="h-12 w-12 mx-auto mb-4 text-primary" />
            <CardTitle className="text-white mb-2">Coordinator</CardTitle>
            <CardDescription className="text-white/60">
              Manage events, attendance & volunteers
            </CardDescription>
            <Button
              className="mt-4 w-full"
              data-ocid="landing.coordinator.button"
            >
              Login as Coordinator
            </Button>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 border-white/10 bg-white/10 backdrop-blur-sm text-white"
          onClick={() => setLoginMode("volunteer")}
          data-ocid="landing.volunteer.card"
        >
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
            <CardTitle className="text-white mb-2">Volunteer</CardTitle>
            <CardDescription className="text-white/60">
              Track service hours and activities
            </CardDescription>
            <Button
              className="mt-4 w-full"
              data-ocid="landing.volunteer.button"
            >
              Login as Volunteer
            </Button>
          </CardContent>
        </Card>
      </div>

      <Button
        variant="outline"
        className="border-white/30 text-white hover:bg-white/10"
        onClick={() => setShowRegister(true)}
        data-ocid="landing.register.button"
      >
        Register as Volunteer
      </Button>

      {/* Login Dialog */}
      <Dialog
        open={loginMode !== null}
        onOpenChange={(o) => !o && setLoginMode(null)}
      >
        <DialogContent data-ocid="login.dialog">
          <DialogHeader>
            <DialogTitle>{loginTitle}</DialogTitle>
            {loginHint && (
              <p className="text-sm text-muted-foreground">{loginHint}</p>
            )}
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="login-email">Username / Email</Label>
              <Input
                id="login-email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder={loginMode === "admin" ? "admin" : "Email address"}
                data-ocid="login.email.input"
              />
            </div>
            <div>
              <Label htmlFor="login-pw">Password</Label>
              <Input
                id="login-pw"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                data-ocid="login.password.input"
              />
            </div>
            <Button
              className="w-full"
              onClick={handleLogin}
              data-ocid="login.submit.button"
            >
              Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Register Dialog */}
      <Dialog open={showRegister} onOpenChange={setShowRegister}>
        <DialogContent data-ocid="register.dialog">
          <DialogHeader>
            <DialogTitle>Volunteer Registration</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>First Name</Label>
                <Input
                  value={regFirst}
                  onChange={(e) => setRegFirst(e.target.value)}
                  data-ocid="register.firstname.input"
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={regLast}
                  onChange={(e) => setRegLast(e.target.value)}
                  data-ocid="register.lastname.input"
                />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                data-ocid="register.email.input"
              />
            </div>
            <div>
              <Label>Roll Number</Label>
              <Input
                value={regRoll}
                onChange={(e) => setRegRoll(e.target.value)}
                data-ocid="register.roll.input"
              />
            </div>
            <div>
              <Label>Branch</Label>
              <Input
                value={regBranch}
                onChange={(e) => setRegBranch(e.target.value)}
                placeholder="e.g. Computer Science"
                data-ocid="register.branch.input"
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                data-ocid="register.password.input"
              />
            </div>
            <Button
              className="w-full"
              onClick={handleRegister}
              data-ocid="register.submit.button"
            >
              Register
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
