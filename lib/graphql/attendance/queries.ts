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
          correctionStatus
          correctionId
          correctionReason
          approvalComment
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

