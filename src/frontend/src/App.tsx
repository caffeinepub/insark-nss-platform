import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { useAppStore } from "./hooks/useAppStore";
import Landing from "./pages/Landing";
import AdminLayout from "./pages/admin/AdminLayout";
import CoordinatorLayout from "./pages/coordinator/CoordinatorLayout";
import VolunteerLayout from "./pages/volunteer/VolunteerLayout";

export default function App() {
  const { state } = useAppStore();
  const user = state.currentUser;

  return (
    <>
      <Toaster richColors position="top-right" />
      {!user && <Landing />}
      {user?.role === "admin" && <AdminLayout />}
      {user?.role === "coordinator" && <CoordinatorLayout />}
      {user?.role === "volunteer" && <VolunteerLayout />}
    </>
  );
}
