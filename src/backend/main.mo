import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  // ─── Legacy types (kept for upgrade compatibility with old stable vars) ───

  type _OldUserRole = { #admin; #user; #guest };

  type _OldVolunteerReport = {
    eventId : Text;
    reportText : Text;
    images : [Blob];
    secureHash : Blob;
    submissionTimestamp : Int;
    grade : ?Text;
  };

  type _OldVolunteer = {
    id : Text;
    firstName : Text;
    lastName : Text;
    matricule : Text;
    registrationDate : Text;
    avatar : ?Blob;
    reports : [_OldVolunteerReport];
    passwordHash : Text;
    principal : Principal;
  };

  type _OldCoordinator = {
    id : Text;
    firstName : Text;
    lastName : Text;
    grade : Text;
    passwordHash : Text;
    principal : Principal;
  };

  type _OldUserProfile = {
    userId : Text;
    userType : { #admin; #coordinator; #volunteer };
    name : Text;
    email : Text;
  };

  type _OldAccessControlState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, _OldUserRole>;
  };

  // ─── Legacy stable vars (preserved to avoid M0169 upgrade errors) ───

  let volunteerMap = Map.empty<Text, _OldVolunteer>();
  let coordinatorMap = Map.empty<Text, _OldCoordinator>();
  let userProfiles = Map.empty<Principal, _OldUserProfile>();
  let principalToVolunteerId = Map.empty<Principal, Text>();
  let principalToCoordinatorId = Map.empty<Principal, Text>();
  let accessControlState : _OldAccessControlState = {
    var adminAssigned = false;
    userRoles = Map.empty<Principal, _OldUserRole>();
  };

  // ─── New types ────────────────────────────────────────────────────────

  public type Volunteer = {
    id : Text;
    firstName : Text;
    lastName : Text;
    email : Text;
    matricule : Text;
    branch : Text;
    passwordHash : Text;
    profilePicture : Text;
  };

  public type Coordinator = {
    id : Text;
    firstName : Text;
    lastName : Text;
    email : Text;
    passwordHash : Text;
    grade : Text;
    profilePicture : Text;
  };

  public type Event = {
    id : Text;
    name : Text;
    date : Text;
    eventType : Text;
    description : Text;
  };

  public type AttendanceRecord = {
    volunteerId : Text;
    totalAttendance : Nat;
    lastSaved : Int;
  };

  public type ActivityPointsRecord = {
    volunteerId : Text;
    storedPoints : Nat;
    lastSaved : Int;
  };

  public type GalleryPhoto = {
    id : Text;
    eventId : Text;
    title : Text;
    imageDataUrl : Text;
    uploadedAt : Int;
  };

  public type Certificate = {
    id : Text;
    eventId : Text;
    title : Text;
    fileDataUrl : Text;
    uploadedAt : Int;
    volunteerId : Text;
  };

  public type CommunityMessage = {
    id : Text;
    fromId : Text;
    fromName : Text;
    fromRole : Text;
    content : Text;
    timestamp : Int;
  };

  public type FeedbackMessage = {
    id : Text;
    fromId : Text;
    fromRole : Text;
    toId : Text;
    toRole : Text;
    content : Text;
    timestamp : Int;
  };

  public type Notification = {
    id : Text;
    userId : Text;
    userRole : Text;
    message : Text;
    isRead : Bool;
    createdAt : Int;
  };

  public type Report = {
    id : Text;
    volunteerId : Text;
    volunteerName : Text;
    eventName : Text;
    title : Text;
    description : Text;
    fileDataUrl : Text;
    status : Text;
    feedback : Text;
    submittedAt : Int;
  };

  // ─── New stable storage ───────────────────────────────────────────────────

  var adminPasswordHash : Text = "Indran#12345";

  let volunteers = Map.empty<Text, Volunteer>();
  let coordinators = Map.empty<Text, Coordinator>();
  let events = Map.empty<Text, Event>();
  let attendanceMap = Map.empty<Text, AttendanceRecord>();
  let activityPointsMap = Map.empty<Text, ActivityPointsRecord>();
  let galleryMap = Map.empty<Text, GalleryPhoto>();
  let certificatesMap = Map.empty<Text, Certificate>();
  let communityMessagesMap = Map.empty<Text, CommunityMessage>();
  let feedbackMessagesMap = Map.empty<Text, FeedbackMessage>();
  let notificationsMap = Map.empty<Text, Notification>();
  let reportsMap = Map.empty<Text, Report>();

  // ─── Admin ────────────────────────────────────────────────────────────────

  public query func getAdminPasswordHash() : async Text {
    adminPasswordHash
  };

  public shared func setAdminPasswordHash(hash : Text) : async () {
    adminPasswordHash := hash;
  };

  // ─── Volunteers ───────────────────────────────────────────────────────────

  public query func getVolunteers() : async [Volunteer] {
    volunteers.values().toArray()
  };

  public shared func addVolunteer(v : Volunteer) : async () {
    volunteers.add(v.id, v);
  };

  public shared func updateVolunteer(v : Volunteer) : async () {
    volunteers.add(v.id, v);
  };

  public shared func deleteVolunteer(id : Text) : async () {
    volunteers.remove(id);
  };

  // ─── Coordinators ─────────────────────────────────────────────────────────

  public query func getCoordinators() : async [Coordinator] {
    coordinators.values().toArray()
  };

  public shared func addCoordinator(c : Coordinator) : async () {
    coordinators.add(c.id, c);
  };

  public shared func updateCoordinator(c : Coordinator) : async () {
    coordinators.add(c.id, c);
  };

  public shared func deleteCoordinator(id : Text) : async () {
    coordinators.remove(id);
  };

  // ─── Events ──────────────────────────────────────────────────────────────

  public query func getEvents() : async [Event] {
    events.values().toArray()
  };

  public shared func addEvent(e : Event) : async () {
    events.add(e.id, e);
  };

  public shared func updateEvent(e : Event) : async () {
    events.add(e.id, e);
  };

  public shared func deleteEvent(id : Text) : async () {
    events.remove(id);
  };

  // ─── Attendance ───────────────────────────────────────────────────────────

  public query func getAttendanceRecords() : async [AttendanceRecord] {
    attendanceMap.values().toArray()
  };

  public shared func saveAttendanceRecord(r : AttendanceRecord) : async () {
    attendanceMap.add(r.volunteerId, r);
  };

  public shared func adjustAttendance(volunteerId : Text, delta : Int) : async () {
    switch (attendanceMap.get(volunteerId)) {
      case (?rec) {
        let newTotal : Int = rec.totalAttendance + delta;
        let clamped : Nat = if (newTotal < 0) 0 else (newTotal).toNat();
        attendanceMap.add(volunteerId, { rec with totalAttendance = clamped; lastSaved = Time.now() });
      };
      case null {
        if (delta > 0) {
          attendanceMap.add(volunteerId, {
            volunteerId;
            totalAttendance = (delta).toNat();
            lastSaved = Time.now();
          });
        };
      };
    };
  };

  // ─── Activity Points ──────────────────────────────────────────────────────

  public query func getActivityPointsRecords() : async [ActivityPointsRecord] {
    activityPointsMap.values().toArray()
  };

  public shared func saveActivityPointsRecord(r : ActivityPointsRecord) : async () {
    activityPointsMap.add(r.volunteerId, r);
  };

  public shared func adjustActivityPoints(volunteerId : Text, delta : Int) : async () {
    switch (activityPointsMap.get(volunteerId)) {
      case (?rec) {
        let newTotal : Int = rec.storedPoints + delta;
        let clamped : Nat = if (newTotal < 0) 0 else (newTotal).toNat();
        activityPointsMap.add(volunteerId, { rec with storedPoints = clamped; lastSaved = Time.now() });
      };
      case null {
        if (delta > 0) {
          activityPointsMap.add(volunteerId, {
            volunteerId;
            storedPoints = (delta).toNat();
            lastSaved = Time.now();
          });
        };
      };
    };
  };

  // ─── Gallery ──────────────────────────────────────────────────────────────

  public query func getGalleryPhotos() : async [GalleryPhoto] {
    galleryMap.values().toArray()
  };

  public shared func addGalleryPhoto(p : GalleryPhoto) : async () {
    galleryMap.add(p.id, p);
  };

  public shared func deleteGalleryPhoto(id : Text) : async () {
    galleryMap.remove(id);
  };

  // ─── Certificates ─────────────────────────────────────────────────────────

  public query func getCertificates() : async [Certificate] {
    certificatesMap.values().toArray()
  };

  public shared func addCertificate(c : Certificate) : async () {
    certificatesMap.add(c.id, c);
  };

  public shared func deleteCertificate(id : Text) : async () {
    certificatesMap.remove(id);
  };

  // ─── Community Messages ───────────────────────────────────────────────────

  public query func getCommunityMessages() : async [CommunityMessage] {
    communityMessagesMap.values().toArray()
  };

  public shared func addCommunityMessage(m : CommunityMessage) : async () {
    communityMessagesMap.add(m.id, m);
  };

  public shared func deleteCommunityMessage(id : Text) : async () {
    communityMessagesMap.remove(id);
  };

  // ─── Feedback Messages ────────────────────────────────────────────────────

  public query func getFeedbackMessages() : async [FeedbackMessage] {
    feedbackMessagesMap.values().toArray()
  };

  public shared func addFeedbackMessage(m : FeedbackMessage) : async () {
    feedbackMessagesMap.add(m.id, m);
  };

  public shared func deleteFeedbackMessage(id : Text) : async () {
    feedbackMessagesMap.remove(id);
  };

  // ─── Notifications ────────────────────────────────────────────────────────

  public query func getNotifications() : async [Notification] {
    notificationsMap.values().toArray()
  };

  public shared func addNotification(n : Notification) : async () {
    notificationsMap.add(n.id, n);
  };

  public shared func markNotificationRead(id : Text) : async () {
    switch (notificationsMap.get(id)) {
      case (?n) { notificationsMap.add(id, { n with isRead = true }) };
      case null {};
    };
  };

  public shared func markAllNotificationsRead(userId : Text) : async () {
    for ((id, n) in notificationsMap.entries()) {
      if (n.userId == userId) {
        notificationsMap.add(id, { n with isRead = true });
      };
    };
  };

  // ─── Reports ──────────────────────────────────────────────────────────────

  public query func getReports() : async [Report] {
    reportsMap.values().toArray()
  };

  public shared func addReport(r : Report) : async () {
    reportsMap.add(r.id, r);
  };

  public shared func updateReport(r : Report) : async () {
    reportsMap.add(r.id, r);
  };

  public shared func deleteReport(id : Text) : async () {
    reportsMap.remove(id);
  };
};
