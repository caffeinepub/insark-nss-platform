import { useCallback, useEffect, useState } from "react";

export type UserRole = "admin" | "coordinator" | "volunteer";

export interface CurrentUser {
  role: UserRole;
  id: string;
  name: string;
  email?: string;
}

export interface Event {
  id: string;
  name: string;
  date: string; // ISO date string
  eventType: string;
  description: string;
}

export interface AttendanceRecord {
  volunteerId: string;
  days: boolean[];
  totalAttendance: number;
  lastSaved: number; // timestamp ms
}

export interface ActivityPointsRecord {
  volunteerId: string;
  storedPoints: number;
  pendingPoints: number;
  lastSaved: number;
}

export interface GalleryPhoto {
  id: string;
  eventId: string;
  title: string;
  imageDataUrl: string;
  uploadedAt: number;
}

export interface Certificate {
  id: string;
  eventId: string;
  title: string;
  fileDataUrl?: string;
  uploadedAt: number;
  volunteerId?: string; // if set, only this volunteer can see it
}

export interface Message {
  id: string;
  fromId: string;
  fromRole: "volunteer" | "coordinator";
  toId: string;
  toRole: "volunteer" | "coordinator";
  content: string;
  timestamp: number;
}

export interface CommunityMessage {
  id: string;
  fromId: string;
  fromName: string;
  fromRole: UserRole;
  content: string;
  timestamp: number;
}

export interface Notification {
  id: string;
  userId: string;
  userRole: UserRole;
  message: string;
  isRead: boolean;
  createdAt: number;
}

export interface Report {
  id: string;
  volunteerId: string;
  volunteerName: string;
  eventName: string;
  title: string;
  description: string;
  fileDataUrl?: string;
  status: "Pending" | "Approved" | "Rejected";
  feedback?: string;
  submittedAt: number;
}

export interface CoordinatorLocal {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  grade: string;
  profilePicture?: string;
}

export interface VolunteerLocal {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  matricule: string;
  branch: string;
  passwordHash: string;
  profilePicture?: string;
}

interface AppState {
  currentUser: CurrentUser | null;
  adminPassword: string;
  coordinators: CoordinatorLocal[];
  volunteers: VolunteerLocal[];
  events: Event[];
  attendance: AttendanceRecord[];
  activityPoints: ActivityPointsRecord[];
  gallery: GalleryPhoto[];
  certificates: Certificate[];
  messages: Message[];
  communityMessages: CommunityMessage[];
  notifications: Notification[];
  reports: Report[];
}

const DEFAULT_STATE: AppState = {
  currentUser: null,
  adminPassword: "Indran#12345",
  coordinators: [],
  volunteers: [],
  events: [
    {
      id: "ev1",
      name: "Blood Donation Camp",
      date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      eventType: "Health",
      description: "Annual blood donation drive for the community.",
    },
    {
      id: "ev2",
      name: "Tree Plantation Drive",
      date: new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0],
      eventType: "Environment",
      description: "Plant 500 trees in the local park.",
    },
    {
      id: "ev3",
      name: "Literacy Campaign",
      date: new Date().toISOString().split("T")[0],
      eventType: "Education",
      description: "Teaching basic literacy skills to underprivileged.",
    },
  ],
  attendance: [],
  activityPoints: [],
  gallery: [],
  certificates: [],
  messages: [],
  communityMessages: [],
  notifications: [],
  reports: [],
};

function load(): AppState {
  try {
    const raw = localStorage.getItem("insark_state");
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
}

function save(state: AppState) {
  localStorage.setItem("insark_state", JSON.stringify(state));
}

export function getEventStatus(
  dateStr: string,
): "Upcoming" | "Ongoing" | "Completed" {
  const today = new Date().toISOString().split("T")[0];
  if (dateStr > today) return "Upcoming";
  if (dateStr === today) return "Ongoing";
  return "Completed";
}

export function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}

const listeners: Set<() => void> = new Set();
let globalState: AppState = load();

function setState(updater: (prev: AppState) => AppState) {
  globalState = updater(globalState);
  save(globalState);
  for (const fn of listeners) {
    fn();
  }
}

export function useAppStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const fn = () => setTick((t) => t + 1);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);

  const addNotification = useCallback(
    (userId: string, userRole: UserRole, message: string) => {
      const notif: Notification = {
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        userId,
        userRole,
        message,
        isRead: false,
        createdAt: Date.now(),
      };
      setState((s) => ({ ...s, notifications: [...s.notifications, notif] }));
    },
    [],
  );

  return {
    state: globalState,
    login(role: UserRole, id: string, name: string, email?: string) {
      setState((s) => ({ ...s, currentUser: { role, id, name, email } }));
    },
    logout() {
      setState((s) => ({ ...s, currentUser: null }));
    },
    setAdminPassword(pw: string) {
      setState((s) => ({ ...s, adminPassword: pw }));
    },
    updateCurrentUserProfile(data: {
      firstName: string;
      lastName: string;
      email?: string;
      profilePicture?: string;
      [key: string]: unknown;
    }) {
      setState((s) => {
        if (!s.currentUser) return s;
        const fullName = `${data.firstName} ${data.lastName}`;
        const updatedUser = {
          ...s.currentUser,
          name: fullName,
          email: data.email,
        };
        if (s.currentUser.role === "coordinator") {
          return {
            ...s,
            currentUser: updatedUser,
            coordinators: s.coordinators.map((c) =>
              c.id === s.currentUser!.id ? { ...c, ...data } : c,
            ),
          };
        }
        if (s.currentUser.role === "volunteer") {
          return {
            ...s,
            currentUser: updatedUser,
            volunteers: s.volunteers.map((v) =>
              v.id === s.currentUser!.id ? { ...v, ...data } : v,
            ),
          };
        }
        return { ...s, currentUser: updatedUser };
      });
    },
    addCoordinator(c: CoordinatorLocal) {
      setState((s) => ({ ...s, coordinators: [...s.coordinators, c] }));
    },
    updateCoordinator(c: CoordinatorLocal) {
      setState((s) => ({
        ...s,
        coordinators: s.coordinators.map((x) => (x.id === c.id ? c : x)),
      }));
    },
    deleteCoordinator(id: string) {
      setState((s) => ({
        ...s,
        coordinators: s.coordinators.filter((x) => x.id !== id),
      }));
    },
    addVolunteer(v: VolunteerLocal) {
      setState((s) => ({ ...s, volunteers: [...s.volunteers, v] }));
    },
    updateVolunteer(v: VolunteerLocal) {
      setState((s) => ({
        ...s,
        volunteers: s.volunteers.map((x) => (x.id === v.id ? v : x)),
      }));
    },
    deleteVolunteer(id: string) {
      setState((s) => ({
        ...s,
        volunteers: s.volunteers.filter((x) => x.id !== id),
      }));
    },
    addEvent(e: Event) {
      setState((s) => ({ ...s, events: [...s.events, e] }));
      // notify all volunteers
      const vols = globalState.volunteers;
      for (const v of vols) {
        addNotification(v.id, "volunteer", `New event created: ${e.name}`);
      }
    },
    updateEvent(e: Event) {
      setState((s) => ({
        ...s,
        events: s.events.map((x) => (x.id === e.id ? e : x)),
      }));
    },
    deleteEvent(id: string) {
      setState((s) => ({ ...s, events: s.events.filter((x) => x.id !== id) }));
    },
    saveAttendance(records: AttendanceRecord[]) {
      setState((s) => {
        const now = Date.now();
        const updated = [...s.attendance];
        for (const rec of records) {
          const idx = updated.findIndex(
            (a) => a.volunteerId === rec.volunteerId,
          );
          const newCount = rec.days.filter(Boolean).length;
          if (idx >= 0) {
            updated[idx] = {
              ...rec,
              totalAttendance: updated[idx].totalAttendance + newCount,
              lastSaved: now,
            };
          } else {
            updated.push({ ...rec, totalAttendance: newCount, lastSaved: now });
          }
        }
        return { ...s, attendance: updated };
      });
      for (const v of globalState.volunteers) {
        addNotification(v.id, "volunteer", "Your attendance has been updated.");
      }
    },
    saveActivityPoints(records: { volunteerId: string; points: number }[]) {
      setState((s) => {
        const now = Date.now();
        const updated = [...s.activityPoints];
        for (const { volunteerId, points } of records) {
          const idx = updated.findIndex((a) => a.volunteerId === volunteerId);
          if (idx >= 0) {
            updated[idx] = {
              ...updated[idx],
              storedPoints: updated[idx].storedPoints + points,
              pendingPoints: points,
              lastSaved: now,
            };
          } else {
            updated.push({
              volunteerId,
              storedPoints: points,
              pendingPoints: points,
              lastSaved: now,
            });
          }
        }
        return { ...s, activityPoints: updated };
      });
      for (const v of globalState.volunteers) {
        addNotification(
          v.id,
          "volunteer",
          "Your activity points have been updated.",
        );
      }
    },
    adjustAttendance(volunteerId: string, delta: number) {
      setState((s) => {
        const updated = [...s.attendance];
        const idx = updated.findIndex((a) => a.volunteerId === volunteerId);
        if (idx >= 0) {
          updated[idx] = {
            ...updated[idx],
            totalAttendance: Math.max(0, updated[idx].totalAttendance + delta),
          };
        } else if (delta > 0) {
          updated.push({
            volunteerId,
            days: Array(6).fill(false),
            totalAttendance: delta,
            lastSaved: Date.now(),
          });
        }
        return { ...s, attendance: updated };
      });
    },
    adjustActivityPoints(volunteerId: string, delta: number) {
      setState((s) => {
        const now = Date.now();
        const updated = [...s.activityPoints];
        const idx = updated.findIndex((a) => a.volunteerId === volunteerId);
        if (idx >= 0) {
          updated[idx] = {
            ...updated[idx],
            storedPoints: Math.max(0, updated[idx].storedPoints + delta),
            lastSaved: now,
          };
        } else if (delta > 0) {
          updated.push({
            volunteerId,
            storedPoints: delta,
            pendingPoints: 0,
            lastSaved: now,
          });
        }
        return { ...s, activityPoints: updated };
      });
    },
    addGalleryPhoto(photo: GalleryPhoto) {
      setState((s) => ({ ...s, gallery: [...s.gallery, photo] }));
    },
    deleteGalleryPhoto(id: string) {
      setState((s) => ({
        ...s,
        gallery: s.gallery.filter((x) => x.id !== id),
      }));
    },
    addCertificate(cert: Certificate) {
      setState((s) => ({ ...s, certificates: [...s.certificates, cert] }));
      for (const v of globalState.volunteers) {
        addNotification(
          v.id,
          "volunteer",
          `New certificate uploaded: ${cert.title}`,
        );
      }
    },
    sendCertificateToVolunteer(cert: Certificate) {
      setState((s) => ({ ...s, certificates: [...s.certificates, cert] }));
      const vol = globalState.volunteers.find((v) => v.id === cert.volunteerId);
      if (vol) {
        addNotification(
          vol.id,
          "volunteer",
          `A certificate has been sent to you: ${cert.title}`,
        );
      }
    },
    deleteCertificate(id: string) {
      setState((s) => ({
        ...s,
        certificates: s.certificates.filter((x) => x.id !== id),
      }));
    },
    sendMessage(msg: Message) {
      setState((s) => ({ ...s, messages: [...s.messages, msg] }));
    },
    deleteMessage(id: string) {
      setState((s) => ({
        ...s,
        messages: s.messages.filter((x) => x.id !== id),
      }));
    },
    sendCommunityMessage(msg: CommunityMessage) {
      setState((s) => ({
        ...s,
        communityMessages: [...s.communityMessages, msg],
      }));
    },
    deleteCommunityMessage(id: string) {
      setState((s) => ({
        ...s,
        communityMessages: s.communityMessages.filter((x) => x.id !== id),
      }));
    },
    addNotification,
    markNotificationRead(id: string) {
      setState((s) => ({
        ...s,
        notifications: s.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n,
        ),
      }));
    },
    markAllRead(userId: string) {
      setState((s) => ({
        ...s,
        notifications: s.notifications.map((n) =>
          n.userId === userId ? { ...n, isRead: true } : n,
        ),
      }));
    },
    addReport(r: Report) {
      setState((s) => ({ ...s, reports: [...s.reports, r] }));
    },
    updateReport(r: Report) {
      setState((s) => ({
        ...s,
        reports: s.reports.map((x) => (x.id === r.id ? r : x)),
      }));
      if (r.status === "Approved") {
        addNotification(
          r.volunteerId,
          "volunteer",
          `Your report "${r.title}" has been approved!`,
        );
      } else if (r.status === "Rejected") {
        addNotification(
          r.volunteerId,
          "volunteer",
          `Your report "${r.title}" has been reviewed. Please check feedback.`,
        );
      }
    },
    deleteReport(id: string) {
      setState((s) => ({
        ...s,
        reports: s.reports.filter((x) => x.id !== id),
      }));
    },
  };
}
