import {
  Award,
  Bell,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  Image,
  LayoutDashboard,
  MessageSquare,
  Star,
  UserCircle,
} from "lucide-react";
import { useState } from "react";
import Sidebar, { type SidebarItem } from "../../components/Sidebar";
import { useAppStore } from "../../hooks/useAppStore";
import VolunteerActivityPoints from "./VolunteerActivityPoints";
import VolunteerAttendance from "./VolunteerAttendance";
import VolunteerCertificates from "./VolunteerCertificates";
import VolunteerChat from "./VolunteerChat";
import VolunteerCommunityChat from "./VolunteerCommunityChat";
import VolunteerDashboard from "./VolunteerDashboard";
import VolunteerEvents from "./VolunteerEvents";
import VolunteerGallery from "./VolunteerGallery";
import VolunteerNotifications from "./VolunteerNotifications";
import VolunteerProfile from "./VolunteerProfile";
import VolunteerReports from "./VolunteerReports";

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
    icon: <CheckSquare className="h-5 w-5" />,
    label: "Attendance",
    key: "attendance",
  },
  {
    icon: <Star className="h-5 w-5" />,
    label: "Activity Points",
    key: "points",
  },
  {
    icon: <ClipboardList className="h-5 w-5" />,
    label: "My Reports",
    key: "reports",
  },
  {
    icon: <MessageSquare className="h-5 w-5" />,
    label: "Community Chat",
    key: "communitychat",
  },
  { icon: <Image className="h-5 w-5" />, label: "Gallery", key: "gallery" },
  {
    icon: <MessageSquare className="h-5 w-5" />,
    label: "Feedback",
    key: "chat",
  },
  {
    icon: <Award className="h-5 w-5" />,
    label: "Certificates",
    key: "certificates",
  },
  {
    icon: <Bell className="h-5 w-5" />,
    label: "Notifications",
    key: "notifications",
  },
];

export default function VolunteerLayout() {
  const { state, logout } = useAppStore();
  const [active, setActive] = useState("dashboard");
  const user = state.currentUser!;
  const volunteer = state.volunteers.find((v) => v.id === user.id);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        items={ITEMS}
        active={active}
        onSelect={setActive}
        onSignOut={logout}
        userName={user.name}
        userRole="Volunteer"
        userAvatar={volunteer?.profilePicture}
      />
      <main className="flex-1 bg-background overflow-auto">
        {active === "dashboard" && (
          <VolunteerDashboard onNavigate={setActive} />
        )}
        {active === "profile" && <VolunteerProfile />}
        {active === "events" && <VolunteerEvents />}
        {active === "attendance" && <VolunteerAttendance />}
        {active === "points" && <VolunteerActivityPoints />}
        {active === "reports" && <VolunteerReports />}
        {active === "communitychat" && <VolunteerCommunityChat />}
        {active === "gallery" && <VolunteerGallery />}
        {active === "chat" && <VolunteerChat />}
        {active === "certificates" && <VolunteerCertificates />}
        {active === "notifications" && <VolunteerNotifications />}
      </main>
    </div>
  );
}
