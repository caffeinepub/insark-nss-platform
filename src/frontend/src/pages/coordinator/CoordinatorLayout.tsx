import {
  Award,
  BarChart2,
  Bell,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  Image,
  LayoutDashboard,
  MessageSquare,
  UserCircle,
  Users,
} from "lucide-react";
import { useState } from "react";
import Sidebar, { type SidebarItem } from "../../components/Sidebar";
import { useAppStore } from "../../hooks/useAppStore";
import ManageVolunteerStats from "../ManageVolunteerStats";
import CoordinatorAttendance from "./CoordinatorAttendance";
import CoordinatorCertificates from "./CoordinatorCertificates";
import CoordinatorChat from "./CoordinatorChat";
import CoordinatorDashboard from "./CoordinatorDashboard";
import CoordinatorEvents from "./CoordinatorEvents";
import CoordinatorFeedback from "./CoordinatorFeedback";
import CoordinatorGallery from "./CoordinatorGallery";
import CoordinatorNotifications from "./CoordinatorNotifications";
import CoordinatorProfile from "./CoordinatorProfile";
import CoordinatorReports from "./CoordinatorReports";
import CoordinatorVolunteers from "./CoordinatorVolunteers";

const ITEMS: SidebarItem[] = [
  {
    icon: <LayoutDashboard className="h-5 w-5" />,
    label: "Dashboard",
    key: "dashboard",
  },
  {
    icon: <UserCircle className="h-5 w-5" />,
    label: "My Profile",
    key: "profile",
  },
  {
    icon: <CalendarDays className="h-5 w-5" />,
    label: "Events",
    key: "events",
  },
  {
    icon: <Users className="h-5 w-5" />,
    label: "Volunteers",
    key: "volunteers",
  },
  {
    icon: <CheckSquare className="h-5 w-5" />,
    label: "Attendance",
    key: "attendance",
  },
  {
    icon: <BarChart2 className="h-5 w-5" />,
    label: "Manage Stats",
    key: "managestats",
  },
  {
    icon: <ClipboardList className="h-5 w-5" />,
    label: "Reports",
    key: "reports",
  },
  {
    icon: <MessageSquare className="h-5 w-5" />,
    label: "Community Chat",
    key: "chat",
  },
  { icon: <Image className="h-5 w-5" />, label: "Gallery", key: "gallery" },
  {
    icon: <Award className="h-5 w-5" />,
    label: "Certificates",
    key: "certificates",
  },
  {
    icon: <MessageSquare className="h-5 w-5" />,
    label: "Feedback",
    key: "feedback",
  },
  {
    icon: <Bell className="h-5 w-5" />,
    label: "Notifications",
    key: "notifications",
  },
];

export default function CoordinatorLayout() {
  const { state, logout } = useAppStore();
  const [active, setActive] = useState("dashboard");
  const user = state.currentUser!;
  const coordinator = state.coordinators.find((c) => c.id === user.id);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        items={ITEMS}
        active={active}
        onSelect={setActive}
        onSignOut={logout}
        userName={user.name}
        userRole="Coordinator"
        userAvatar={coordinator?.profilePicture}
      />
      <main className="flex-1 bg-background overflow-auto">
        {active === "dashboard" && <CoordinatorDashboard />}
        {active === "profile" && <CoordinatorProfile />}
        {active === "events" && <CoordinatorEvents />}
        {active === "volunteers" && <CoordinatorVolunteers />}
        {active === "attendance" && <CoordinatorAttendance />}
        {active === "managestats" && <ManageVolunteerStats />}
        {active === "reports" && <CoordinatorReports />}
        {active === "chat" && <CoordinatorChat />}
        {active === "gallery" && <CoordinatorGallery />}
        {active === "certificates" && <CoordinatorCertificates />}
        {active === "feedback" && <CoordinatorFeedback />}
        {active === "notifications" && <CoordinatorNotifications />}
      </main>
    </div>
  );
}
