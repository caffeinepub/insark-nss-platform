import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { refreshFromBackend, useAppStore } from "./hooks/useAppStore";
import Landing from "./pages/Landing";
import AdminLayout from "./pages/admin/AdminLayout";
import CoordinatorLayout from "./pages/coordinator/CoordinatorLayout";
import VolunteerLayout from "./pages/volunteer/VolunteerLayout";

export default function App() {
  const { state } = useAppStore();
  const user = state.currentUser;

  // Poll every 10 seconds for fresh data from shared backend
  useEffect(() => {
    const interval = setInterval(() => {
      refreshFromBackend();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  if (state.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div
            data-ocid="app.loading_state"
            className="h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-600"
          />
          <p className="text-gray-600 text-sm font-medium">
            Loading INSARK NSS Platform...
          </p>
        </div>
      </div>
    );
  }

  if (state.loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div
          data-ocid="app.error_state"
          className="max-w-md rounded-lg border border-red-200 bg-white p-8 text-center shadow"
        >
          <div className="mb-3 text-4xl">⚠️</div>
          <h2 className="mb-2 font-semibold text-gray-800 text-lg">
            Connection Error
          </h2>
          <p className="mb-4 text-gray-600 text-sm">{state.loadError}</p>
          <button
            type="button"
            data-ocid="app.primary_button"
            onClick={() => refreshFromBackend()}
            className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
