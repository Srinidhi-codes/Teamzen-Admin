export interface Organization {
    id: string;
    name: string;
    logo?: {
        url: string;
    };
    gstNumber?: string;
    panNumber?: string;
    headquartersAddress?: string;
    isActive: boolean;
    registrationNumber: string;
    employeeCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface OfficeLocation {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    loginTime: string;
    logoutTime: string;
    latitude: number;
    longitude: number;
    geoRadiusMeters: number;
    isActive: boolean;
    createdAt: string;
}

export interface Department {
    id: string;
    name: string;
    organization: Organization;
    description: string;
    isActive: boolean;
    createdAt: string;
}

export interface Designation {
    id: string;
    name: string;
    organization: Organization;
    description: string;
    isActive: boolean;
    createdAt: string;
}

export interface CreateOrganizationInput {
    name: string;
    logo: string;
    gstNumber: string;
    panNumber: string;
    registrationNumber: string;
    headquartersAddress: string;
    isActive: boolean;
}

export interface OrganizationInput {
    name: string;
    logo: string;
    gstNumber: string;
    panNumber: string;
    registrationNumber: string;
    headquartersAddress: string;
    isActive: boolean;
    id: string;
}

export interface CreateOfficeLocationInput {
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    loginTime: string;
    logoutTime: string;
    latitude: string;
    longitude: string;
    geoRadiusMeters: number;
    isActive: boolean;
}

export interface UpdateOfficeLocationInput {
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    loginTime: string;
    logoutTime: string;
    latitude: string;
    longitude: string;
    geoRadiusMeters: number;
    isActive: boolean;
    id: string;
    organizationId: string;
}

export interface CreateDepartmentInput {
    name: string;
    description: string;
    organizationId: string;
    isActive: boolean;
}

export interface DepartmentInput {
    name: string;
    description: string;
    isActive: boolean;
    organizationId: string;
    id: string;
}

export interface CreateDesignationInput {
    name: string;
    description: string;
    organizationId: string;
    isActive: boolean;
}

export interface DesignationInput {
    name: string;
    description: string;
    organizationId: string;
    isActive: boolean;
    id: string;
}

export interface OfficeLocationResponse {
    officeLocations: OfficeLocation[];
}

export interface DepartmentResponse {
    departments: Department[];
}

export interface DesignationResponse {
    designations: Designation[];
}

export interface OrganizationResponse {
    organizations: Organization[];
}