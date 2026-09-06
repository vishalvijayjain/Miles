import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  Profile,
  Ticket,
  TicketStatus,
  DashboardStats,
  FilterState,
  SortOption,
  ToastMessage,
  UserSettings,
  DeletedTicketArchive,
  AppTab,
} from '../types';
import { defaultStorageAdapter } from '../storage/LocalStorageAdapter';
import { ProfileRepository } from '../repositories/ProfileRepository';
import { TicketRepository } from '../repositories/TicketRepository';
import { SettingsRepository } from '../repositories/SettingsRepository';
import { ProfileService } from '../services/ProfileService';
import { TicketService } from '../services/TicketService';
import { SettingsService } from '../services/SettingsService';
import { getDemoTickets } from '../utils/demoData';

interface AppContextType {
  // Profiles
  profiles: Profile[];
  activeProfile: Profile | null;
  createProfile: (name: string) => Promise<Profile>;
  updateProfile: (id: string, name: string) => Promise<Profile>;
  deleteProfile: (id: string) => Promise<void>;
  switchProfile: (id: string) => Promise<void>;

  // Tickets
  tickets: Ticket[];
  filteredTickets: Ticket[];
  stats: DashboardStats;
  createTicket: (data: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'closedAt' | 'ticketNumber' | 'profileId' | 'deletedAt'>) => Promise<Ticket>;
  updateTicket: (id: string, updates: Partial<Omit<Ticket, 'id' | 'profileId' | 'createdAt'>>) => Promise<Ticket>;
  deleteTicket: (id: string) => Promise<void>;
  moveTicketStatus: (id: string, newStatus: TicketStatus) => Promise<void>;

  // Relationships
  childrenCountMap: Record<string, number>;
  getChildrenOfTicket: (parentId: string) => Ticket[];
  getParentOfTicket: (childTicketOrId: Ticket | string) => Ticket | null;
  openCreateChildTicket: (parentTicket: Ticket) => void;
  presetParentTicketId: string | null;
  setPresetParentTicketId: (id: string | null) => void;

  // Trash & 60-day Retention
  trashTickets: DeletedTicketArchive[];
  loadTrashTickets: () => Promise<void>;
  restoreTicket: (id: string) => Promise<Ticket>;
  permanentlyDeleteTicket: (id: string) => Promise<void>;
  emptyTrash: () => Promise<void>;
  isTrashModalOpen: boolean;
  setIsTrashModalOpen: (open: boolean) => void;

  // Filter & Sort
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  sort: SortOption;
  setSort: React.Dispatch<React.SetStateAction<SortOption>>;

  // Views & UI
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  celebrateProgress: () => void;
  lastCelebratedAt: number;

  // Modals & Interactivity
  isCreateTicketModalOpen: boolean;
  setIsCreateTicketModalOpen: (open: boolean) => void;
  selectedTicket: Ticket | null;
  setSelectedTicket: (ticket: Ticket | null) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;

  // Demo & Reset
  loadDemoData: () => Promise<void>;
  clearAllTickets: () => Promise<void>;

  // Feedback
  toasts: ToastMessage[];
  showToast: (type: ToastMessage['type'], title: string, message?: string) => void;
  dismissToast: (id: string) => void;
  isLoading: boolean;
}

const defaultFilters: FilterState = {
  search: '',
  status: 'ALL',
  priority: 'ALL',
  type: 'ALL',
  onlyBlocked: false,
  onlyOverdue: false,
  onlyExtended: false,
};

const defaultSort: SortOption = {
  field: 'priority',
  direction: 'desc',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Instantiate repository and service singletons
const profileRepo = new ProfileRepository(defaultStorageAdapter);
const ticketRepo = new TicketRepository(defaultStorageAdapter);
const settingsRepo = new SettingsRepository(defaultStorageAdapter);

const profileService = new ProfileService(profileRepo, ticketRepo);
const ticketService = new TicketService(ticketRepo);
const settingsService = new SettingsService(settingsRepo);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<AppTab>('kanban');
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sort, setSort] = useState<SortOption>(defaultSort);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastCelebratedAt, setLastCelebratedAt] = useState<number>(0);

  const celebrateProgress = useCallback(() => {
    setLastCelebratedAt(Date.now());
  }, []);

  // Modals
  const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isTrashModalOpen, setIsTrashModalOpen] = useState<boolean>(false);
  const [presetParentTicketId, setPresetParentTicketId] = useState<string | null>(null);
  const [trashTickets, setTrashTickets] = useState<DeletedTicketArchive[]>([]);

  // Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((type: ToastMessage['type'], title: string, message?: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Load trash tickets for active profile & purge expired (>60 days)
  const loadTrashTickets = useCallback(async () => {
    if (!activeProfile) return;
    try {
      await ticketService.purgeExpired(activeProfile.id);
      const archives = await ticketService.getDeletedTickets(activeProfile.id);
      setTrashTickets(archives);
    } catch (err: any) {
      console.error('Failed to load trash:', err);
    }
  }, [activeProfile]);

  // Initialize theme on HTML document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Load initial profiles & settings
  useEffect(() => {
    let isMounted = true;
    async function initApp() {
      try {
        setIsLoading(true);
        const loadedProfiles = await profileService.getProfiles();
        if (!isMounted) return;
        setProfiles(loadedProfiles);

        // Determine active profile
        const savedActiveId = await settingsService.getActiveProfileId();
        let current = loadedProfiles.find((p) => p.id === savedActiveId);
        if (!current && loadedProfiles.length > 0) {
          current = loadedProfiles[0];
          await settingsService.setActiveProfileId(current.id);
        }
        setActiveProfile(current || null);

        if (current) {
          // Load settings for profile
          const userSettings = await settingsService.getSettings(current.id);
          if (userSettings.theme) {
            setTheme(userSettings.theme);
          }
          if (userSettings.defaultView) {
            setActiveTab(userSettings.defaultView);
          }

          // Purge >60 day expired items from trash & load tickets
          await ticketService.purgeExpired(current.id);
          const profileTickets = await ticketService.getTicketsForProfile(current.id);
          const profileTrash = await ticketService.getDeletedTickets(current.id);
          if (isMounted) {
            setTickets(profileTickets);
            setTrashTickets(profileTrash);
          }
        }
      } catch (err: any) {
        console.error('Initialization error:', err);
        showToast('error', 'Initialization Error', err.message || 'Failed to load workspaces.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initApp();
    return () => {
      isMounted = false;
    };
  }, [showToast]);

  // Load tickets whenever activeProfile changes
  const loadTicketsForProfile = useCallback(async (profileId: string) => {
    try {
      await ticketService.purgeExpired(profileId);
      const list = await ticketService.getTicketsForProfile(profileId);
      const trash = await ticketService.getDeletedTickets(profileId);
      setTickets(list);
      setTrashTickets(trash);
    } catch (err: any) {
      showToast('error', 'Failed to load tickets', err.message);
    }
  }, [showToast]);

  // Switch profile
  const switchProfile = useCallback(async (profileId: string) => {
    const target = profiles.find((p) => p.id === profileId);
    if (!target) return;

    setActiveProfile(target);
    await settingsService.setActiveProfileId(profileId);
    setFilters(defaultFilters); // Reset filters on profile switch to prevent hiding valid tickets
    await loadTicketsForProfile(profileId);
    showToast('info', `Switched to ${target.name}`, 'Workspace context updated.');
  }, [profiles, loadTicketsForProfile, showToast]);

  // Create Profile
  const createProfile = useCallback(async (name: string): Promise<Profile> => {
    try {
      const newProfile = await profileService.createProfile(name);
      setProfiles((prev) => [...prev, newProfile]);
      await switchProfile(newProfile.id);
      showToast('success', 'Profile Created', `Workspace "${newProfile.name}" is now active.`);
      return newProfile;
    } catch (err: any) {
      showToast('error', 'Could not create profile', err.message);
      throw err;
    }
  }, [switchProfile, showToast]);

  // Update Profile
  const updateProfile = useCallback(async (id: string, name: string): Promise<Profile> => {
    try {
      const updated = await profileService.updateProfile(id, name);
      setProfiles((prev) => prev.map((p) => (p.id === id ? updated : p)));
      if (activeProfile?.id === id) {
        setActiveProfile(updated);
      }
      showToast('success', 'Profile Updated', `Workspace renamed to "${updated.name}".`);
      return updated;
    } catch (err: any) {
      showToast('error', 'Could not update profile', err.message);
      throw err;
    }
  }, [activeProfile?.id, showToast]);

  // Delete Profile
  const deleteProfile = useCallback(async (id: string): Promise<void> => {
    try {
      const remainingProfile = await profileService.deleteProfile(id);
      setProfiles((prev) => prev.filter((p) => p.id !== id));
      if (activeProfile?.id === id) {
        await switchProfile(remainingProfile.id);
      }
      showToast('success', 'Profile Deleted', 'Workspace and its tickets were removed.');
    } catch (err: any) {
      showToast('error', 'Could not delete profile', err.message);
      throw err;
    }
  }, [activeProfile?.id, switchProfile, showToast]);

  // Create Ticket
  const createTicket = useCallback(
    async (
      data: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'closedAt' | 'ticketNumber' | 'profileId' | 'deletedAt'>
    ): Promise<Ticket> => {
      if (!activeProfile) {
        throw new Error('No active profile selected.');
      }
      try {
        const created = await ticketService.createTicket({
          ...data,
          profileId: activeProfile.id,
        });

        // Add to state immediately
        setTickets((prev) => [...prev, created]);
        showToast('success', `Created ${created.ticketNumber}`, created.title);
        return created;
      } catch (err: any) {
        showToast('error', 'Failed to create ticket', err.message);
        throw err;
      }
    },
    [activeProfile, showToast]
  );

  // Update Ticket
  const updateTicket = useCallback(
    async (
      id: string,
      updates: Partial<Omit<Ticket, 'id' | 'profileId' | 'createdAt'>>
    ): Promise<Ticket> => {
      if (!activeProfile) {
        throw new Error('No active profile selected.');
      }

      const previousTickets = [...tickets];
      // Optimistic update
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
      );

      try {
        const updated = await ticketService.updateTicket(id, activeProfile.id, updates);
        // Replace with server/canonical result
        setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
        if (selectedTicket?.id === id) {
          setSelectedTicket(updated);
        }
        showToast('success', `Updated ${updated.ticketNumber}`);
        return updated;
      } catch (err: any) {
        // Rollback on failure
        setTickets(previousTickets);
        showToast('error', 'Update Failed', err.message);
        throw err;
      }
    },
    [activeProfile, tickets, selectedTicket?.id, showToast]
  );

  // Move Ticket Status (Kanban drag/drop or select)
  const moveTicketStatus = useCallback(
    async (id: string, newStatus: TicketStatus): Promise<void> => {
      if (!activeProfile) return;

      const target = tickets.find((t) => t.id === id);
      if (!target || target.status === newStatus) return;

      const previousTickets = [...tickets];
      const now = new Date().toISOString();

      // Optimistic update
      setTickets((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                status: newStatus,
                closedAt: newStatus === 'CLOSED' ? now : null,
                updatedAt: now,
              }
            : t
        )
      );

      try {
        const updated = await ticketService.moveTicketStatus(id, activeProfile.id, newStatus);
        setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
        if (selectedTicket?.id === id) {
          setSelectedTicket(updated);
        }
        if (newStatus === 'CLOSED') {
          celebrateProgress();
        }
      } catch (err: any) {
        // Rollback on failure
        setTickets(previousTickets);
        showToast('error', 'Failed to move ticket', err.message);
      }
    },
    [activeProfile, tickets, selectedTicket?.id, showToast, celebrateProgress]
  );

  // Delete Ticket (Soft Delete to 60-day Trash)
  const deleteTicket = useCallback(
    async (id: string): Promise<void> => {
      if (!activeProfile) return;
      const target = tickets.find((t) => t.id === id);
      const ticketNum = target?.ticketNumber || 'Ticket';

      const previousTickets = [...tickets];
      setTickets((prev) => prev.filter((t) => t.id !== id));

      try {
        await ticketService.deleteTicket(id, activeProfile.id);
        const updatedTrash = await ticketService.getDeletedTickets(activeProfile.id);
        setTrashTickets(updatedTrash);
        if (selectedTicket?.id === id) {
          setSelectedTicket(null);
        }
        showToast('info', `${ticketNum} Moved to Trash`, 'Recoverable for 60 days in Recently Deleted.');
      } catch (err: any) {
        // Rollback
        setTickets(previousTickets);
        showToast('error', 'Failed to delete ticket', err.message);
        throw err;
      }
    },
    [activeProfile, tickets, selectedTicket?.id, showToast]
  );

  // Restore Ticket from Trash
  const restoreTicket = useCallback(
    async (id: string): Promise<Ticket> => {
      if (!activeProfile) throw new Error('No active profile.');
      try {
        const restored = await ticketService.restoreTicket(id, activeProfile.id);
        setTickets((prev) => [...prev, restored]);
        const updatedTrash = await ticketService.getDeletedTickets(activeProfile.id);
        setTrashTickets(updatedTrash);
        showToast('success', `${restored.ticketNumber} Restored`, 'Ticket restored to active board.');
        return restored;
      } catch (err: any) {
        showToast('error', 'Failed to restore ticket', err.message);
        throw err;
      }
    },
    [activeProfile, showToast]
  );

  // Permanently Delete Ticket
  const permanentlyDeleteTicket = useCallback(
    async (id: string): Promise<void> => {
      if (!activeProfile) return;
      try {
        await ticketService.permanentDeleteTicket(id, activeProfile.id);
        setTrashTickets((prev) => prev.filter((a) => a.ticket.id !== id));
        showToast('info', 'Permanently Deleted', 'Ticket was permanently purged.');
      } catch (err: any) {
        showToast('error', 'Failed to delete permanently', err.message);
        throw err;
      }
    },
    [activeProfile, showToast]
  );

  // Empty Trash
  const emptyTrash = useCallback(async (): Promise<void> => {
    if (!activeProfile) return;
    try {
      await ticketService.emptyTrash(activeProfile.id);
      setTrashTickets([]);
      showToast('info', 'Trash Emptied', 'All items in recycle bin were permanently deleted.');
    } catch (err: any) {
      showToast('error', 'Failed to empty trash', err.message);
      throw err;
    }
  }, [activeProfile, showToast]);

  // Derived parent-child relationships
  const childrenCountMap = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const t of tickets) {
      if (t.parentTicketId) {
        map[t.parentTicketId] = (map[t.parentTicketId] || 0) + 1;
      }
    }
    return map;
  }, [tickets]);

  const getChildrenOfTicket = useCallback(
    (parentId: string) => {
      return tickets.filter((t) => t.parentTicketId === parentId);
    },
    [tickets]
  );

  const getParentOfTicket = useCallback(
    (childTicketOrId: Ticket | string) => {
      const parentId =
        typeof childTicketOrId === 'string'
          ? tickets.find((t) => t.id === childTicketOrId)?.parentTicketId
          : childTicketOrId.parentTicketId;
      if (!parentId) return null;
      return tickets.find((t) => t.id === parentId) || null;
    },
    [tickets]
  );

  const openCreateChildTicket = useCallback(
    (parentTicket: Ticket) => {
      setPresetParentTicketId(parentTicket.id);
      setSelectedTicket(null);
      setIsCreateTicketModalOpen(true);
    },
    []
  );

  // Toggle Theme
  const toggleTheme = useCallback(async () => {
    const nextTheme: 'light' | 'dark' = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (activeProfile) {
      const currentSettings: UserSettings = {
        profileId: activeProfile.id,
        theme: nextTheme,
        defaultView: activeTab,
      };
      await settingsService.updateSettings(currentSettings);
    }
  }, [theme, activeProfile, activeTab]);

  // Derived Statistics directly from canonical tickets
  const stats = useMemo<DashboardStats>(() => {
    return ticketService.calculateStats(tickets);
  }, [tickets]);

  // Filtered & Sorted Tickets
  const filteredTickets = useMemo<Ticket[]>(() => {
    const filtered = ticketService.filterTickets(tickets, filters);
    return ticketService.sortTickets(filtered, sort);
  }, [tickets, filters, sort]);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // Load Demo Data for active profile
  const loadDemoData = useCallback(async () => {
    if (!activeProfile) return;
    try {
      setIsLoading(true);
      const demoItems = getDemoTickets(activeProfile.id);
      
      // Create first item (parent)
      const parentTicket = await ticketService.createTicket(demoItems[0]);
      
      // Create second item
      await ticketService.createTicket(demoItems[1]);

      // Create third item as a CHILD of the first item!
      const childItem = {
        ...demoItems[2],
        title: 'Child Task: Implement LocalStorageAdapter with 60-day trash archive',
        description: '<p>Part of architecture implementation: establish local key-value storage separation and soft-delete retention.</p>',
        parentTicketId: parentTicket.id,
      };
      await ticketService.createTicket(childItem);

      // Create remaining items
      for (let i = 3; i < demoItems.length; i++) {
        await ticketService.createTicket(demoItems[i]);
      }

      await loadTicketsForProfile(activeProfile.id);
      showToast('success', 'Demo Data Loaded', `Added demo tickets including parent-child hierarchy and rich descriptions.`);
    } catch (err: any) {
      showToast('error', 'Failed to load demo data', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [activeProfile, loadTicketsForProfile, showToast]);

  // Clear all tickets for active profile
  const clearAllTickets = useCallback(async () => {
    if (!activeProfile) return;
    try {
      setIsLoading(true);
      await ticketRepo.deleteAllForProfile(activeProfile.id);
      setTickets([]);
      setTrashTickets([]);
      showToast('info', 'Workspace Cleared', 'All tickets have been removed from this profile.');
    } catch (err: any) {
      showToast('error', 'Failed to clear tickets', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [activeProfile, showToast]);

  return (
    <AppContext.Provider
      value={{
        profiles,
        activeProfile,
        createProfile,
        updateProfile,
        deleteProfile,
        switchProfile,
        tickets,
        filteredTickets,
        stats,
        createTicket,
        updateTicket,
        deleteTicket,
        moveTicketStatus,
        childrenCountMap,
        getChildrenOfTicket,
        getParentOfTicket,
        openCreateChildTicket,
        presetParentTicketId,
        setPresetParentTicketId,
        trashTickets,
        loadTrashTickets,
        restoreTicket,
        permanentlyDeleteTicket,
        emptyTrash,
        isTrashModalOpen,
        setIsTrashModalOpen,
        filters,
        setFilters,
        resetFilters,
        sort,
        setSort,
        activeTab,
        setActiveTab,
        theme,
        toggleTheme,
        celebrateProgress,
        lastCelebratedAt,
        isCreateTicketModalOpen,
        setIsCreateTicketModalOpen,
        selectedTicket,
        setSelectedTicket,
        isProfileModalOpen,
        setIsProfileModalOpen,
        loadDemoData,
        clearAllTickets,
        toasts,
        showToast,
        dismissToast,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
