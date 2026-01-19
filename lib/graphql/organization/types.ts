export interface Organization {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
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

export interface OfficeLocationResponse {
    officeLocations: OfficeLocation;
}

export interface DepartmentResponse {
    departments: Department;
}

export interface DesignationResponse {
    designations: Designation;
}

export interface OrganizationResponse {
    organizations: Organization[];
}