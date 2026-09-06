export type TicketStatus = 'TODO' | 'IN_PROGRESS' | 'CLOSED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TicketType = 'TASK' | 'BUG' | 'IMPROVEMENT' | 'PERSONAL' | 'OTHER';

export interface Profile {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  profileId: string;
  ticketNumber: string; // e.g. TASK-001
  parentTicketId?: string | null; // ID of parent ticket, or null/undefined if standalone
  title: string;
  description?: string;
  status: TicketStatus;
  priority: TicketPriority;
  type: TicketType;
  startDate?: string; // YYYY-MM-DD
  originalEndDate?: string; // YYYY-MM-DD
  extensionPeriod?: number; // Days extended (e.g., 3 days)
  revisedEndDate?: string; // Calculated: originalEndDate + extensionPeriod
  blockers?: string[]; // List of active blockers
  notes?: string;
  tags?: string[];
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  closedAt?: string | null; // ISO date when moved to CLOSED
  deletedAt?: string | null; // ISO date if soft-deleted, null if active
}

export type AppTab = 'dashboard' | 'kanban' | 'list' | 'analysis';

export interface DeletedTicketArchive {
  schemaVersion: number;
  deletedAt: string; // ISO date
  expiresAt: string; // ISO date (deletedAt + 60 days)
  ticket: Ticket;
}

export interface UserSettings {
  profileId: string;
  theme: 'light' | 'dark';
  defaultView?: AppTab;
}

export interface DashboardStats {
  total: number;
  todo: number;
  inProgress: number;
  closed: number;
  blocked: number;
  overdue: number;
  extended: number;
  completionRate: number; // 0 - 100 percentage
}

export interface FilterState {
  search: string;
  status: 'ALL' | TicketStatus;
  priority: 'ALL' | TicketPriority;
  type: 'ALL' | TicketType;
  onlyBlocked: boolean;
  onlyOverdue: boolean;
  onlyExtended: boolean;
}

export type SortField = 'priority' | 'deadline' | 'startDate' | 'createdAt' | 'updatedAt' | 'ticketNumber';
export type SortDirection = 'asc' | 'desc';

export interface SortOption {
  field: SortField;
  direction: SortDirection;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}
