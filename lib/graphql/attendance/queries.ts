import { gql } from "@apollo/client";

export const GET_ATTENDANCE = gql`  
    query MyAttendance($input: AttendanceInput) {
    myAttendance(input: $input) {
    id
    attendanceDate
    loginTime
    logoutTime
    loginDistance
    logoutDistance
    isVerified
    workedHours
    status
    correctionStatus
    correctionId
    correctionReason
    approvalComment
  }
}
`;

export const GET_ATTENDANCE_CORRECTIONS = gql`
    query AttendanceCorrections($page: Int
    $pageSize: Int
    $filters: AttendanceCorrectionFilterInput
    $sort: AttendanceCorrectionSortInput
    $input: AttendanceInput) {
    attendanceCorrections(page: $page, pageSize: $pageSize, filters: $filters, sort: $sort, input: $input) {
      results {
        id
        attendanceRecord {
          attendanceDate
          loginTime
          logoutTime
          actualLoginTime
          actualLogoutTime
          loginDistance
          logoutDistance
          isVerified
          workedHours
          status
          faceVerified
          faceMatchScore
          checkInSelfieUrl
          checkOutSelfieUrl
          correctionStatus
          correctionId
          correctionReason
          approvalComment
          loginLatitude
          loginLongitude
          logoutLatitude
          logoutLongitude
          effectiveWorkedHours
          totalHeartbeats
          validHeartbeats
          outOfFenceHeartbeats
          roamingAnomalyDetected
          roamingNotes
          heartbeats {
            id
            timestamp
            latitude
            longitude
            distanceMeters
            isWithinGeofence
            accuracyMeters
            isMocked
            batteryLevel
          }
          officeLocation {
            id
            name
            latitude
            longitude
            geoRadiusMeters
          }
        }
        correctedLoginTime
        correctedLogoutTime
        status
        reason
        approvalComments
        requestedBy {
          id
          firstName
          lastName
          designation {
            id
            name
          }
        }
      }
      total
      page
      pageSize
    }
}
`;

export const GET_ORG_ATTENDANCE_RECORDS = gql`
  query OrgAttendanceRecords(
    $page: Int
    $pageSize: Int
    $filters: OrgAttendanceFilterInput
  ) {
    orgAttendanceRecords(
      page: $page
      pageSize: $pageSize
      filters: $filters
    ) {
      results {
        id
        attendanceDate
        loginTime
        logoutTime
        actualLoginTime
        actualLogoutTime
        loginDistance
        logoutDistance
        isVerified
        workedHours
        effectiveWorkedHours
        totalHeartbeats
        validHeartbeats
        outOfFenceHeartbeats
        roamingAnomalyDetected
        roamingNotes
        status
        faceVerified
        faceMatchScore
        checkInSelfieUrl
        checkOutSelfieUrl
        loginLatitude
        loginLongitude
        logoutLatitude
        logoutLongitude
        user {
          id
          firstName
          lastName
          email
          designation {
            id
            name
          }
        }
        officeLocation {
          id
          name
          latitude
          longitude
          geoRadiusMeters
        }
        isWeekendWork
        isOffHours
        approvalStatus
        approvalRemarks
        approvedBy {
          id
          firstName
          lastName
        }
        heartbeats {
          id
          timestamp
          latitude
          longitude
          distanceMeters
          isWithinGeofence
          accuracyMeters
          isMocked
          batteryLevel
        }
      }
      total
      page
      pageSize
    }
  }
`;

export const APPROVE_OR_REJECT_OFF_HOURS_ATTENDANCE = gql`
  mutation ApproveOrRejectOffHoursAttendance($input: ApproveOffHoursAttendanceInput!) {
    approveOrRejectOffHoursAttendance(input: $input) {
      success
      message
      record {
        id
        status
        approvalStatus
        approvalRemarks
      }
    }
  }
`;

