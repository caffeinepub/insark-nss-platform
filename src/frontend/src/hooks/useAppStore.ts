import { useCallback, useEffect, useState } from "react";
import { backendService } from "../services/backendService";

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
  isLoading: boolean;
  loadError: string | null;
}

function loadCurrentUser(): CurrentUser | null {
  try {
    const raw = localStorage.getItem("insark_current_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCurrentUser(user: CurrentUser | null) {
  if (user) {
    localStorage.setItem("insark_current_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("insark_current_user");
  }
}

const INITIAL_STATE: AppState = {
  currentUser: loadCurrentUser(),
  adminPassword: "Indran#12345",
  coordinators: [],
  volunteers: [],
  events: [],
  attendance: [],
  activityPoints: [],
  gallery: [],
  certificates: [],
  messages: [],
  communityMessages: [],
  notifications: [],
  reports: [],
  isLoading: true,
  loadError: null,
};

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
let globalState: AppState = INITIAL_STATE;

function setState(updater: (prev: AppState) => AppState) {
  globalState = updater(globalState);
  for (const fn of listeners) {
    fn();
  }
}

async function loadFromBackend() {
  try {
    const [
      adminPassword,
      volunteers,
      coordinators,
      events,
      attendanceRaw,
      activityPointsRaw,
      gallery,
      certificates,
      communityMessages,
      feedbackMessages,
      notifications,
      reports,
    ] = await Promise.all([
      backendService.getAdminPassword(),
      backendService.getVolunteers(),
      backendService.getCoordinators(),
      backendService.getEvents(),
      backendService.getAttendanceRecords(),
      backendService.getActivityPointsRecords(),
      backendService.getGalleryPhotos(),
      backendService.getCertificates(),
      backendService.getCommunityMessages(),
      backendService.getFeedbackMessages(),
      backendService.getNotifications(),
      backendService.getReports(),
    ]);

    // Merge backend attendance with frontend days array
    const attendance: AttendanceRecord[] = attendanceRaw.map((r) => ({
      volunteerId: r.volunteerId,
      days: Array(6).fill(false),
      totalAttendance: r.totalAttendance,
      lastSaved: r.lastSaved,
    }));

    // Merge backend activity points with pendingPoints
    const activityPoints: ActivityPointsRecord[] = activityPointsRaw.map(
      (r) => ({
        volunteerId: r.volunteerId,
        storedPoints: r.storedPoints,
        pendingPoints: 0,
        lastSaved: r.lastSaved,
      }),
    );

    setState((s) => ({
      ...s,
      adminPassword: adminPassword || "Indran#12345",
      volunteers,
      coordinators,
      events,
      attendance,
      activityPoints,
      gallery,
      certificates,
      communityMessages,
      messages: feedbackMessages,
      notifications,
      reports,
      isLoading: false,
      loadError: null,
    }));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    setState((s) => ({ ...s, isLoading: false, loadError: msg }));
  }
}

// Initial load
loadFromBackend();

export function refreshFromBackend() {
  return loadFromBackend();
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
      backendService.addNotification(notif).catch(console.error);
    },
    [],
  );

  return {
    state: globalState,
    login(role: UserRole, id: string, name: string, email?: string) {
      const user = { role, id, name, email };
      setState((s) => ({ ...s, currentUser: user }));
      saveCurrentUser(user);
    },
    logout() {
      setState((s) => ({ ...s, currentUser: null }));
      saveCurrentUser(null);
    },
    setAdminPassword(pw: string) {
      setState((s) => ({ ...s, adminPassword: pw }));
      backendService.setAdminPassword(pw).catch(console.error);
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
        saveCurrentUser(updatedUser);
        if (s.currentUser.role === "coordinator") {
          const updated = s.coordinators.map((c) =>
            c.id === s.currentUser!.id ? { ...c, ...data } : c,
          );
          const target = updated.find((c) => c.id === s.currentUser!.id);
          if (target)
            backendService.updateCoordinator(target).catch(console.error);
          return { ...s, currentUser: updatedUser, coordinators: updated };
        }
        if (s.currentUser.role === "volunteer") {
          const updated = s.volunteers.map((v) =>
            v.id === s.currentUser!.id ? { ...v, ...data } : v,
          );
          const target = updated.find((v) => v.id === s.currentUser!.id);
          if (target)
            backendService.updateVolunteer(target).catch(console.error);
          return { ...s, currentUser: updatedUser, volunteers: updated };
        }
        return { ...s, currentUser: updatedUser };
      });
    },
    addCoordinator(c: CoordinatorLocal) {
      setState((s) => ({ ...s, coordinators: [...s.coordinators, c] }));
      backendService
        .addCoordinator({ ...c, profilePicture: c.profilePicture ?? "" })
        .catch(console.error);
    },
    updateCoordinator(c: CoordinatorLocal) {
      setState((s) => ({
        ...s,
        coordinators: s.coordinators.map((x) => (x.id === c.id ? c : x)),
      }));
      backendService
        .updateCoordinator({ ...c, profilePicture: c.profilePicture ?? "" })
        .catch(console.error);
    },
    deleteCoordinator(id: string) {
      setState((s) => ({
        ...s,
        coordinators: s.coordinators.filter((x) => x.id !== id),
      }));
      backendService.deleteCoordinator(id).catch(console.error);
    },
    addVolunteer(v: VolunteerLocal) {
      setState((s) => ({ ...s, volunteers: [...s.volunteers, v] }));
      backendService
        .addVolunteer({ ...v, profilePicture: v.profilePicture ?? "" })
        .catch(console.error);
    },
    updateVolunteer(v: VolunteerLocal) {
      setState((s) => ({
        ...s,
        volunteers: s.volunteers.map((x) => (x.id === v.id ? v : x)),
      }));
      backendService
        .updateVolunteer({ ...v, profilePicture: v.profilePicture ?? "" })
        .catch(console.error);
    },
    deleteVolunteer(id: string) {
      setState((s) => ({
        ...s,
        volunteers: s.volunteers.filter((x) => x.id !== id),
      }));
      backendService.deleteVolunteer(id).catch(console.error);
    },
    addEvent(e: Event) {
      setState((s) => ({ ...s, events: [...s.events, e] }));
      backendService.addEvent(e).catch(console.error);
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
      backendService.updateEvent(e).catch(console.error);
    },
    deleteEvent(id: string) {
      setState((s) => ({ ...s, events: s.events.filter((x) => x.id !== id) }));
      backendService.deleteEvent(id).catch(console.error);
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
        // Sync to backend
        for (const r of updated) {
          backendService
            .saveAttendanceRecord(r.volunteerId, r.totalAttendance)
            .catch(console.error);
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
        // Sync to backend
        for (const r of updated) {
          backendService
            .saveActivityPointsRecord(r.volunteerId, r.storedPoints)
            .catch(console.error);
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
        const target = updated.find((r) => r.volunteerId === volunteerId);
        if (target) {
          backendService
            .saveAttendanceRecord(volunteerId, target.totalAttendance)
            .catch(console.error);
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
        const target = updated.find((r) => r.volunteerId === volunteerId);
        if (target) {
          backendService
            .saveActivityPointsRecord(volunteerId, target.storedPoints)
            .catch(console.error);
        }
        return { ...s, activityPoints: updated };
      });
    },
    addGalleryPhoto(photo: GalleryPhoto) {
      setState((s) => ({ ...s, gallery: [...s.gallery, photo] }));
      backendService
        .addGalleryPhoto({ ...photo, uploadedAt: BigInt(photo.uploadedAt) })
        .catch(console.error);
    },
    deleteGalleryPhoto(id: string) {
      setState((s) => ({
        ...s,
        gallery: s.gallery.filter((x) => x.id !== id),
      }));
      backendService.deleteGalleryPhoto(id).catch(console.error);
    },
    addCertificate(cert: Certificate) {
      setState((s) => ({ ...s, certificates: [...s.certificates, cert] }));
      backendService.addCertificate(cert).catch(console.error);
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
      backendService.addCertificate(cert).catch(console.error);
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
      backendService.deleteCertificate(id).catch(console.error);
    },
    sendMessage(msg: Message) {
      setState((s) => ({ ...s, messages: [...s.messages, msg] }));
      backendService
        .addFeedbackMessage({ ...msg, timestamp: BigInt(msg.timestamp) })
        .catch(console.error);
    },
    deleteMessage(id: string) {
      setState((s) => ({
        ...s,
        messages: s.messages.filter((x) => x.id !== id),
      }));
      backendService.deleteFeedbackMessage(id).catch(console.error);
    },
    sendCommunityMessage(msg: CommunityMessage) {
      setState((s) => ({
        ...s,
        communityMessages: [...s.communityMessages, msg],
      }));
      backendService
        .addCommunityMessage({ ...msg, timestamp: BigInt(msg.timestamp) })
        .catch(console.error);
    },
    deleteCommunityMessage(id: string) {
      setState((s) => ({
        ...s,
        communityMessages: s.communityMessages.filter((x) => x.id !== id),
      }));
      backendService.deleteCommunityMessage(id).catch(console.error);
    },
    addNotification,
    markNotificationRead(id: string) {
      setState((s) => ({
        ...s,
        notifications: s.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n,
        ),
      }));
      backendService.markNotificationRead(id).catch(console.error);
    },
    markAllRead(userId: string) {
      setState((s) => ({
        ...s,
        notifications: s.notifications.map((n) =>
          n.userId === userId ? { ...n, isRead: true } : n,
        ),
      }));
      backendService.markAllNotificationsRead(userId).catch(console.error);
    },
    addReport(r: Report) {
      setState((s) => ({ ...s, reports: [...s.reports, r] }));
      backendService
        .addReport({
          ...r,
          submittedAt: BigInt(r.submittedAt),
          fileDataUrl: r.fileDataUrl ?? "",
          feedback: r.feedback ?? "",
        })
        .catch(console.error);
    },
    updateReport(r: Report) {
      setState((s) => ({
        ...s,
        reports: s.reports.map((x) => (x.id === r.id ? r : x)),
      }));
      backendService
        .updateReport({
          ...r,
          submittedAt: BigInt(r.submittedAt),
          fileDataUrl: r.fileDataUrl ?? "",
          feedback: r.feedback ?? "",
        })
        .catch(console.error);
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
      backendService.deleteReport(id).catch(console.error);
    },
  };
}
