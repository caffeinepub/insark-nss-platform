import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type AvatarBlob = Uint8Array;
export type Time = bigint;
export type EventId = string;
export type VolunteerId = string;
export interface VolunteerReport {
    eventId: EventId;
    submissionTimestamp: Time;
    reportText: string;
    grade?: string;
    secureHash: ReportDocumentHash;
    images: Array<ReportImageBlob>;
}
export type ReportImageBlob = Uint8Array;
export type ReportDocumentHash = Uint8Array;
export type CoordinatorId = string;
export interface Coordinator {
    id: CoordinatorId;
    principal: Principal;
    grade: string;
    passwordHash: string;
    lastName: string;
    firstName: string;
}
export interface Volunteer {
    id: VolunteerId;
    principal: Principal;
    matricule: string;
    reports: Array<VolunteerReport>;
    passwordHash: string;
    registrationDate: string;
    lastName: string;
    avatar?: AvatarBlob;
    firstName: string;
}
export interface UserProfile {
    userType: Variant_admin_coordinator_volunteer;
    userId: string;
    name: string;
    email: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_admin_coordinator_volunteer {
    admin = "admin",
    coordinator = "coordinator",
    volunteer = "volunteer"
}
export interface backendInterface {
    addCoordinator(coordinator: Coordinator): Promise<void>;
    addVolunteer(volunteer: Volunteer): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteCoordinator(id: CoordinatorId): Promise<void>;
    deleteVolunteer(id: VolunteerId): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCoordinator(id: CoordinatorId): Promise<Coordinator>;
    getCoordinators(): Promise<Array<Coordinator>>;
    getMyCoordinatorProfile(): Promise<Coordinator | null>;
    getMyReports(): Promise<Array<VolunteerReport>>;
    getMyVolunteerProfile(): Promise<Volunteer | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVolunteer(id: VolunteerId): Promise<Volunteer>;
    getVolunteers(): Promise<Array<Volunteer>>;
    gradeVolunteerReport(coordinatorId: CoordinatorId, volunteerId: VolunteerId, eventId: EventId, grade: string): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitVolunteerReport(volunteerId: VolunteerId, eventId: EventId, reportText: string, images: Array<ReportImageBlob>, secureHash: ReportDocumentHash): Promise<void>;
}
