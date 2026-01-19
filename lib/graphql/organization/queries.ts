import { gql } from "@apollo/client";

export const GET_ORGANIZATIONS = gql`
    query organizations {
        organizations {
            id
            name
            logo{
                url
            }
            gstNumber
            panNumber
            headquartersAddress
            isActive
            createdAt
            updatedAt
        }
    }
`

export const GET_OFFICE_LOCATIONS = gql`
    query Officelocations {
        officeLocations {
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
            isActive
            createdAt
        }
    }
`
export const GET_DEPARTMENTS = gql`
    query departments {
        departments {
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
    query designations {
        designations {
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
