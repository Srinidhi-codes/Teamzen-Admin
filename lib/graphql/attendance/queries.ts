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
  query AttendanceCorrections($status: String) {
    attendanceCorrections(status: $status) {
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
    }
  }
`;

