import { gql } from "@apollo/client";

export const GET_ORGANIZATIONS = gql`
    query organizations($search: String) {
        organizations(search: $search) {
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
            createdAt
            updatedAt
        }
    }
`

export const GET_OFFICE_LOCATIONS = gql`
    query Officelocations($search: String) {
        officeLocations(search: $search) {
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
            isActive
            createdAt
        }
    }
`
export const GET_DEPARTMENTS = gql`
    query departments($search: String) {
        departments(search: $search) {
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
    query designations($search: String) {
        designations(search: $search) {
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
