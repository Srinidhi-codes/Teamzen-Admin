import { gql } from "@apollo/client";

export const GET_ORGANIZATIONS = gql`
    query organizations($search: String, $plan: String, $isActive: Boolean) {
        organizations(search: $search, plan: $plan, isActive: $isActive) {
            id
            name
            logo{
                url
            }
            gstNumber
            employeeCount
            panNumber
            headquartersAddress
            isActive
            registrationNumber
            llmApiKey
            accent
            faceAttendanceEnabled
            plan
            planExpiresAt
            daysUntilPlanExpiry
            createdAt
            updatedAt
        }
    }
`

export const GET_ORGANIZATION = gql`
    query organization($id: ID!) {
        organization(id: $id) {
            id
            name
            logo {
                url
            }
            gstNumber
            employeeCount
            panNumber
            headquartersAddress
            isActive
            registrationNumber
            llmApiKey
            accent
            faceAttendanceEnabled
            createdAt
            updatedAt
        }
    }
`

export const GET_OFFICE_LOCATIONS = gql`
    query Officelocations($search: String, $organizationId: ID, $isActive: Boolean) {
        officeLocations(search: $search, organizationId: $organizationId, isActive: $isActive) {
            id
            name
            address
            city
            state
            country
            zipCode
            loginTime
            logoutTime
            latitude
            longitude
            geoRadiusMeters
            organizationId
            organization {
                id
                name
            }
            isActive
            createdAt
        }
    }
`
export const GET_DEPARTMENTS = gql`
    query departments($search: String, $organizationId: ID, $isActive: Boolean) {
        departments(search: $search, organizationId: $organizationId, isActive: $isActive) {
            id
            name
            organization {
                id
                name
            }
            description
            isActive
            createdAt
        }
    }
`

export const GET_DESIGNATIONS = gql`
    query designations($search: String, $organizationId: ID, $isActive: Boolean) {
        designations(search: $search, organizationId: $organizationId, isActive: $isActive) {
            id
            name
            organization {
                id
                name
            }
            description
            isActive
            createdAt
        }
    }
`
