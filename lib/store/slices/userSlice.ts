import { StateCreator } from 'zustand';
import { User } from '@/lib/graphql/users/types';
import { mapBackendUserToFrontendUser, normalizeAccent } from '@/lib/transformers';

export interface UserSlice {
  user: User | null;
  isAuthenticated: boolean;
  // Actions
  loginUser: (backendData: any) => void;
  setAuthenticatedUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  logoutUser: () => void;
}

export const createUserSlice: StateCreator<UserSlice, [], [], UserSlice> = (set) => ({
  user: null,
  isAuthenticated: false,
  loginUser: (backendData: any) => {
    const formattedUser = mapBackendUserToFrontendUser(backendData);
    const accent = normalizeAccent(formattedUser.organization?.accent);
    // accent lives on ThemeSlice; store is composed so this is safe at runtime
    set({
      user: formattedUser,
      isAuthenticated: true,
      accent,
    } as Partial<UserSlice> as UserSlice);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-accent", accent);
    }
  },
  setAuthenticatedUser: (user: User) => {
    const accent = normalizeAccent(user.organization?.accent);
    set({
      user,
      isAuthenticated: true,
      ...(user.organization?.accent ? { accent } : {}),
    } as Partial<UserSlice> as UserSlice);
    if (user.organization?.accent && typeof document !== "undefined") {
      document.documentElement.setAttribute("data-accent", accent);
    }
  },
  updateUser: (updates) =>
    set((state) => {
      const nextUser = state.user
        ? {
            ...state.user,
            ...updates,
            organization: updates.organization
              ? { ...state.user.organization, ...updates.organization }
              : state.user.organization,
          }
        : null;
      const orgAccent = updates.organization?.accent;
      if (orgAccent && typeof document !== "undefined") {
        document.documentElement.setAttribute(
          "data-accent",
          normalizeAccent(orgAccent)
        );
      }
      return {
        user: nextUser,
        ...(orgAccent ? { accent: normalizeAccent(orgAccent) } : {}),
      } as Partial<UserSlice> as UserSlice;
    }),
  logoutUser: () => set({ user: null, isAuthenticated: false }),
});
