import { Organization, OfficeLocation, Department, Designation } from '@/lib/graphql/organization/types';
import { StateCreator } from 'zustand';

export interface OrganizationSlice {
  organizations: Organization[];
  officeLocations: OfficeLocation[];
  departments: Department[];
  designations: Designation[];
  setOrganizations: (organizations: Organization[]) => void;
  setOfficeLocations: (locations: OfficeLocation[]) => void;
  setDepartments: (departments: Department[]) => void;
  setDesignations: (designations: Designation[]) => void;
}

export const createOrganizationSlice: StateCreator<OrganizationSlice> = (set) => ({
  organizations: [],
  officeLocations: [],
  departments: [],
  designations: [],
  setOrganizations: (organizations) => set({ organizations }),
  setOfficeLocations: (officeLocations) => set({ officeLocations }),
  setDepartments: (departments) => set({ departments }),
  setDesignations: (designations) => set({ designations }),
});
