import Array "mo:core/Array";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Blob "mo:core/Blob";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Text "mo:core/Text";
import Timer "mo:core/Timer";
import Option "mo:core/Option";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  include MixinStorage();

  public type EventId = Text;
  public type VolunteerId = Text;
  public type CoordinatorId = Text;

  public type ReportDocumentHash = Blob;
  public type AvatarBlob = Storage.ExternalBlob;
  public type ReportImageBlob = Storage.ExternalBlob;

  public type Event = {
    id : EventId;
    timestamp : Time.Time;
    description : Text;
  };

  public type Volunteer = {
    id : VolunteerId;
    firstName : Text;
    lastName : Text;
    matricule : Text;
    registrationDate : Text;
    avatar : ?AvatarBlob;
    reports : [VolunteerReport];
    passwordHash : Text;
    principal : Principal;
  };

  public type VolunteerReport = {
    eventId : EventId;
    reportText : Text;
    images : [ReportImageBlob];
    secureHash : ReportDocumentHash;
    submissionTimestamp : Time.Time;
    grade : ?Text;
  };

  public type Coordinator = {
    id : CoordinatorId;
    firstName : Text;
    lastName : Text;
    grade : Text;
    passwordHash : Text;
    principal : Principal;
  };

  public type UserCredentials = {
    id : Text;
    passwordHash : Text;
  };

  public type UserProfile = {
    userId : Text;
    userType : { #admin; #coordinator; #volunteer };
    name : Text;
    email : Text;
  };

  module Volunteer {
    public func compare(volunteer1 : Volunteer, volunteer2 : Volunteer) : Order.Order {
      Text.compare(volunteer1.id, volunteer2.id);
    };
  };

  module Coordinator {
    public func compare(coordinator1 : Coordinator, coordinator2 : Coordinator) : Order.Order {
      Text.compare(coordinator1.id, coordinator2.id);
    };
  };

  let volunteerMap = Map.empty<VolunteerId, Volunteer>();
  let coordinatorMap = Map.empty<CoordinatorId, Coordinator>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let principalToVolunteerId = Map.empty<Principal, VolunteerId>();
  let principalToCoordinatorId = Map.empty<Principal, CoordinatorId>();

  let accessControlState = AccessControl.initState();

  include MixinAuthorization(accessControlState);

  // Helper function to check if caller is a coordinator
  private func isCoordinator(caller : Principal) : Bool {
    switch (principalToCoordinatorId.get(caller)) {
      case (null) { false };
      case (?_) { true };
    };
  };

  // Helper function to check if caller is a volunteer
  private func isVolunteer(caller : Principal) : Bool {
    switch (principalToVolunteerId.get(caller)) {
      case (null) { false };
      case (?_) { true };
    };
  };

  // Helper function to get volunteer ID for caller
  private func getVolunteerIdForCaller(caller : Principal) : ?VolunteerId {
    principalToVolunteerId.get(caller);
  };

  // Helper function to get coordinator ID for caller
  private func getCoordinatorIdForCaller(caller : Principal) : ?CoordinatorId {
    principalToCoordinatorId.get(caller);
  };

  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (caller.isAnonymous()) {
      return null;
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot view profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot save profiles");
    };
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Admin-only: Add volunteer
  public shared ({ caller }) func addVolunteer(volunteer : Volunteer) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add volunteers");
    };
    volunteerMap.add(volunteer.id, volunteer);
    principalToVolunteerId.add(volunteer.principal, volunteer.id);
    
    // Assign user role to volunteer principal
    AccessControl.assignRole(accessControlState, caller, volunteer.principal, #user);
  };

  // Admin-only: Get specific volunteer
  public query ({ caller }) func getVolunteer(id : VolunteerId) : async Volunteer {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all volunteer details");
    };
    switch (volunteerMap.get(id)) {
      case (null) { Runtime.trap("Volunteer not found") };
      case (?volunteer) { volunteer };
    };
  };

  // Admin-only: Get all volunteers
  public query ({ caller }) func getVolunteers() : async [Volunteer] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all volunteers");
    };
    volunteerMap.values().toArray().sort();
  };

  // Volunteer can submit their own report
  public shared ({ caller }) func submitVolunteerReport(volunteerId : VolunteerId, eventId : EventId, reportText : Text, images : [ReportImageBlob], secureHash : ReportDocumentHash) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit reports");
    };
    
    // Verify the caller is the volunteer submitting the report
    switch (getVolunteerIdForCaller(caller)) {
      case (null) { Runtime.trap("Unauthorized: Caller is not a registered volunteer") };
      case (?callerVolunteerId) {
        if (callerVolunteerId != volunteerId) {
          Runtime.trap("Unauthorized: Can only submit reports for yourself");
        };
      };
    };

    switch (volunteerMap.get(volunteerId)) {
      case (null) { Runtime.trap("Volunteer not found") };
      case (?volunteer) {
        let newReport : VolunteerReport = {
          eventId;
          reportText;
          images;
          secureHash;
          submissionTimestamp = Time.now();
          grade = null;
        };
        let newReports = volunteer.reports.concat([newReport]);
        let updatedVolunteer : Volunteer = {
          volunteer with
          reports = newReports;
        };
        volunteerMap.add(volunteerId, updatedVolunteer);
      };
    };
  };

  // Coordinators and admins can grade reports
  public shared ({ caller }) func gradeVolunteerReport(coordinatorId : CoordinatorId, volunteerId : VolunteerId, eventId : EventId, grade : Text) : async () {
    // Check if caller is admin or coordinator
    let isAuthorized = AccessControl.isAdmin(accessControlState, caller) or isCoordinator(caller);
    
    if (not isAuthorized) {
      Runtime.trap("Unauthorized: Only admins and coordinators can grade reports");
    };

    // If caller is a coordinator, verify they are the one specified
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      switch (getCoordinatorIdForCaller(caller)) {
        case (null) { Runtime.trap("Unauthorized: Caller is not a registered coordinator") };
        case (?callerCoordinatorId) {
          if (callerCoordinatorId != coordinatorId) {
            Runtime.trap("Unauthorized: Can only grade reports as yourself");
          };
        };
      };
    };

    switch (volunteerMap.get(volunteerId)) {
      case (null) { Runtime.trap("Volunteer not found") };
      case (?volunteer) {
        let updatedReports = volunteer.reports.map(
          func(report) {
            if (report.eventId == eventId) {
              {
                report with
                grade = ?grade;
              };
            } else {
              report;
            };
          }
        );
        let updatedVolunteer : Volunteer = {
          volunteer with
          reports = updatedReports;
        };
        volunteerMap.add(volunteerId, updatedVolunteer);
      };
    };
  };

  // Admin-only: Add coordinator
  public shared ({ caller }) func addCoordinator(coordinator : Coordinator) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add coordinators");
    };
    coordinatorMap.add(coordinator.id, coordinator);
    principalToCoordinatorId.add(coordinator.principal, coordinator.id);
    
    // Assign user role to coordinator principal
    AccessControl.assignRole(accessControlState, caller, coordinator.principal, #user);
  };

  // Admin-only: Get specific coordinator
  public query ({ caller }) func getCoordinator(id : CoordinatorId) : async Coordinator {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view coordinator details");
    };
    switch (coordinatorMap.get(id)) {
      case (null) { Runtime.trap("Coordinator not found") };
      case (?coordinator) { coordinator };
    };
  };

  // Admin-only: Get all coordinators
  public query ({ caller }) func getCoordinators() : async [Coordinator] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all coordinators");
    };
    coordinatorMap.values().toArray().sort();
  };

  // Volunteer can view their own reports
  public query ({ caller }) func getMyReports() : async [VolunteerReport] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view reports");
    };

    switch (getVolunteerIdForCaller(caller)) {
      case (null) { Runtime.trap("Unauthorized: Caller is not a registered volunteer") };
      case (?volunteerId) {
        switch (volunteerMap.get(volunteerId)) {
          case (null) { Runtime.trap("Volunteer not found") };
          case (?volunteer) { volunteer.reports };
        };
      };
    };
  };

  // Admin can delete volunteer
  public shared ({ caller }) func deleteVolunteer(id : VolunteerId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete volunteers");
    };
    
    switch (volunteerMap.get(id)) {
      case (null) { Runtime.trap("Volunteer not found") };
      case (?volunteer) {
        principalToVolunteerId.remove(volunteer.principal);
        volunteerMap.remove(id);
      };
    };
  };

  // Admin can delete coordinator
  public shared ({ caller }) func deleteCoordinator(id : CoordinatorId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete coordinators");
    };
    
    switch (coordinatorMap.get(id)) {
      case (null) { Runtime.trap("Coordinator not found") };
      case (?coordinator) {
        principalToCoordinatorId.remove(coordinator.principal);
        coordinatorMap.remove(id);
      };
    };
  };

  // Volunteer can view their own profile
  public query ({ caller }) func getMyVolunteerProfile() : async ?Volunteer {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };

    switch (getVolunteerIdForCaller(caller)) {
      case (null) { null };
      case (?volunteerId) { volunteerMap.get(volunteerId) };
    };
  };

  // Coordinator can view their own profile
  public query ({ caller }) func getMyCoordinatorProfile() : async ?Coordinator {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };

    switch (getCoordinatorIdForCaller(caller)) {
      case (null) { null };
      case (?coordinatorId) { coordinatorMap.get(coordinatorId) };
    };
  };
};
