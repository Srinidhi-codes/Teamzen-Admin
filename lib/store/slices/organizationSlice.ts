import { Organization } from '@/lib/graphql/organization/types';
import { StateCreator } from 'zustand';

// Placeholder types - extend as needed
export interface OrganizationSlice {
  organizations: Organization[];
  setOrganizations: (organizations: Organization[]) => void;
}

export const createOrganizationSlice: StateCreator<OrganizationSlice> = (set) => ({
  organizations: [],
  setOrganizations: (organizations: Organization[]) => set({ organizations }),
});
