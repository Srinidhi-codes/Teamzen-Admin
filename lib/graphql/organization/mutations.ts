import { gql } from "@apollo/client";

export const CREATE_ORGANIZATION = gql`
    mutation CreateOrganization($input: CreateOrganizationInput!) {
        createOrganization(input: $input) {
            id
            name
            gstNumber
            panNumber
            headquartersAddress
            isActive
            createdAt
            updatedAt
        }
    }
`;

export const UPDATE_ORGANIZATION = gql`
    mutation UpdateOrganization($input: OrganizationInput!) {
        updateOrganization(input: $input) {
            id
            name
            gstNumber
            panNumber
            headquartersAddress
            isActive
            createdAt
            updatedAt
        }
    }
`;

export const SUSPEND_ORGANIZATION = gql`
    mutation SuspendOrganization($organizationId: ID!) {
        suspendOrganization(organizationId: $organizationId){
            id
            name
            isActive
        }
    }
`;

export const ACTIVATE_ORGANIZATION = gql`
    mutation ActivateOrganization($organizationId: ID!) {
        activateOrganization(organizationId: $organizationId){
            id
            name
            isActive
        }
    }
`;

export const CREATE_OFFICE_LOCATION = gql`
    mutation CreateOfficeLocation($input: CreateOfficeLocationInput!) {
        createOfficeLocation(input: $input) {
            id
            name
            address
            city
            state
            zipCode
            latitude
            longitude
            loginTime
            logoutTime
            isActive
            organizationId
        }
    }
`;

export const UPDATE_OFFICE_LOCATION = gql`
    mutation UpdateOfficeLocation($input: UpdateOfficeLocationInput!) {
        updateOfficeLocation(input: $input) {
            id
            name
            address
            city
            state
            zipCode
            latitude
            longitude
            loginTime
            logoutTime
            isActive
        }
    }
`;

export const SUSPEND_OFFICE_LOCATION = gql`
    mutation SuspendOfficeLocation($officeLocationId: ID!) {
        suspendOfficeLocation(officeLocationId: $officeLocationId){
            id
            name
            isActive
        }
    }
`;

export const ACTIVATE_OFFICE_LOCATION = gql`
    mutation ActivateOfficeLocation($officeLocationId: ID!) {
        activateOfficeLocation(officeLocationId: $officeLocationId){
            id
            name
            isActive
        }
    }
`;

export const CREATE_DEPARTMENT = gql`
    mutation CreateDepartment($input: CreateDepartmentInput!) {
        createDepartment(input: $input) {
            id
            name
            description
            isActive
        }
    }
`;

export const UPDATE_DEPARTMENT = gql`
    mutation UpdateDepartment($input: UpdateDepartmentInput!) {
        updateDepartment(input: $input) {
            id
            name
            description
            isActive
        }
    }
`;

export const SUSPEND_DEPARTMENT = gql`
    mutation SuspendDepartment($departmentId: ID!) {
        suspendDepartment(departmentId: $departmentId){
            id
            name
            isActive
        }
    }
`;

export const ACTIVATE_DEPARTMENT = gql`
    mutation ActivateDepartment($departmentId: ID!) {
        activateDepartment(departmentId: $departmentId){
            id
            name
            isActive
        }
    }
`;

export const CREATE_DESIGNATION = gql`
    mutation CreateDesignation($input: CreateDesignationInput!) {
        createDesignation(input: $input) {
            id
            name
            organization {
                id
            }
            description
            isActive
        }
    }
`;

export const UPDATE_DESIGNATION = gql`
    mutation UpdateDesignation($input: UpdateDesignationInput!) {
        updateDesignation(input: $input) {
            id
            name
            organization {
                id
            }
            description
            isActive
        }
    }
`;

export const SUSPEND_DESIGNATION = gql`
    mutation SuspendDesignation($designationId: ID!) {
        suspendDesignation(designationId: $designationId){
            id
            name
            isActive
        }
    }
`;

export const ACTIVATE_DESIGNATION = gql`
    mutation ActivateDesignation($designationId: ID!) {
        activateDesignation(designationId: $designationId){
            id
            name
            isActive
        }
    }
`;
