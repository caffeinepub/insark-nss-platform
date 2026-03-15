import {
  Award,
  BarChart2,
  CalendarDays,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Settings,
  UserCheck,
  Users,
} from "lucide-react";
import { useState } from "react";
import Sidebar, { type SidebarItem } from "../../components/Sidebar";
import { useAppStore } from "../../hooks/useAppStore";
import ManageVolunteerStats from "../ManageVolunteerStats";
import AdminCertificates from "./AdminCertificates";
import AdminChat from "./AdminChat";
import AdminCoordinators from "./AdminCoordinators";
import AdminDashboard from "./AdminDashboard";
import AdminEvents from "./AdminEvents";
import AdminReports from "./AdminReports";
import AdminSettings from "./AdminSettings";
import AdminVolunteers from "./AdminVolunteers";

const ITEMS: SidebarItem[] = [
  {
    icon: <LayoutDashboard className="h-5 w-5" />,
    label: "Dashboard",
    key: "dashboard",
  },
  {
    icon: <UserCheck className="h-5 w-5" />,
    label: "Coordinators",
    key: "coordinators",
  },
  {
    icon: <Users className="h-5 w-5" />,
    label: "Volunteers",
    key: "volunteers",
  },
  {
    icon: <BarChart2 className="h-5 w-5" />,
    label: "Manage Stats",
    key: "managestats",
  },
  {
    icon: <CalendarDays className="h-5 w-5" />,
    label: "Events",
    key: "events",
  },
  { icon: <FileText className="h-5 w-5" />, label: "Reports", key: "reports" },
  {
    icon: <Award className="h-5 w-5" />,
    label: "Certificates",
    key: "certificates",
  },
  {
    icon: <MessageSquare className="h-5 w-5" />,
    label: "Community Chat",
    key: "chat",
  },
  {
    icon: <Settings className="h-5 w-5" />,
    label: "Settings",
    key: "settings",
  },
];

export default function AdminLayout() {
  const { logout } = useAppStore();
  const [active, setActive] = useState("dashboard");

  return (
    <div className="flex min-h-screen">
      <Sidebar
        items={ITEMS}
        active={active}
        onSelect={setActive}
        onSignOut={logout}
        userName="Administrator"
        userRole="Admin"
      />
      <main className="flex-1 bg-background overflow-auto">
        {active === "dashboard" && <AdminDashboard />}
        {active === "coordinators" && <AdminCoordinators />}
        {active === "volunteers" && <AdminVolunteers />}
        {active === "managestats" && <ManageVolunteerStats />}
        {active === "events" && <AdminEvents />}
        {active === "reports" && <AdminReports />}
        {active === "certificates" && <AdminCertificates />}
        {active === "chat" && <AdminChat />}
        {active === "settings" && <AdminSettings />}
      </main>
    </div>
  );
}
