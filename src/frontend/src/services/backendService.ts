import { Actor, HttpAgent } from "@icp-sdk/core/agent";
import { IDL } from "@icp-sdk/core/candid";
import { loadConfig } from "../config";

// Full IDL factory for the current backend (main.mo)
const idlFactory = ({
  IDL,
}: { IDL: typeof import("@icp-sdk/core/candid").IDL }) => {
  const Volunteer = IDL.Record({
    id: IDL.Text,
    firstName: IDL.Text,
    lastName: IDL.Text,
    email: IDL.Text,
    matricule: IDL.Text,
    branch: IDL.Text,
    passwordHash: IDL.Text,
    profilePicture: IDL.Text,
  });

  const Coordinator = IDL.Record({
    id: IDL.Text,
    firstName: IDL.Text,
    lastName: IDL.Text,
    email: IDL.Text,
    passwordHash: IDL.Text,
    grade: IDL.Text,
    profilePicture: IDL.Text,
  });

  const Event = IDL.Record({
    id: IDL.Text,
    name: IDL.Text,
    date: IDL.Text,
    eventType: IDL.Text,
    description: IDL.Text,
  });

  const AttendanceRecord = IDL.Record({
    volunteerId: IDL.Text,
    totalAttendance: IDL.Nat,
    lastSaved: IDL.Int,
  });

  const ActivityPointsRecord = IDL.Record({
    volunteerId: IDL.Text,
    storedPoints: IDL.Nat,
    lastSaved: IDL.Int,
  });

  const GalleryPhoto = IDL.Record({
    id: IDL.Text,
    eventId: IDL.Text,
    title: IDL.Text,
    imageDataUrl: IDL.Text,
    uploadedAt: IDL.Int,
  });

  const Certificate = IDL.Record({
    id: IDL.Text,
    eventId: IDL.Text,
    title: IDL.Text,
    fileDataUrl: IDL.Text,
    uploadedAt: IDL.Int,
    volunteerId: IDL.Text,
  });

  const CommunityMessage = IDL.Record({
    id: IDL.Text,
    fromId: IDL.Text,
    fromName: IDL.Text,
    fromRole: IDL.Text,
    content: IDL.Text,
    timestamp: IDL.Int,
  });

  const FeedbackMessage = IDL.Record({
    id: IDL.Text,
    fromId: IDL.Text,
    fromRole: IDL.Text,
    toId: IDL.Text,
    toRole: IDL.Text,
    content: IDL.Text,
    timestamp: IDL.Int,
  });

  const Notification = IDL.Record({
    id: IDL.Text,
    userId: IDL.Text,
    userRole: IDL.Text,
    message: IDL.Text,
    isRead: IDL.Bool,
    createdAt: IDL.Int,
  });

  const Report = IDL.Record({
    id: IDL.Text,
    volunteerId: IDL.Text,
    volunteerName: IDL.Text,
    eventName: IDL.Text,
    title: IDL.Text,
    description: IDL.Text,
    fileDataUrl: IDL.Text,
    status: IDL.Text,
    feedback: IDL.Text,
    submittedAt: IDL.Int,
  });

  return IDL.Service({
    // Admin
    getAdminPasswordHash: IDL.Func([], [IDL.Text], ["query"]),
    setAdminPasswordHash: IDL.Func([IDL.Text], [], []),
    // Volunteers
    getVolunteers: IDL.Func([], [IDL.Vec(Volunteer)], ["query"]),
    addVolunteer: IDL.Func([Volunteer], [], []),
    updateVolunteer: IDL.Func([Volunteer], [], []),
    deleteVolunteer: IDL.Func([IDL.Text], [], []),
    // Coordinators
    getCoordinators: IDL.Func([], [IDL.Vec(Coordinator)], ["query"]),
    addCoordinator: IDL.Func([Coordinator], [], []),
    updateCoordinator: IDL.Func([Coordinator], [], []),
    deleteCoordinator: IDL.Func([IDL.Text], [], []),
    // Events
    getEvents: IDL.Func([], [IDL.Vec(Event)], ["query"]),
    addEvent: IDL.Func([Event], [], []),
    updateEvent: IDL.Func([Event], [], []),
    deleteEvent: IDL.Func([IDL.Text], [], []),
    // Attendance
    getAttendanceRecords: IDL.Func([], [IDL.Vec(AttendanceRecord)], ["query"]),
    saveAttendanceRecord: IDL.Func([AttendanceRecord], [], []),
    adjustAttendance: IDL.Func([IDL.Text, IDL.Int], [], []),
    // Activity Points
    getActivityPointsRecords: IDL.Func(
      [],
      [IDL.Vec(ActivityPointsRecord)],
      ["query"],
    ),
    saveActivityPointsRecord: IDL.Func([ActivityPointsRecord], [], []),
    adjustActivityPoints: IDL.Func([IDL.Text, IDL.Int], [], []),
    // Gallery
    getGalleryPhotos: IDL.Func([], [IDL.Vec(GalleryPhoto)], ["query"]),
    addGalleryPhoto: IDL.Func([GalleryPhoto], [], []),
    deleteGalleryPhoto: IDL.Func([IDL.Text], [], []),
    // Certificates
    getCertificates: IDL.Func([], [IDL.Vec(Certificate)], ["query"]),
    addCertificate: IDL.Func([Certificate], [], []),
    deleteCertificate: IDL.Func([IDL.Text], [], []),
    // Community Messages
    getCommunityMessages: IDL.Func([], [IDL.Vec(CommunityMessage)], ["query"]),
    addCommunityMessage: IDL.Func([CommunityMessage], [], []),
    deleteCommunityMessage: IDL.Func([IDL.Text], [], []),
    // Feedback Messages
    getFeedbackMessages: IDL.Func([], [IDL.Vec(FeedbackMessage)], ["query"]),
    addFeedbackMessage: IDL.Func([FeedbackMessage], [], []),
    deleteFeedbackMessage: IDL.Func([IDL.Text], [], []),
    // Notifications
    getNotifications: IDL.Func([], [IDL.Vec(Notification)], ["query"]),
    addNotification: IDL.Func([Notification], [], []),
    markNotificationRead: IDL.Func([IDL.Text], [], []),
    markAllNotificationsRead: IDL.Func([IDL.Text], [], []),
    // Reports
    getReports: IDL.Func([], [IDL.Vec(Report)], ["query"]),
    addReport: IDL.Func([Report], [], []),
    updateReport: IDL.Func([Report], [], []),
    deleteReport: IDL.Func([IDL.Text], [], []),
  });
};

let rawActorInstance: any = null;
let initPromise: Promise<void> | null = null;

async function getRawActor() {
  if (rawActorInstance) return rawActorInstance;
  if (!initPromise) {
    initPromise = (async () => {
      const config = await loadConfig();
      const agent = new HttpAgent({ host: config.backend_host });
      if (config.backend_host?.includes("localhost")) {
        await agent.fetchRootKey().catch(console.error);
      }
      rawActorInstance = Actor.createActor(idlFactory as any, {
        agent,
        canisterId: config.backend_canister_id,
      });
    })();
  }
  await initPromise;
  return rawActorInstance;
}

export const backendService = {
  async getAdminPassword(): Promise<string> {
    const a = await getRawActor();
    return a.getAdminPasswordHash();
  },
  async setAdminPassword(pw: string): Promise<void> {
    const a = await getRawActor();
    await a.setAdminPasswordHash(pw);
  },

  async getVolunteers() {
    const a = await getRawActor();
    const list = await a.getVolunteers();
    return list.map((v: any) => ({
      ...v,
      profilePicture: v.profilePicture || undefined,
    }));
  },
  async addVolunteer(v: object) {
    const a = await getRawActor();
    await a.addVolunteer(v);
  },
  async updateVolunteer(v: object) {
    const a = await getRawActor();
    await a.updateVolunteer(v);
  },
  async deleteVolunteer(id: string) {
    const a = await getRawActor();
    await a.deleteVolunteer(id);
  },

  async getCoordinators() {
    const a = await getRawActor();
    const list = await a.getCoordinators();
    return list.map((c: any) => ({
      ...c,
      profilePicture: c.profilePicture || undefined,
    }));
  },
  async addCoordinator(c: object) {
    const a = await getRawActor();
    await a.addCoordinator(c);
  },
  async updateCoordinator(c: object) {
    const a = await getRawActor();
    await a.updateCoordinator(c);
  },
  async deleteCoordinator(id: string) {
    const a = await getRawActor();
    await a.deleteCoordinator(id);
  },

  async getEvents() {
    const a = await getRawActor();
    return a.getEvents();
  },
  async addEvent(e: object) {
    const a = await getRawActor();
    await a.addEvent(e);
  },
  async updateEvent(e: object) {
    const a = await getRawActor();
    await a.updateEvent(e);
  },
  async deleteEvent(id: string) {
    const a = await getRawActor();
    await a.deleteEvent(id);
  },

  async getAttendanceRecords() {
    const a = await getRawActor();
    const list = await a.getAttendanceRecords();
    return list.map((r: any) => ({
      volunteerId: r.volunteerId,
      totalAttendance: Number(r.totalAttendance),
      lastSaved: Number(r.lastSaved),
    }));
  },
  async saveAttendanceRecord(volunteerId: string, totalAttendance: number) {
    const a = await getRawActor();
    await a.saveAttendanceRecord({
      volunteerId,
      totalAttendance: BigInt(totalAttendance),
      lastSaved: BigInt(Date.now()),
    });
  },
  async adjustAttendance(volunteerId: string, delta: number) {
    const a = await getRawActor();
    await a.adjustAttendance(volunteerId, BigInt(delta));
  },

  async getActivityPointsRecords() {
    const a = await getRawActor();
    const list = await a.getActivityPointsRecords();
    return list.map((r: any) => ({
      volunteerId: r.volunteerId,
      storedPoints: Number(r.storedPoints),
      lastSaved: Number(r.lastSaved),
    }));
  },
  async saveActivityPointsRecord(volunteerId: string, storedPoints: number) {
    const a = await getRawActor();
    await a.saveActivityPointsRecord({
      volunteerId,
      storedPoints: BigInt(storedPoints),
      lastSaved: BigInt(Date.now()),
    });
  },
  async adjustActivityPoints(volunteerId: string, delta: number) {
    const a = await getRawActor();
    await a.adjustActivityPoints(volunteerId, BigInt(delta));
  },

  async getGalleryPhotos() {
    const a = await getRawActor();
    const list = await a.getGalleryPhotos();
    return list.map((p: any) => ({ ...p, uploadedAt: Number(p.uploadedAt) }));
  },
  async addGalleryPhoto(p: any) {
    const a = await getRawActor();
    await a.addGalleryPhoto({ ...p, uploadedAt: BigInt(p.uploadedAt) });
  },
  async deleteGalleryPhoto(id: string) {
    const a = await getRawActor();
    await a.deleteGalleryPhoto(id);
  },

  async getCertificates() {
    const a = await getRawActor();
    const list = await a.getCertificates();
    return list.map((c: any) => ({
      ...c,
      uploadedAt: Number(c.uploadedAt),
      volunteerId: c.volunteerId === "" ? undefined : c.volunteerId,
      fileDataUrl: c.fileDataUrl || undefined,
    }));
  },
  async addCertificate(c: {
    id: string;
    eventId: string;
    title: string;
    fileDataUrl?: string;
    uploadedAt: number;
    volunteerId?: string;
  }) {
    const a = await getRawActor();
    await a.addCertificate({
      ...c,
      uploadedAt: BigInt(c.uploadedAt),
      volunteerId: c.volunteerId ?? "",
      fileDataUrl: c.fileDataUrl ?? "",
    });
  },
  async deleteCertificate(id: string) {
    const a = await getRawActor();
    await a.deleteCertificate(id);
  },

  async getCommunityMessages() {
    const a = await getRawActor();
    const list = await a.getCommunityMessages();
    return list.map((m: any) => ({ ...m, timestamp: Number(m.timestamp) }));
  },
  async addCommunityMessage(m: any) {
    const a = await getRawActor();
    await a.addCommunityMessage({ ...m, timestamp: BigInt(m.timestamp) });
  },
  async deleteCommunityMessage(id: string) {
    const a = await getRawActor();
    await a.deleteCommunityMessage(id);
  },

  async getFeedbackMessages() {
    const a = await getRawActor();
    const list = await a.getFeedbackMessages();
    return list.map((m: any) => ({ ...m, timestamp: Number(m.timestamp) }));
  },
  async addFeedbackMessage(m: any) {
    const a = await getRawActor();
    await a.addFeedbackMessage({ ...m, timestamp: BigInt(m.timestamp) });
  },
  async deleteFeedbackMessage(id: string) {
    const a = await getRawActor();
    await a.deleteFeedbackMessage(id);
  },

  async getNotifications() {
    const a = await getRawActor();
    const list = await a.getNotifications();
    return list.map((n: any) => ({ ...n, createdAt: Number(n.createdAt) }));
  },
  async addNotification(n: any) {
    const a = await getRawActor();
    await a.addNotification({ ...n, createdAt: BigInt(n.createdAt) });
  },
  async markNotificationRead(id: string) {
    const a = await getRawActor();
    await a.markNotificationRead(id);
  },
  async markAllNotificationsRead(userId: string) {
    const a = await getRawActor();
    await a.markAllNotificationsRead(userId);
  },

  async getReports() {
    const a = await getRawActor();
    const list = await a.getReports();
    return list.map((r: any) => ({
      ...r,
      submittedAt: Number(r.submittedAt),
      fileDataUrl: r.fileDataUrl === "" ? undefined : r.fileDataUrl,
      feedback: r.feedback === "" ? undefined : r.feedback,
    }));
  },
  async addReport(r: any) {
    const a = await getRawActor();
    await a.addReport({ ...r, submittedAt: BigInt(r.submittedAt) });
  },
  async updateReport(r: any) {
    const a = await getRawActor();
    await a.updateReport({ ...r, submittedAt: BigInt(r.submittedAt) });
  },
  async deleteReport(id: string) {
    const a = await getRawActor();
    await a.deleteReport(id);
  },
};
