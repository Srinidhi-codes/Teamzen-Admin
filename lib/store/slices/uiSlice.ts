import { StateCreator } from 'zustand';
import React from 'react';

export interface NavbarTab {
    id: string;
    label: string;
    icon?: string; // Store icon name as string for serialization if needed, or just ReactNode if handled carefully
    iconElement?: React.ReactNode;
    color?: string;
}

export interface UISlice {
    navbarTabs: NavbarTab[];
    activeNavbarTab: string;
    setNavbarTabs: (tabs: NavbarTab[]) => void;
    setActiveNavbarTab: (id: string) => void;
    clearNavbarTabs: () => void;
    sidebarCollapsed: boolean;
    sidebarMobileOpen: boolean;
    setSidebarCollapsed: (state: boolean) => void;
    setSidebarMobileOpen: (state: boolean) => void;
}

export const createUISlice: StateCreator<UISlice> = (set) => ({
    navbarTabs: [],
    activeNavbarTab: '',
    sidebarCollapsed: false,
    sidebarMobileOpen: false,
    setNavbarTabs: (navbarTabs) => set({ navbarTabs }),
    setActiveNavbarTab: (activeNavbarTab) => set({ activeNavbarTab }),
    clearNavbarTabs: () => set({ navbarTabs: [], activeNavbarTab: '' }),
    setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
    setSidebarMobileOpen: (sidebarMobileOpen) => set({ sidebarMobileOpen }),
});
